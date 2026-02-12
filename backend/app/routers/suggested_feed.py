"""Suggested feed endpoint: GET /api/suggested-feed.

Returns content from other users' shared collections, ranked by
relevance to the current user's interests.  Supports infinite scroll
via limit/offset.
"""

from fastapi import APIRouter, Depends, Query, Request
from supabase import Client

from app.dependencies import get_current_user, get_supabase
from app.schemas.models import SuggestedContentOut
from app.services.feed_service import get_suggested_feed
from app.utils.rate_limit import limiter, RATE_READ
from app.utils.cache import cache

router = APIRouter(prefix="/suggested-feed", tags=["suggested-feed"])


@router.get("", response_model=list[SuggestedContentOut])
@limiter.limit(RATE_READ)
async def list_suggested_feed(
    request: Request,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    category: str | None = None,
    content_type: str | None = None,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Get suggested content based on the user's interests (cached 10 min).

    Content is sourced from **shared collections** of other users and
    ranked by category + tag overlap with the current user's saved
    content.  Each refresh regenerates the feed from scratch.
    """
    return await _get_suggested_feed_cached(
        user_id=user_id,
        db=db,
        limit=limit,
        offset=offset,
        category=category,
        content_type=content_type,
    )


@cache(ttl=600, prefix="suggested_feed", key="{user_id}:{limit}:{offset}:{category}:{content_type}")
async def _get_suggested_feed_cached(
    user_id: str = "",
    db: Client = None,
    limit: int = 20,
    offset: int = 0,
    category: str | None = None,
    content_type: str | None = None,
):
    """Inner cached wrapper for get_suggested_feed."""
    return await get_suggested_feed(
        user_id,
        db,
        limit=limit,
        offset=offset,
        category=category,
        content_type=content_type,
    )
