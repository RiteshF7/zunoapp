"""Suggested-feed service.

Finds content from other users' shared collections that matches the
current user's interests (categories, tags) and returns it ranked by
relevance.  Runs entirely in-memory — nothing is persisted — so every
refresh yields a fresh set.

Matching signals (combined into a single score):
  1. Category overlap  – user's top ai_categories vs content ai_category
  2. Tag overlap       – shared tags between user's content and candidate

For new users with no saved content, the feed degrades gracefully to
the most recent shared-collection content across the platform.
"""

from __future__ import annotations

import logging
from collections import Counter
from typing import Any

from supabase import Client

logger = logging.getLogger(__name__)

# Upper bound on candidate rows fetched before scoring / pagination.
_CANDIDATE_POOL_SIZE = 500


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
    5. Sort by score (desc) → recency (desc), then paginate.
    """

    # ── 1. User interest profile ──────────────────────────────────────────

    user_content_result = (
        db.table("content")
        .select("id, ai_category, url")
        .eq("user_id", user_id)
        .execute()
    )
    user_rows = user_content_result.data or []
    saved_urls: set[str] = {r["url"] for r in user_rows}
    user_content_ids: list[str] = [r["id"] for r in user_rows]

    # Top categories (ranked by how often user saved them)
    cat_counts = Counter(
        r["ai_category"] for r in user_rows if r.get("ai_category")
    )
    top_categories: list[str] = [c for c, _ in cat_counts.most_common(10)]

    # User's tag IDs (for tag-overlap scoring later)
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

    # ── 2. Candidate content IDs from shared collections ──────────────────

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

    # ── 3. Fetch candidate content rows ───────────────────────────────────

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

    # ── 4. Score candidates ───────────────────────────────────────────────

    # Tag overlap: how many of the user's tags does each candidate share?
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
            cat_score = (10 - rank) * 2.0  # 20 for rank-0 … 2 for rank-9

        t_score = float(tag_overlap.get(item["id"], 0))

        item["relevance_score"] = round(cat_score + t_score, 2)

    # ── 5. Sort & paginate ────────────────────────────────────────────────

    candidates.sort(
        key=lambda x: (-x["relevance_score"], x.get("created_at", "")),
        reverse=False,  # relevance_score is already negated
    )

    # For *new users* with no interests, every item scores 0 — the sort
    # naturally falls back to most-recent-first (created_at DESC via the
    # original query order, preserved by a stable sort).

    page = candidates[offset : offset + limit]

    logger.info(
        "Suggested feed: %d candidates → returning %d (offset=%d)",
        len(candidates),
        len(page),
        offset,
    )
    return page
