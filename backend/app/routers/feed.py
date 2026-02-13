"""Feed endpoints: list feed, bookmarks, toggle bookmark."""

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from supabase import Client

from app.dependencies import get_current_user, get_supabase
from app.schemas.models import FeedItemOut, PaginatedResponse
from app.utils.rate_limit import limiter, RATE_READ, RATE_WRITE
from app.utils.cache import cache, bust_cache

router = APIRouter(prefix="/feed", tags=["feed"])


@router.get("", response_model=PaginatedResponse[FeedItemOut])
@limiter.limit(RATE_READ)
async def get_feed(
    request: Request,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    category: str | None = None,
    content_type: str | None = None,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Get feed items with optional filters (cached for 5 minutes)."""
    return await _get_feed_cached(
        limit=limit, offset=offset,
        category=category, content_type=content_type,
        db=db,
    )


@cache(ttl=300, prefix="feed", key="{limit}:{offset}:{category}:{content_type}")
async def _get_feed_cached(
    limit: int = 20,
    offset: int = 0,
    category: str | None = None,
    content_type: str | None = None,
    db: Client = None,
):
    """Inner cached function for feed items."""
    query = (
        db.table("feed_items")
        .select("*", count="exact")
        .order("created_at", desc=True)
    )

    if category:
        query = query.eq("category", category)
    if content_type:
        query = query.eq("content_type", content_type)

    query = query.range(offset, offset + limit - 1)

    result = query.execute()
    items = result.data or []
    total = getattr(result, "count", None)
    if total is None:
        total = len(items) if offset == 0 else offset + len(items)
    has_more = offset + len(items) < total
    return PaginatedResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
        has_more=has_more,
    )


@router.get("/bookmarks", response_model=list[str], tags=["bookmarks"])
@limiter.limit(RATE_READ)
async def get_bookmarks(
    request: Request,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Get the current user's bookmarked feed_item_ids."""
    result = (
        db.table("bookmarks")
        .select("feed_item_id")
        .eq("user_id", user_id)
        .execute()
    )
    return [row["feed_item_id"] for row in (result.data or [])]


@router.get("/bookmarks/items", response_model=list[FeedItemOut], tags=["bookmarks"])
@limiter.limit(RATE_READ)
async def get_bookmarked_feed_items(
    request: Request,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Get full feed items for the current user's bookmarks (for Library Bookmarks tab)."""
    bk_result = (
        db.table("bookmarks")
        .select("feed_item_id")
        .eq("user_id", user_id)
        .execute()
    )
    feed_item_ids = [row["feed_item_id"] for row in (bk_result.data or [])]
    if not feed_item_ids:
        return []
    # Fetch feed items; preserve bookmark order (newest bookmark first if we had created_at on bookmarks)
    items_result = (
        db.table("feed_items")
        .select("*")
        .in_("id", feed_item_ids)
        .execute()
    )
    items = items_result.data or []
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return [FeedItemOut(**item) for item in items]


@router.post("/bookmarks/{feed_item_id}/toggle", tags=["bookmarks"])
@limiter.limit(RATE_WRITE)
async def toggle_bookmark(
    request: Request,
    feed_item_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Toggle a bookmark on/off. Returns {"bookmarked": true/false}."""
    # Check if already bookmarked
    existing = (
        db.table("bookmarks")
        .select("id")
        .eq("user_id", user_id)
        .eq("feed_item_id", feed_item_id)
        .execute()
    )

    if existing.data:
        # Remove bookmark
        db.table("bookmarks").delete().eq("id", existing.data[0]["id"]).execute()
        return {"bookmarked": False}
    else:
        # Add bookmark
        db.table("bookmarks").insert(
            {"user_id": user_id, "feed_item_id": feed_item_id}
        ).execute()
        return {"bookmarked": True}
