"""Re-process existing content with the enhanced AI pipeline.

This script fetches all content that either:
  - Has no ai_structured_content yet, or
  - Was already AI-processed but with the old (summary-only) pipeline.

It re-runs the full AI extraction for each item and updates the DB.

Usage (from the backend directory):
    python reprocess_content.py            # process items missing structured content
    python reprocess_content.py --all      # re-process ALL content (even already structured)
"""

import asyncio
import logging
import re
import sys
from pathlib import Path

# Ensure app package is importable
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.config import get_settings
from app.services.ai_service import process_with_ai
from app.services.metadata_service import fetch_url_metadata
from app.services.collection_manager import ensure_category_collection
from supabase import create_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

settings = get_settings()
db = create_client(settings.supabase_url, settings.supabase_service_role_key)

# Platform detection (same as ai.py)
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
    url_lower = url.lower()
    for domain, platform in _PLATFORM_PATTERNS:
        if domain in url_lower:
            return platform
    return "other"


async def reprocess_item(content: dict) -> bool:
    """Re-process a single content item. Returns True on success."""
    content_id = content["id"]
    url = content["url"]
    logger.info("Processing %s — %s", content_id, url[:80])

    try:
        # 1. Fetch full page metadata + body text
        metadata = await fetch_url_metadata(url)

        # 2. Build enhanced text for AI
        text_parts = [
            f"Title: {metadata.title or content.get('title') or ''}",
            f"Description: {metadata.description or content.get('description') or ''}",
            f"URL: {url}",
        ]
        if metadata.body_text:
            text_parts.append(f"\n--- Full Page Content ---\n{metadata.body_text}")
        text_to_analyze = "\n\n".join(part for part in text_parts if part)

        # 3. AI processing
        ai_result = await process_with_ai(text_to_analyze, settings)

        # 4. Build update payload
        detected_platform = _detect_platform(url)
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

        # 5. Update DB
        db.table("content").update(update_payload).eq("id", content_id).execute()

        # 6. Ensure collection link
        ensure_category_collection(
            db, content["user_id"], ai_result["category"], content_id
        )

        # 7. Re-create tags
        for tag_name in ai_result.get("tags", []):
            slug = re.sub(r"[^a-z0-9]+", "-", tag_name.lower()).strip("-")
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
                db.table("content_tags").upsert(
                    {
                        "content_id": content_id,
                        "tag_id": tag["id"],
                        "is_ai_assigned": True,
                    },
                    on_conflict="content_id,tag_id",
                ).execute()

        logger.info("  -> OK  category=%s, key_points=%d, action_items=%d",
                     ai_result["category"],
                     len(ai_result.get("structured_content", {}).get("key_points", [])),
                     len(ai_result.get("structured_content", {}).get("action_items", [])))
        return True

    except Exception as exc:
        logger.error("  -> FAILED: %s", exc)
        return False


async def main():
    reprocess_all = "--all" in sys.argv

    # Fetch content to reprocess
    query = db.table("content").select("*").order("created_at", desc=True)

    if not reprocess_all:
        # Only items without structured content
        query = query.is_("ai_structured_content", "null")

    result = query.execute()
    items = result.data or []

    if not items:
        logger.info("No content items to reprocess.")
        return

    logger.info("Found %d content items to reprocess (--all=%s)", len(items), reprocess_all)

    success = 0
    failed = 0
    for item in items:
        ok = await reprocess_item(item)
        if ok:
            success += 1
        else:
            failed += 1
        # Small delay to avoid rate limits
        await asyncio.sleep(1)

    logger.info("Done! Success: %d, Failed: %d", success, failed)


if __name__ == "__main__":
    asyncio.run(main())
