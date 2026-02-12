"""Unified feed service — all feed generation strategies in one place.

Consolidates:
- AI feed generation (from ai_service.py)
- Rule-based fallback (from feed_generator.py)
- Suggested feed from shared collections (from suggested_feed_service.py)
"""

from __future__ import annotations

import json
import logging
import random
from collections import Counter
from typing import Any
from urllib.parse import quote

from supabase import Client

from app.config import Settings
from app.prompts import get_prompt
from app.services.ai_provider import AIProvider

logger = logging.getLogger(__name__)

# Upper bound on candidate rows fetched before scoring / pagination.
_CANDIDATE_POOL_SIZE = 500


# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------

def get_top_n(obj: dict[str, int], n: int) -> list[tuple[str, int]]:
    """Return the top-N items from a {key: count} dict, sorted descending."""
    return sorted(obj.items(), key=lambda x: x[1], reverse=True)[:n]


# ---------------------------------------------------------------------------
# AI-powered feed generation
# ---------------------------------------------------------------------------

async def generate_ai_feed(
    settings: Settings,
    provider: AIProvider,
    top_categories: list[tuple[str, int]],
    top_tags: list[tuple[str, int]],
    top_platforms: list[tuple[str, int]],
    interests: dict[str, Any],
) -> list[dict[str, Any]]:
    """Generate personalized feed recommendations via the AI provider."""
    prompt_config = get_prompt("feed_generation")
    system_prompt = prompt_config["system"]
    temperature = prompt_config.get("temperature", 0.8)

    user_prompt = prompt_config["user_template"].format(
        top_categories=", ".join(f"{c} ({n} saved)" for c, n in top_categories),
        top_tags=", ".join(f"{t} ({n})" for t, n in top_tags),
        top_platforms=", ".join(p for p, _ in top_platforms),
        total_saved=interests.get("total_saved", 0),
    )

    raw_json = await provider.generate_text(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        temperature=temperature,
        max_tokens=2048,
        json_mode=True,
    )

    content = json.loads(raw_json)
    items = (
        content
        if isinstance(content, list)
        else content.get("items") or content.get("recommendations") or []
    )

    return [
        {
            "title": item.get("title", ""),
            "description": item.get("description", ""),
            "image_url": (
                f"https://picsum.photos/seed/"
                f"{quote(str(item.get('title', ''))[:10])}/400/250"
            ),
            "source_url": item.get("source_url", ""),
            "category": item.get("category", ""),
            "content_type": item.get("content_type", "article"),
            "platform": item.get("platform", "other"),
            "likes": item.get("likes", random.randint(500, 10000)),
            "relevance_score": random.random() * 0.5 + 0.5,
            "reason": item.get("reason", ""),
        }
        for item in items
    ]


# ---------------------------------------------------------------------------
# Rule-based fallback feed generation
# ---------------------------------------------------------------------------

def generate_rule_feed(
    top_categories: list[tuple[str, int]],
    top_tags: list[tuple[str, int]],
    top_platforms: list[tuple[str, int]],
    interests: dict[str, Any],
) -> list[dict[str, Any]]:
    """Generate a simple rule-based feed when no AI provider is available."""
    items: list[dict[str, Any]] = []

    for category, count in top_categories:
        items.append(
            {
                "title": f"Top {category} Content This Week",
                "description": f"Discover trending {category.lower()} content picked for you.",
                "image_url": f"https://picsum.photos/seed/{category}/400/250",
                "source_url": f"https://example.com/{category.lower()}",
                "category": category,
                "content_type": "article",
                "platform": top_platforms[0][0] if top_platforms else "other",
                "likes": random.randint(500, 5000),
                "relevance_score": 0.8,
                "reason": f"Because you saved {count} {category.lower()} items",
            }
        )

    return items


# ---------------------------------------------------------------------------
# Suggested feed from shared collections
# ---------------------------------------------------------------------------

async def get_suggested_feed(
    user_id: str,
    db: Client,
    *,
    limit: int = 20,
    offset: int = 0,
    category: str | None = None,
    content_type: str | None = None,
) -> list[dict[str, Any]]:
    """Return a paginated list of suggested content items with relevance scores.

    Steps
    -----
    1. Build a lightweight interest profile from the user's saved content.
    2. Collect candidate content IDs from other users' **shared** collections.
    3. Fetch candidate rows, excluding URLs the user already saved.
    4. Score each candidate by category rank + tag overlap.
    5. Sort by score (desc) then recency (desc), then paginate.
    """

    # -- 1. User interest profile --
    user_content_result = (
        db.table("content")
        .select("id, ai_category, url")
        .eq("user_id", user_id)
        .execute()
    )
    user_rows = user_content_result.data or []
    saved_urls: set[str] = {r["url"] for r in user_rows}
    user_content_ids: list[str] = [r["id"] for r in user_rows]

    cat_counts = Counter(
        r["ai_category"] for r in user_rows if r.get("ai_category")
    )
    top_categories: list[str] = [c for c, _ in cat_counts.most_common(10)]

    user_tag_ids: list[str] = []
    if user_content_ids:
        tag_rows = (
            db.table("content_tags")
            .select("tag_id")
            .in_("content_id", user_content_ids[:200])
            .execute()
        )
        user_tag_ids = list({r["tag_id"] for r in (tag_rows.data or [])})

    logger.info(
        "User %s interests: %d categories, %d tags, %d saved URLs",
        user_id,
        len(top_categories),
        len(user_tag_ids),
        len(saved_urls),
    )

    # -- 2. Candidate content IDs from shared collections --
    shared_cols = (
        db.table("collections")
        .select("id")
        .eq("is_shared", True)
        .neq("user_id", user_id)
        .execute()
    )
    shared_col_ids = [r["id"] for r in (shared_cols.data or [])]

    if not shared_col_ids:
        logger.info("No shared collections found from other users")
        return []

    items_result = (
        db.table("collection_items")
        .select("content_id")
        .in_("collection_id", shared_col_ids)
        .execute()
    )
    shared_content_ids = list(
        {r["content_id"] for r in (items_result.data or [])}
    )

    if not shared_content_ids:
        logger.info("No content items in shared collections")
        return []

    # -- 3. Fetch candidate content rows --
    query = (
        db.table("content")
        .select(
            "id, user_id, url, title, description, thumbnail_url, "
            "platform, content_type, ai_category, ai_summary, "
            "ai_structured_content, ai_processed, source_metadata, "
            "created_at, updated_at"
        )
        .in_("id", shared_content_ids[:_CANDIDATE_POOL_SIZE])
        .neq("user_id", user_id)
    )

    if category:
        query = query.eq("ai_category", category)
    if content_type:
        query = query.eq("content_type", content_type)

    result = query.order("created_at", desc=True).execute()
    candidates: list[dict[str, Any]] = result.data or []

    # Deduplicate by URL (exclude content user already saved)
    candidates = [c for c in candidates if c["url"] not in saved_urls]

    if not candidates:
        return []

    # -- 4. Score candidates --
    tag_overlap: Counter[str] = Counter()
    if user_tag_ids:
        candidate_ids = [c["id"] for c in candidates]
        ct_rows = (
            db.table("content_tags")
            .select("content_id, tag_id")
            .in_("content_id", candidate_ids[:_CANDIDATE_POOL_SIZE])
            .in_("tag_id", user_tag_ids)
            .execute()
        )
        tag_overlap = Counter(
            r["content_id"] for r in (ct_rows.data or [])
        )

    for item in candidates:
        cat_score = 0.0
        cat = item.get("ai_category")
        if cat and cat in top_categories:
            rank = top_categories.index(cat)
            cat_score = (10 - rank) * 2.0

        t_score = float(tag_overlap.get(item["id"], 0))
        item["relevance_score"] = round(cat_score + t_score, 2)

    # -- 5. Sort & paginate --
    candidates.sort(
        key=lambda x: (-x["relevance_score"], x.get("created_at", "")),
        reverse=False,
    )

    page = candidates[offset : offset + limit]

    logger.info(
        "Suggested feed: %d candidates -> returning %d (offset=%d)",
        len(candidates),
        len(page),
        offset,
    )
    return page
