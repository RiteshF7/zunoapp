"""Auto-create smart collections based on AI categories."""

from __future__ import annotations

import logging
from typing import Any

from supabase import Client

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Category → icon / theme mapping
# ---------------------------------------------------------------------------
CATEGORY_MAP: dict[str, dict[str, str]] = {
    "Cooking":        {"icon": "restaurant",       "theme": "amber"},
    "Tech":           {"icon": "memory",            "theme": "blue"},
    "Travel":         {"icon": "flight",            "theme": "green"},
    "Fitness":        {"icon": "fitness_center",    "theme": "rose"},
    "Finance":        {"icon": "account_balance",   "theme": "indigo"},
    "Design":         {"icon": "palette",           "theme": "purple"},
    "Health":         {"icon": "favorite",          "theme": "rose"},
    "Education":      {"icon": "school",            "theme": "blue"},
    "Entertainment":  {"icon": "movie",             "theme": "purple"},
    "Lifestyle":      {"icon": "self_improvement",  "theme": "green"},
    "Business":       {"icon": "business_center",   "theme": "indigo"},
    "Science":        {"icon": "science",           "theme": "blue"},
    "Sports":         {"icon": "sports_soccer",     "theme": "green"},
    "Music":          {"icon": "music_note",        "theme": "purple"},
    "Art":            {"icon": "brush",             "theme": "amber"},
    "Food":           {"icon": "restaurant",        "theme": "amber"},
    "Fashion":        {"icon": "checkroom",         "theme": "rose"},
    "Gaming":         {"icon": "sports_esports",    "theme": "indigo"},
    "News":           {"icon": "newspaper",         "theme": "blue"},
    "Photography":    {"icon": "photo_camera",      "theme": "amber"},
    "Programming":    {"icon": "code",              "theme": "blue"},
    "Marketing":      {"icon": "campaign",          "theme": "rose"},
    "Productivity":   {"icon": "task_alt",          "theme": "green"},
    "Shopping":       {"icon": "shopping_bag",      "theme": "amber"},
    "Social Media":   {"icon": "share",             "theme": "purple"},
}

_DEFAULT_ICON = "folder"
_DEFAULT_THEME = "blue"

# Cycle through themes for unknown categories
_THEME_CYCLE = ["blue", "green", "purple", "amber", "rose", "indigo"]


def _get_category_style(category: str) -> dict[str, str]:
    """Return icon and theme for a given category, with a sensible fallback."""
    if category in CATEGORY_MAP:
        return CATEGORY_MAP[category]
    # Fallback: pick a theme based on hash of category name for consistency
    idx = hash(category) % len(_THEME_CYCLE)
    return {"icon": _DEFAULT_ICON, "theme": _THEME_CYCLE[idx]}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def ensure_category_collection(
    db: Client,
    user_id: str,
    category: str,
    content_id: str,
) -> dict[str, Any] | None:
    """
    Find or create a smart collection for the given AI category,
    then link the content item to it.

    Returns the collection dict or None on failure.
    """
    if not category or category == "Uncategorized":
        return None

    try:
        # 1. Look for an existing smart collection matching this category
        existing = (
            db.table("collections")
            .select("*")
            .eq("user_id", user_id)
            .eq("is_smart", True)
            .execute()
        )

        collection = None
        for row in existing.data or []:
            rules = row.get("smart_rules") or {}
            if rules.get("category") == category:
                collection = row
                break

        # 2. Create one if it doesn't exist
        if collection is None:
            style = _get_category_style(category)
            insert_result = (
                db.table("collections")
                .insert({
                    "user_id": user_id,
                    "title": category,
                    "description": f"Auto-collected {category} content",
                    "icon": style["icon"],
                    "theme": style["theme"],
                    "is_smart": True,
                    "smart_rules": {"category": category},
                    "item_count": 0,
                })
                .execute()
            )
            if not insert_result.data:
                logger.error("Failed to create smart collection for %s", category)
                return None
            collection = insert_result.data[0]
            logger.info(
                "Created smart collection '%s' (id=%s) for user %s",
                category,
                collection["id"],
                user_id,
            )

        collection_id = collection["id"]

        # 3. Link content to the collection (upsert to avoid duplicates)
        db.table("collection_items").upsert(
            {"collection_id": collection_id, "content_id": content_id},
            on_conflict="collection_id,content_id",
        ).execute()

        # 4. Increment the item count
        db.rpc(
            "increment_collection_count",
            {"collection_id": collection_id},
        ).execute()

        logger.info(
            "Added content %s to collection '%s' (%s)",
            content_id,
            category,
            collection_id,
        )
        return collection

    except Exception as exc:
        logger.error(
            "ensure_category_collection failed for category=%s content=%s: %s",
            category,
            content_id,
            exc,
        )
        return None
