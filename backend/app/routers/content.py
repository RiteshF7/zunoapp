"""Content CRUD + content-with-tags + share targets (text & image upload)."""

import logging
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile
from supabase import Client

from app.dependencies import get_current_user, get_supabase
from app.schemas.models import ContentOut, ContentCreate, ContentCreateText, ContentUpdate
from app.services.metadata_service import fetch_url_metadata
from app.utils.rate_limit import limiter, RATE_READ, RATE_WRITE
from app.utils.url_detect import detect_platform_and_type

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/content", tags=["content"])


@router.get("", response_model=list[ContentOut])
@limiter.limit(RATE_READ)
async def list_content(
    request: Request,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    category: str | None = None,
    platform: str | None = None,
    content_type: str | None = None,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """List content for the current user with optional filters."""
    query = (
        db.table("content")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
    )

    if category:
        query = query.eq("ai_category", category)
    if platform:
        query = query.eq("platform", platform)
    if content_type:
        query = query.eq("content_type", content_type)

    query = query.range(offset, offset + limit - 1)

    result = query.execute()
    return result.data or []


@router.get("/{content_id}", response_model=ContentOut)
@limiter.limit(RATE_READ)
async def get_content(
    request: Request,
    content_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Get a single content item."""
    result = (
        db.table("content")
        .select("*")
        .eq("id", content_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Content not found")
    return result.data


@router.post("", response_model=ContentOut, status_code=201)
@limiter.limit(RATE_WRITE)
async def create_content(
    request: Request,
    body: ContentCreate,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Save new content (user_id auto-set from JWT).

    Automatically:
    - Detects platform and content_type from the URL.
    - Scrapes the URL for title, description, thumbnail, author, etc.
    - Builds a rich description with topics, author, source, and media type.
    """
    payload = body.model_dump(exclude_none=True)
    payload["user_id"] = user_id

    # Auto-detect platform and content_type from URL
    detected_platform, detected_type = detect_platform_and_type(body.url)

    if body.platform in ("other", "web") or "platform" not in payload:
        payload["platform"] = detected_platform
    if body.content_type == "post" or "content_type" not in payload:
        payload["content_type"] = detected_type

    # Scrape URL metadata for title, description, thumbnail, author, etc.
    try:
        metadata = await fetch_url_metadata(body.url)
    except Exception as exc:
        logger.warning("Metadata scrape failed for %s (non-fatal): %s", body.url, exc)
        metadata = None

    if metadata:
        # Auto-fill title if not provided by client
        if not body.title and metadata.title:
            payload["title"] = metadata.title

        # Auto-fill thumbnail
        if not body.thumbnail_url and metadata.thumbnail:
            payload["thumbnail_url"] = metadata.thumbnail

        # Build a rich auto-description if client didn't provide one
        if not body.description:
            payload["description"] = _build_auto_description(
                metadata=metadata,
                platform=payload.get("platform", detected_platform),
                content_type=payload.get("content_type", detected_type),
            )

        # Store extended metadata in source_metadata JSON column
        source_meta: dict = {}
        if metadata.author:
            source_meta["author"] = metadata.author
        if metadata.site_name:
            source_meta["site_name"] = metadata.site_name
        if metadata.og_type:
            source_meta["og_type"] = metadata.og_type
        if metadata.keywords:
            source_meta["keywords"] = metadata.keywords
        if source_meta:
            payload["source_metadata"] = source_meta

    result = db.table("content").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create content")
    return result.data[0]


@router.post("/text", response_model=ContentOut, status_code=201)
@limiter.limit(RATE_WRITE)
async def create_text_content(
    request: Request,
    body: ContentCreateText,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Save plain-text content shared from another app (no URL required).

    Uses a placeholder URL (zuno://note/<uuid>) so the existing DB schema
    is satisfied.  The shared text is stored in `full_text` and a truncated
    version becomes the description.
    """
    note_id = uuid.uuid4().hex[:12]
    title = body.title
    if not title:
        # Auto-generate title from first line of text
        first_line = body.source_text.split("\n", 1)[0].strip()
        title = first_line[:80] + ("..." if len(first_line) > 80 else "")

    description = body.description
    if not description:
        description = body.source_text[:300] + ("..." if len(body.source_text) > 300 else "")

    payload = {
        "user_id": user_id,
        "url": f"zuno://note/{note_id}",
        "title": title,
        "description": description,
        "full_text": body.source_text,
        "platform": body.platform,
        "content_type": body.content_type,
    }

    result = db.table("content").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save text content")
    return result.data[0]


@router.post("/upload", response_model=ContentOut, status_code=201)
@limiter.limit(RATE_WRITE)
async def upload_image_content(
    request: Request,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Upload an image shared from another app and create a content entry.

    The image is stored in Supabase Storage (bucket: ``content-images``)
    and a content row is created with the public URL.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are accepted")

    # Read file bytes
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(status_code=400, detail="Image must be under 10 MB")

    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
    storage_path = f"{user_id}/{uuid.uuid4().hex}.{ext}"

    # Upload to Supabase Storage
    try:
        db.storage.from_("content-images").upload(
            path=storage_path,
            file=data,
            file_options={"content-type": file.content_type},
        )
    except Exception as exc:
        logger.error("Supabase storage upload failed: %s", exc)
        raise HTTPException(status_code=500, detail="Image upload failed")

    # Build public URL
    public_url = db.storage.from_("content-images").get_public_url(storage_path)

    payload = {
        "user_id": user_id,
        "url": public_url,
        "title": file.filename or "Shared Image",
        "description": "Image shared to Zuno",
        "thumbnail_url": public_url,
        "platform": "other",
        "content_type": "image",
    }

    result = db.table("content").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create content for uploaded image")
    return result.data[0]


@router.patch("/{content_id}", response_model=ContentOut)
@limiter.limit(RATE_WRITE)
async def update_content(
    request: Request,
    content_id: str,
    body: ContentUpdate,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Update content."""
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        db.table("content")
        .update(updates)
        .eq("id", content_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Content not found")
    return result.data[0]


@router.delete("/{content_id}", status_code=204)
@limiter.limit(RATE_WRITE)
async def delete_content(
    request: Request,
    content_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Delete content."""
    db.table("content").delete().eq("id", content_id).eq(
        "user_id", user_id
    ).execute()
    return None


@router.get("/{content_id}/tags")
@limiter.limit(RATE_READ)
async def get_content_with_tags(
    request: Request,
    content_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Get content with its joined tags."""
    result = (
        db.table("content")
        .select("*, content_tags (tag:tag_id (id, name, slug, is_ai_generated))")
        .eq("id", content_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Content not found")
    return result.data


# ---------------------------------------------------------------------------
# Helper: build a rich auto-description from scraped metadata
# ---------------------------------------------------------------------------
_PLATFORM_LABELS: dict[str, str] = {
    "youtube": "YouTube",
    "instagram": "Instagram",
    "twitter": "X (Twitter)",
    "facebook": "Facebook",
    "linkedin": "LinkedIn",
    "tiktok": "TikTok",
    "reddit": "Reddit",
    "pinterest": "Pinterest",
    "spotify": "Spotify",
    "medium": "Medium",
}

_TYPE_LABELS: dict[str, str] = {
    "video": "Video",
    "article": "Article",
    "post": "Post",
    "podcast": "Podcast",
    "image": "Image",
}


def _build_auto_description(
    metadata: "UrlMetadata",
    platform: str,
    content_type: str,
) -> str:
    """Build a concise auto-description from scraped metadata.

    Includes: original description/topics, author, source, and media type.
    """
    from app.services.metadata_service import UrlMetadata  # noqa: F811

    parts: list[str] = []

    # Original description (truncated)
    if metadata.description:
        desc = metadata.description.strip()
        if len(desc) > 200:
            desc = desc[:197] + "..."
        parts.append(desc)

    # Source & author line
    source_parts: list[str] = []
    platform_label = _PLATFORM_LABELS.get(platform, platform.title() if platform != "other" else "")
    type_label = _TYPE_LABELS.get(content_type, content_type.title())

    if platform_label:
        source_parts.append(platform_label)
    if metadata.site_name and metadata.site_name.lower() != platform_label.lower():
        source_parts.append(metadata.site_name)
    if metadata.author:
        source_parts.append(f"by {metadata.author}")

    info_line = " · ".join(source_parts)
    if info_line:
        info_line = f"{type_label} — {info_line}" if type_label else info_line
    elif type_label:
        info_line = type_label

    if info_line:
        parts.append(info_line)

    # Keywords / topics
    if metadata.keywords:
        kw = metadata.keywords.strip()
        if len(kw) > 150:
            kw = kw[:147] + "..."
        parts.append(f"Topics: {kw}")

    return " | ".join(parts) if parts else ""
