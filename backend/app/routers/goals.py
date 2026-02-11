"""Goals endpoints — CRUD for AI-detected user goals and their steps."""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from supabase import Client

from app.dependencies import get_current_user, get_supabase
from app.schemas.models import (
    GoalDetailOut,
    GoalOut,
    GoalStepOut,
    GoalStepUpdate,
    GoalUpdate,
)
from app.utils.rate_limit import limiter, RATE_READ, RATE_WRITE

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/goals", tags=["goals"])

_VALID_STATUSES = {"active", "completed", "dismissed"}


# ---------------------------------------------------------------------------
# GET /api/goals — list goals
# ---------------------------------------------------------------------------
@router.get("", response_model=list[GoalOut])
@limiter.limit(RATE_READ)
async def list_goals(
    request: Request,
    status: str | None = Query(None, description="Filter by status: active, completed, dismissed"),
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """List the user's goals, optionally filtered by status."""
    query = (
        db.table("user_goals")
        .select("*")
        .eq("user_id", user_id)
    )

    if status:
        if status not in _VALID_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(_VALID_STATUSES)}",
            )
        query = query.eq("status", status)

    result = query.order("created_at", desc=True).execute()
    return result.data or []


# ---------------------------------------------------------------------------
# GET /api/goals/{goal_id} — goal detail with steps
# ---------------------------------------------------------------------------
@router.get("/{goal_id}", response_model=GoalDetailOut)
@limiter.limit(RATE_READ)
async def get_goal(
    request: Request,
    goal_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Get a single goal with all its steps."""
    goal_result = (
        db.table("user_goals")
        .select("*")
        .eq("id", goal_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not goal_result.data:
        raise HTTPException(status_code=404, detail="Goal not found")

    goal = goal_result.data

    # Fetch steps
    steps_result = (
        db.table("goal_steps")
        .select("*")
        .eq("goal_id", goal_id)
        .order("step_index")
        .execute()
    )
    goal["steps"] = steps_result.data or []

    return goal


# ---------------------------------------------------------------------------
# PATCH /api/goals/{goal_id} — update goal
# ---------------------------------------------------------------------------
@router.patch("/{goal_id}", response_model=GoalOut)
@limiter.limit(RATE_WRITE)
async def update_goal(
    request: Request,
    goal_id: str,
    body: GoalUpdate,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Update a goal's title, description, or status."""
    # Verify ownership
    existing = (
        db.table("user_goals")
        .select("id")
        .eq("id", goal_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Build update payload (only non-None fields)
    payload: dict = {}
    if body.title is not None:
        payload["title"] = body.title
    if body.description is not None:
        payload["description"] = body.description
    if body.status is not None:
        if body.status not in _VALID_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(_VALID_STATUSES)}",
            )
        payload["status"] = body.status

    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        db.table("user_goals")
        .update(payload)
        .eq("id", goal_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update goal")

    return result.data[0]


# ---------------------------------------------------------------------------
# DELETE /api/goals/{goal_id} — delete a goal
# ---------------------------------------------------------------------------
@router.delete("/{goal_id}")
@limiter.limit(RATE_WRITE)
async def delete_goal(
    request: Request,
    goal_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Delete a goal and all its steps (cascade)."""
    existing = (
        db.table("user_goals")
        .select("id")
        .eq("id", goal_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Goal not found")

    db.table("user_goals").delete().eq("id", goal_id).execute()
    return {"success": True, "message": "Goal deleted"}


# ---------------------------------------------------------------------------
# PATCH /api/goals/{goal_id}/steps/{step_id} — toggle step completion
# ---------------------------------------------------------------------------
@router.patch("/{goal_id}/steps/{step_id}", response_model=GoalStepOut)
@limiter.limit(RATE_WRITE)
async def update_step(
    request: Request,
    goal_id: str,
    step_id: str,
    body: GoalStepUpdate,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Mark a goal step as completed or not completed."""
    # Verify goal ownership
    goal_check = (
        db.table("user_goals")
        .select("id")
        .eq("id", goal_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not goal_check.data:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Verify step belongs to this goal
    step_check = (
        db.table("goal_steps")
        .select("id")
        .eq("id", step_id)
        .eq("goal_id", goal_id)
        .execute()
    )
    if not step_check.data:
        raise HTTPException(status_code=404, detail="Step not found")

    # Update the step
    payload: dict = {"is_completed": body.is_completed}
    if body.is_completed:
        payload["completed_at"] = datetime.now(timezone.utc).isoformat()
    else:
        payload["completed_at"] = None

    result = (
        db.table("goal_steps")
        .update(payload)
        .eq("id", step_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update step")

    return result.data[0]
