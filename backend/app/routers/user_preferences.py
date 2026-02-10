"""User preferences endpoints: GET/PATCH /api/user-preferences.

Per-user configuration (feed_type, etc.).  Auto-creates a default row
on first GET so the client never receives a 404.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from supabase import Client

from app.dependencies import get_current_user, get_supabase
from app.schemas.models import UserPreferencesOut, UserPreferencesUpdate
from app.utils.rate_limit import limiter, RATE_READ, RATE_WRITE

router = APIRouter(prefix="/api/user-preferences", tags=["user-preferences"])

_VALID_FEED_TYPES = {"usersaved", "suggestedcontent"}


@router.get("", response_model=UserPreferencesOut)
@limiter.limit(RATE_READ)
async def get_user_preferences(
    request: Request,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Get the current user's preferences (auto-created if missing)."""

    result = (
        db.table("user_preferences")
        .select("*")
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )

    if result.data:
        return result.data

    # First access — create default preferences
    insert = (
        db.table("user_preferences")
        .insert({"user_id": user_id, "feed_type": "usersaved"})
        .execute()
    )
    if not insert.data:
        raise HTTPException(status_code=500, detail="Failed to create default preferences")
    return insert.data[0]


@router.patch("", response_model=UserPreferencesOut)
@limiter.limit(RATE_WRITE)
async def update_user_preferences(
    request: Request,
    body: UserPreferencesUpdate,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Update the current user's preferences."""

    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Validate feed_type value
    if "feed_type" in updates and updates["feed_type"] not in _VALID_FEED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"feed_type must be one of: {', '.join(sorted(_VALID_FEED_TYPES))}",
        )

    # Upsert: update if exists, create if not
    existing = (
        db.table("user_preferences")
        .select("id")
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )

    if existing.data:
        result = (
            db.table("user_preferences")
            .update(updates)
            .eq("user_id", user_id)
            .execute()
        )
    else:
        result = (
            db.table("user_preferences")
            .insert({"user_id": user_id, **updates})
            .execute()
        )

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update preferences")
    return result.data[0]
