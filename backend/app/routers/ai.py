"""AI endpoints — replaces all 3 Supabase Edge Functions."""

import logging
import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from supabase import Client

from app.config import Settings, get_settings
from app.dependencies import get_current_user, get_supabase
from app.schemas.models import (
    ProcessContentRequest,
    ProcessContentResponse,
    GenerateEmbeddingRequest,
    GenerateEmbeddingResponse,
    GenerateFeedResponse,
    FeedItemOut,
)
from app.services.openai_service import process_with_ai, generate_embedding
from app.services.metadata_service import fetch_url_metadata
from app.services.collection_manager import ensure_category_collection
from app.services.feed_generator import (
    get_top_n,
    generate_ai_feed,
    generate_rule_feed,
)
from app.utils.rate_limit import limiter, RATE_AI_PROCESS, RATE_AI_EMBEDDING, RATE_AI_FEED
from app.utils.cache import bust_cache

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["ai"])


# ---------------------------------------------------------------------------
# POST /api/ai/process-content
# ---------------------------------------------------------------------------
@router.post("/process-content", response_model=ProcessContentResponse)
@limiter.limit(RATE_AI_PROCESS)
async def process_content(
    request: Request,
    body: ProcessContentRequest,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
    settings: Settings = Depends(get_settings),
):
    """Scrape URL metadata, run AI categorization/summary/tags/embedding, update DB."""
    content_id = body.content_id

    # 1. Fetch the content item
    result = db.table("content").select("*").eq("id", content_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Content not found")
    content = result.data

    # 2. Fetch URL metadata
    metadata = await fetch_url_metadata(content["url"])

    # 3. Build text for AI analysis (include full body text for deep extraction)
    text_parts = [
        f"Title: {metadata.title or content.get('title') or ''}",
        f"Description: {metadata.description or content.get('description') or ''}",
        f"URL: {content['url']}",
    ]
    # Append full page body text when available for deeper AI analysis
    if metadata.body_text:
        text_parts.append(f"\n--- Full Page Content ---\n{metadata.body_text}")
    text_to_analyze = "\n\n".join(part for part in text_parts if part)

    # 4. AI processing
    try:
        ai_result = await process_with_ai(text_to_analyze, settings)
    except Exception as exc:
        logger.error("AI processing failed for content %s: %s", content_id, exc)
        raise HTTPException(status_code=502, detail=f"AI processing failed: {exc}")

    # 5. Update content record
    detected_platform = _detect_platform(content["url"])
    update_payload: dict = {
        "title": content.get("title") or metadata.title or ai_result.get("title"),
        "description": content.get("description") or metadata.description,
        "thumbnail_url": content.get("thumbnail_url") or metadata.thumbnail,
        "platform": detected_platform,
        "ai_category": ai_result["category"],
        "ai_summary": ai_result["summary"],
        "ai_processed": True,
    }
    # Store structured AI content (key_points, action_items, tldr, save_motive)
    if ai_result.get("structured_content"):
        update_payload["ai_structured_content"] = ai_result["structured_content"]

    # Only set embedding if available
    if ai_result.get("embedding"):
        update_payload["embedding"] = ai_result["embedding"]

    db.table("content").update(update_payload).eq("id", content_id).execute()

    # 5b. Auto-create / link smart collection for this category
    ensure_category_collection(db, content["user_id"], ai_result["category"], content_id)

    # 6. Create and assign tags
    for tag_name in ai_result.get("tags", []):
        slug = re.sub(r"[^a-z0-9]+", "-", tag_name.lower()).strip("-")

        # Upsert tag
        tag_result = (
            db.table("tags")
            .upsert(
                {"name": tag_name, "slug": slug, "is_ai_generated": True},
                on_conflict="slug",
            )
            .execute()
        )

        if tag_result.data:
            tag = tag_result.data[0]
            # Link tag to content
            db.table("content_tags").upsert(
                {"content_id": content_id, "tag_id": tag["id"], "is_ai_assigned": True},
                on_conflict="content_id,tag_id",
            ).execute()

            # Increment usage count
            db.table("tags").update(
                {"usage_count": (tag.get("usage_count") or 0) + 1}
            ).eq("id", tag["id"]).execute()

    # 7. Update user interest profile
    _update_user_interests(
        db,
        content["user_id"],
        ai_result["category"],
        ai_result.get("tags", []),
        detected_platform,
        content.get("content_type", "post"),
    )

    # 8. Bust caches that may be stale now
    bust_cache("popular_tags:*")
    bust_cache("categories:*")

    return ProcessContentResponse(
        success=True,
        category=ai_result["category"],
        summary=ai_result["summary"],
        tags=ai_result.get("tags", []),
    )


# ---------------------------------------------------------------------------
# POST /api/ai/generate-embedding
# ---------------------------------------------------------------------------
@router.post("/generate-embedding", response_model=GenerateEmbeddingResponse)
@limiter.limit(RATE_AI_EMBEDDING)
async def generate_embedding_endpoint(
    request: Request,
    body: GenerateEmbeddingRequest,
    user_id: str = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
):
    """Generate an embedding vector for the given text."""
    embedding = await generate_embedding(body.text, settings)
    if embedding is None:
        raise HTTPException(status_code=502, detail="Embedding generation failed")
    return GenerateEmbeddingResponse(embedding=embedding)


# ---------------------------------------------------------------------------
# POST /api/ai/generate-feed
# ---------------------------------------------------------------------------
@router.post("/generate-feed", response_model=GenerateFeedResponse)
@limiter.limit(RATE_AI_FEED)
async def generate_feed(
    request: Request,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
    settings: Settings = Depends(get_settings),
):
    """Read user interests and generate AI-powered feed recommendations."""
    # Get user interest profile
    interests_result = (
        db.table("user_interests")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )
    interests_data = interests_result.data

    if not interests_data or interests_data[0].get("total_saved", 0) == 0:
        return GenerateFeedResponse(
            items=[],
            message="Save more content to get personalized recommendations!",
        )

    interests = interests_data[0]
    top_categories = get_top_n(interests.get("categories", {}), 5)
    top_tags = get_top_n(interests.get("tags", {}), 10)
    top_platforms = get_top_n(interests.get("platforms", {}), 3)

    # Generate feed items
    if settings.openai_api_key:
        try:
            feed_items = await generate_ai_feed(
                settings, top_categories, top_tags, top_platforms, interests
            )
        except Exception as exc:
            logger.warning("AI feed generation failed, using rule-based: %s", exc)
            feed_items = generate_rule_feed(
                top_categories, top_tags, top_platforms, interests
            )
    else:
        feed_items = generate_rule_feed(
            top_categories, top_tags, top_platforms, interests
        )

    # Upsert feed items into DB
    for item in feed_items:
        db.table("feed_items").upsert(item, on_conflict="source_url").execute()

    # Bust feed cache so next GET /api/feed picks up new items
    bust_cache("feed:*")

    # Return the latest feed
    feed_result = (
        db.table("feed_items")
        .select("*")
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )

    return GenerateFeedResponse(
        items=feed_result.data or [],
        interests=top_categories,
    )


# ---------------------------------------------------------------------------
# Helper: detect platform from URL
# ---------------------------------------------------------------------------
_PLATFORM_PATTERNS: list[tuple[str, str]] = [
    ("instagram.com", "instagram"),
    ("youtube.com", "youtube"),
    ("youtu.be", "youtube"),
    ("twitter.com", "twitter"),
    ("x.com", "twitter"),
    ("facebook.com", "facebook"),
    ("fb.com", "facebook"),
    ("linkedin.com", "linkedin"),
    ("tiktok.com", "tiktok"),
    ("reddit.com", "reddit"),
    ("pinterest.com", "pinterest"),
    ("spotify.com", "spotify"),
    ("medium.com", "medium"),
]


def _detect_platform(url: str) -> str:
    """Detect the platform from a URL's domain."""
    url_lower = url.lower()
    for domain, platform in _PLATFORM_PATTERNS:
        if domain in url_lower:
            return platform
    return "other"


# ---------------------------------------------------------------------------
# Helper: update user interests
# ---------------------------------------------------------------------------
def _update_user_interests(
    db: Client,
    user_id: str,
    category: str,
    tags: list[str],
    platform: str,
    content_type: str,
) -> None:
    """Increment user interest counters."""
    existing_result = (
        db.table("user_interests")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )

    if existing_result.data:
        existing = existing_result.data[0]

        categories = {**existing.get("categories", {})}
        categories[category] = categories.get(category, 0) + 1

        tag_counts = {**existing.get("tags", {})}
        for tag in tags:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1

        platforms = {**existing.get("platforms", {})}
        platforms[platform] = platforms.get(platform, 0) + 1

        content_types = {**existing.get("content_types", {})}
        content_types[content_type] = content_types.get(content_type, 0) + 1

        db.table("user_interests").update(
            {
                "categories": categories,
                "tags": tag_counts,
                "platforms": platforms,
                "content_types": content_types,
                "total_saved": existing.get("total_saved", 0) + 1,
                "last_updated": datetime.now(timezone.utc).isoformat(),
            }
        ).eq("user_id", user_id).execute()
    else:
        db.table("user_interests").insert(
            {
                "user_id": user_id,
                "categories": {category: 1},
                "tags": {t: 1 for t in tags},
                "platforms": {platform: 1},
                "content_types": {content_type: 1},
                "total_saved": 1,
            }
        ).execute()
