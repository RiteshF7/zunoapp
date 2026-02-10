"""Suggested feed endpoint: GET /api/suggested-feed.

Returns content from other users' shared collections, ranked by
relevance to the current user's interests.  Supports infinite scroll
via limit/offset.
"""

from fastapi import APIRouter, Depends, Query
from supabase import Client

from app.dependencies import get_current_user, get_supabase
from app.schemas.models import SuggestedContentOut
from app.services.suggested_feed_service import get_suggested_feed

router = APIRouter(prefix="/api/suggested-feed", tags=["suggested-feed"])


@router.get("", response_model=list[SuggestedContentOut])
async def list_suggested_feed(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    category: str | None = None,
    content_type: str | None = None,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Get suggested content based on the user's interests.

    Content is sourced from **shared collections** of other users and
    ranked by category + tag overlap with the current user's saved
    content.  Each refresh regenerates the feed from scratch.
    """

    items = await get_suggested_feed(
        user_id,
        db,
        limit=limit,
        offset=offset,
        category=category,
        content_type=content_type,
    )
    return items
