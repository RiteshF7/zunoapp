"""User interests service — track content consumption patterns.

Extracted from app/routers/ai.py to avoid duplication and allow
reuse from other parts of the system (e.g., batch reprocessing).
"""

from __future__ import annotations

from datetime import datetime, timezone

from supabase import Client


def update_user_interests(
    db: Client,
    user_id: str,
    category: str,
    tags: list[str],
    platform: str,
    content_type: str,
) -> None:
    """Increment user interest counters for categories, tags, platforms, and content types."""
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
