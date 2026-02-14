"""AI endpoints — replaces all 3 Supabase Edge Functions."""

import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from supabase import Client

from app.config import Settings, get_settings
from app.dependencies import get_current_user, get_supabase
from app.schemas.models import (
    ProcessContentRequest,
    ProcessContentResponse,
    GenerateEmbeddingRequest,
    GenerateEmbeddingResponse,
    GenerateFeedResponse,
)
from app.services.ai_service import process_with_ai, generate_embedding, _get_provider
from app.services.metadata_service import fetch_url_metadata
from app.services.collection_manager import ensure_category_collection
from app.services.content_indexing import index_content_chunks
from app.services.tag_service import upsert_tags
from app.services.user_interests import update_user_interests
from app.services.feed_service import get_top_n, generate_ai_feed, generate_rule_feed
from app.services.goal_engine import analyze_and_update_goals
from app.utils.rate_limit import limiter, RATE_AI_PROCESS, RATE_AI_EMBEDDING, RATE_AI_FEED
from app.utils.cache import bust_cache
from app.utils.url_detect import detect_platform

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])


async def _run_process_content_background(
    content_id: str,
    content: dict,
    settings: Settings,
    db: Client,
) -> None:
    """Run full AI processing in background (metadata, LLM, embedding, DB update, tags, goals)."""
    try:
        metadata = await fetch_url_metadata(content["url"])
        text_parts = [
            f"Title: {metadata.title or content.get('title') or ''}",
            f"Description: {metadata.description or content.get('description') or ''}",
            f"URL: {content['url']}",
        ]
        if metadata.body_text:
            text_parts.append(f"\n--- Full Page Content ---\n{metadata.body_text}")
        text_to_analyze = "\n\n".join(part for part in text_parts if part)

        ai_result = await process_with_ai(text_to_analyze, settings)
        detected_platform = detect_platform(content["url"])
        update_payload: dict = {
            "title": content.get("title") or metadata.title or ai_result.get("title"),
            "description": content.get("description") or metadata.description,
            "thumbnail_url": content.get("thumbnail_url") or metadata.thumbnail,
            "platform": detected_platform,
            "ai_category": ai_result["category"],
            "ai_summary": ai_result["summary"],
            "ai_processed": True,
        }
        if ai_result.get("structured_content"):
            update_payload["ai_structured_content"] = ai_result["structured_content"]
        if ai_result.get("embedding"):
            update_payload["embedding"] = ai_result["embedding"]

        db.table("content").update(update_payload).eq("id", content_id).execute()

        if metadata.body_text or text_to_analyze:
            full_text = metadata.body_text or text_to_analyze
            db.table("content").update({"full_text": full_text}).eq("id", content_id).execute()
            if settings.gcp_project_id:
                try:
                    await index_content_chunks(
                        db=db,
                        content_id=content_id,
                        user_id=content["user_id"],
                        text=full_text,
                        content_metadata={
                            "title": update_payload.get("title", ""),
                            "platform": detected_platform,
                            "url": content["url"],
                            "category": ai_result["category"],
                        },
                        settings=settings,
                    )
                except Exception as exc:
                    logger.warning("RAG chunking failed for %s (non-fatal): %s", content_id, exc)

        ensure_category_collection(db, content["user_id"], ai_result["category"], content_id)
        upsert_tags(db, content_id, ai_result.get("tags", []))
        update_user_interests(
            db,
            content["user_id"],
            ai_result["category"],
            ai_result.get("tags", []),
            detected_platform,
            content.get("content_type", "post"),
        )
        try:
            await analyze_and_update_goals(
                db=db,
                user_id=content["user_id"],
                new_content=content,
                ai_result=ai_result,
                settings=settings,
            )
        except Exception as exc:
            logger.warning("Goal analysis failed for %s (non-fatal): %s", content_id, exc)
        bust_cache("popular_tags:*")
        bust_cache("categories:*")
        logger.info("Background AI processing completed for content %s", content_id)
    except Exception as exc:
        logger.error("Background AI processing failed for content %s: %s", content_id, exc, exc_info=True)


# ---------------------------------------------------------------------------
# POST /api/ai/process-content
# ---------------------------------------------------------------------------
@router.post("/process-content")
@limiter.limit(RATE_AI_PROCESS)
async def process_content(
    request: Request,
    body: ProcessContentRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
    settings: Settings = Depends(get_settings),
):
    """Start AI processing for content. Returns 202 immediately; work runs in background."""
    content_id = body.content_id

    result = db.table("content").select("*").eq("id", content_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Content not found")
    content = result.data

    background_tasks.add_task(
        _run_process_content_background,
        content_id,
        content,
        settings,
        db,
    )
    return JSONResponse(
        status_code=202,
        content={
            "success": True,
            "message": "Processing started",
            "content_id": content_id,
        },
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
    if settings.gcp_project_id:
        try:
            provider = _get_provider(settings)
            feed_items = await generate_ai_feed(
                settings, provider, top_categories, top_tags, top_platforms, interests
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


