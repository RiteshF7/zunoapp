"""Goals endpoints — CRUD for AI-detected user goals and their steps."""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from supabase import Client

from app.config import Settings, get_settings
from app.dependencies import get_current_user, get_supabase
from app.schemas.models import (
    GoalDetailOut,
    GoalMergeSuggestionOut,
    GoalOut,
    GoalStepOut,
    GoalStepUpdate,
    GoalUpdate,
)
from app.services.goal_engine import (
    analyze_and_update_goals,
    apply_consolidation,
    check_and_suggest_consolidation,
    dismiss_consolidation,
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
# POST /api/goals/consolidate — manually trigger consolidation check
# ---------------------------------------------------------------------------
@router.post("/consolidate")
@limiter.limit("3/hour")
async def consolidate_goals(
    request: Request,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
    settings: Settings = Depends(get_settings),
):
    """Manually trigger goal consolidation analysis.

    Checks all active goals for possible merges and creates suggestions.
    """
    async def _run_consolidation() -> None:
        try:
            await check_and_suggest_consolidation(db, user_id, settings)
        except Exception as exc:
            logger.warning("Manual consolidation failed for user %s: %s", user_id, exc)

    background_tasks.add_task(_run_consolidation)

    return {
        "success": True,
        "message": "Consolidation analysis started. Check suggestions shortly.",
    }


# ---------------------------------------------------------------------------
# GET /api/goals/suggestions — list pending merge suggestions
# ---------------------------------------------------------------------------
@router.get("/suggestions", response_model=list[GoalMergeSuggestionOut])
@limiter.limit(RATE_READ)
async def list_suggestions(
    request: Request,
    status: str = Query("pending", description="Filter by status: pending, accepted, dismissed"),
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """List goal merge suggestions for the user."""
    valid_statuses = {"pending", "accepted", "dismissed"}
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
        )

    result = (
        db.table("goal_merge_suggestions")
        .select("*")
        .eq("user_id", user_id)
        .eq("status", status)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


# ---------------------------------------------------------------------------
# POST /api/goals/suggestions/{suggestion_id}/accept — accept merge
# ---------------------------------------------------------------------------
@router.post("/suggestions/{suggestion_id}/accept")
@limiter.limit(RATE_WRITE)
async def accept_suggestion(
    request: Request,
    suggestion_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Accept a merge suggestion — creates a parent goal and links children."""
    try:
        parent_goal = await apply_consolidation(db, user_id, suggestion_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.error("Failed to apply consolidation %s: %s", suggestion_id, exc)
        raise HTTPException(status_code=500, detail="Failed to apply consolidation")

    return {
        "success": True,
        "message": "Goals merged successfully!",
        "parent_goal_id": parent_goal["id"],
    }


# ---------------------------------------------------------------------------
# POST /api/goals/suggestions/{suggestion_id}/dismiss — reject merge
# ---------------------------------------------------------------------------
@router.post("/suggestions/{suggestion_id}/dismiss")
@limiter.limit(RATE_WRITE)
async def dismiss_suggestion(
    request: Request,
    suggestion_id: str,
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
):
    """Dismiss a merge suggestion so it won't be re-suggested."""
    try:
        await dismiss_consolidation(db, user_id, suggestion_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.error("Failed to dismiss suggestion %s: %s", suggestion_id, exc)
        raise HTTPException(status_code=500, detail="Failed to dismiss suggestion")

    return {"success": True, "message": "Suggestion dismissed."}


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
    """Get a single goal with all its steps and child goals."""
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

    # Fetch child goals (sub-goals linked to this parent)
    children_result = (
        db.table("user_goals")
        .select("*")
        .eq("parent_goal_id", goal_id)
        .eq("user_id", user_id)
        .order("created_at", desc=False)
        .execute()
    )
    goal["children"] = children_result.data or []

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


# ---------------------------------------------------------------------------
# POST /api/goals/reanalyze — re-run goal analysis on existing content
# ---------------------------------------------------------------------------
@router.post("/reanalyze")
@limiter.limit("3/hour")
async def reanalyze_goals(
    request: Request,
    background_tasks: BackgroundTasks,
    force: bool = Query(False, description="If true, re-analyze ALL content including already-analyzed"),
    user_id: str = Depends(get_current_user),
    db: Client = Depends(get_supabase),
    settings: Settings = Depends(get_settings),
):
    """Analyze content for goals — only unanalyzed items by default.

    Finds all AI-processed content that hasn't been analyzed for goals yet
    and runs the goal engine on each one. If ``force=true``, re-analyzes
    ALL content regardless of previous analysis. Runs in the background so
    the response returns immediately.
    """
    # Build query for content to analyze
    query = (
        db.table("content")
        .select(
            "id, user_id, url, title, description, platform, content_type, "
            "ai_category, ai_summary, ai_structured_content, embedding, "
            "created_at"
        )
        .eq("user_id", user_id)
        .eq("ai_processed", True)
    )

    # Only fetch unanalyzed content unless force=true
    if not force:
        query = query.eq("goals_analyzed", False)

    content_result = query.order("created_at", desc=False).execute()
    items = content_result.data or []

    # Also count how many are already analyzed (for the response message)
    if not force:
        already_result = (
            db.table("content")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .eq("ai_processed", True)
            .eq("goals_analyzed", True)
            .execute()
        )
        already_count = already_result.count or 0
    else:
        already_count = 0

    if not items:
        if already_count > 0:
            return {
                "success": True,
                "message": f"All {already_count} content items have already been analyzed for goals. Use force=true to re-analyze.",
                "content_count": 0,
                "already_analyzed": already_count,
            }
        return {
            "success": False,
            "message": "No processed content found. Save and process content first.",
            "content_count": 0,
            "already_analyzed": 0,
        }

    async def _run_batch_analysis() -> None:
        """Run goal analysis for each content item sequentially."""
        for item in items:
            ai_result = {
                "category": item.get("ai_category", ""),
                "summary": item.get("ai_summary", ""),
                "tags": [],
                "structured_content": item.get("ai_structured_content") or {},
                "embedding": item.get("embedding"),
            }
            try:
                await analyze_and_update_goals(
                    db=db,
                    user_id=user_id,
                    new_content=item,
                    ai_result=ai_result,
                    settings=settings,
                    skip_debounce=True,
                )
            except Exception as exc:
                logger.warning(
                    "Reanalysis failed for content %s: %s", item.get("id"), exc,
                )

    background_tasks.add_task(_run_batch_analysis)

    return {
        "success": True,
        "message": f"Goal analysis started for {len(items)} unanalyzed content items. Goals will appear shortly.",
        "content_count": len(items),
        "already_analyzed": already_count,
    }
