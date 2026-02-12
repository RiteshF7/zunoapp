"""Shared tag management service.

Consolidates duplicated tag upsert logic from:
- app/routers/ai.py (process_content tag creation)
- scripts/reprocess_content.py (tag re-creation)
"""

from __future__ import annotations

import logging
import re
from typing import Any

from supabase import Client

logger = logging.getLogger(__name__)


def upsert_tags(
    db: Client,
    content_id: str,
    tag_names: list[str],
) -> list[dict[str, Any]]:
    """Create/upsert tags and link them to a content item.

    For each tag name:
    1. Generate a URL-safe slug.
    2. Upsert into the ``tags`` table.
    3. Link to the content via ``content_tags``.
    4. Increment the tag's ``usage_count``.

    Returns the list of tag records created/updated.
    """
    created_tags: list[dict[str, Any]] = []

    for tag_name in tag_names:
        slug = re.sub(r"[^a-z0-9]+", "-", tag_name.lower()).strip("-")
        if not slug:
            continue

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
            created_tags.append(tag)

            # Link tag to content
            db.table("content_tags").upsert(
                {
                    "content_id": content_id,
                    "tag_id": tag["id"],
                    "is_ai_assigned": True,
                },
                on_conflict="content_id,tag_id",
            ).execute()

            # Increment usage count
            db.table("tags").update(
                {"usage_count": (tag.get("usage_count") or 0) + 1}
            ).eq("id", tag["id"]).execute()

    return created_tags
