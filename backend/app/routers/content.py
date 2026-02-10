"""Content CRUD + content-with-tags."""

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from supabase import Client

from app.dependencies import get_current_user, get_supabase
from app.schemas.models import ContentOut, ContentCreate, ContentUpdate
from app.utils.rate_limit import limiter, RATE_READ, RATE_WRITE

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
    """Save new content (user_id auto-set from JWT)."""
    payload = body.model_dump(exclude_none=True)
    payload["user_id"] = user_id

    result = db.table("content").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create content")
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
