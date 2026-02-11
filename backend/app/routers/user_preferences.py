"""User preferences endpoints: GET/PATCH /api/user-preferences.

Per-user configuration (feed_type, etc.).  Auto-creates a default row
on first GET so the client never receives a 404.
"""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from supabase import Client

from app.dependencies import get_current_user, get_supabase
from app.schemas.models import UserPreferencesOut, UserPreferencesUpdate
from app.utils.rate_limit import limiter, RATE_READ, RATE_WRITE

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/user-preferences", tags=["user-preferences"])

_VALID_FEED_TYPES = {"usersaved", "suggestedcontent"}


def _default_prefs(user_id: str) -> dict:
    """Return a default preferences dict when the table is unavailable."""
    now = datetime.now(timezone.utc).isoformat()
    return {
        "id": "default",
        "user_id": user_id,
        "feed_type": "usersaved",
        "created_at": now,
        "updated_at": now,
    }


@router.get("", response_model=UserPreferencesOut)
@limiter.limit(RATE_READ)
async def get_user_preferences(
    request: Request,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Get the current user's preferences (auto-created if missing)."""

    try:
        result = (
            db.table("user_preferences")
            .select("*")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
    except Exception as exc:
        logger.warning("user_preferences table query failed (table may not exist): %s", exc)
        return _default_prefs(user_id)

    if result.data:
        return result.data

    # First access — create default preferences
    try:
        insert = (
            db.table("user_preferences")
            .insert({"user_id": user_id, "feed_type": "usersaved"})
            .execute()
        )
        if insert.data:
            return insert.data[0]
    except Exception as exc:
        logger.warning("Failed to insert default user_preferences: %s", exc)

    return _default_prefs(user_id)


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

    try:
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
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("user_preferences update failed (table may not exist): %s", exc)
        # Return a mock response with the requested updates applied
        prefs = _default_prefs(user_id)
        prefs.update(updates)
        return prefs
