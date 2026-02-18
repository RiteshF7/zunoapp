"""Admin endpoints: cache management, prompt CRUD, stats, waitlist.

Only users with profile.role = 'admin' can call these endpoints (except /me).
GET /admin/me returns {"admin": true|false} for any authenticated user.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import get_current_user_role, get_admin_user, get_supabase
from app.utils.cache import bust_cache, get_cache_stats
from app.prompts import reload_prompts
from app.schemas.models import PromptListItem, PromptOut, PromptUpdate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Admin check (any authenticated user) ────────────────────────────────────

@router.get("/me")
async def admin_me(role: str = Depends(get_current_user_role)):
    """Return whether the current user is an admin. Does not require admin."""
    return {"admin": role == "admin"}


# ── Cache management ──────────────────────────────────────────────────────

@router.get("/cache/stats")
async def cache_stats(user_id: str = Depends(get_admin_user)):
    """Return cache statistics (total, active, expired entries)."""
    return get_cache_stats()


@router.post("/cache/bust")
async def bust(
    pattern: str = Query("*", description=(
        "Cache key pattern. '*' clears all, 'prefix:*' clears by prefix, "
        "or provide an exact key."
    )),
    user_id: str = Depends(get_admin_user),
):
    """Bust (invalidate) cache entries matching the given pattern.

    Examples:
    - ``?pattern=*`` — flush the entire cache
    - ``?pattern=popular_tags:*`` — flush all popular tag caches
    - ``?pattern=feed:*`` — flush all feed caches
    - ``?pattern=categories:*`` — flush all category caches
    - ``?pattern=suggested_feed:*`` — flush suggested feed caches
    """
    removed = bust_cache(pattern)
    logger.info("Admin cache bust: pattern='%s' removed=%d by user=%s", pattern, removed, user_id)
    return {"pattern": pattern, "entries_removed": removed}


# ── Prompt management ─────────────────────────────────────────────────────

@router.get("/prompts", response_model=list[PromptListItem])
async def prompts_list(
    user_id: str = Depends(get_admin_user),
    db=Depends(get_supabase),
):
    """List all prompts (name, version, updated_at). Admin only."""
    result = (
        db.table("prompts")
        .select("name, version, updated_at")
        .order("name")
        .execute()
    )
    items = result.data if result.data is not None else []
    return [PromptListItem(**row) for row in items]


@router.get("/prompts/{name}", response_model=PromptOut)
async def prompts_get_one(
    name: str,
    user_id: str = Depends(get_admin_user),
    db=Depends(get_supabase),
):
    """Get full config for one prompt. Admin only. 404 if not in DB."""
    result = (
        db.table("prompts")
        .select("name, system, user_template, version, temperature, max_output_tokens, model, updated_at")
        .eq("name", name)
        .maybe_single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prompt not found: {name}")
    return PromptOut(**result.data)


@router.put("/prompts/{name}", response_model=PromptOut)
async def prompts_update(
    name: str,
    body: PromptUpdate,
    user_id: str = Depends(get_admin_user),
    db=Depends(get_supabase),
):
    """Update one prompt (partial update). Clears prompt cache after save. Admin only."""
    update_payload = body.model_dump(exclude_unset=True)
    if not update_payload:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")
    update_result = (
        db.table("prompts")
        .update(update_payload)
        .eq("name", name)
        .execute()
    )
    if not update_result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prompt not found: {name}")
    reload_prompts()
    logger.info("Admin prompt updated: %s by user=%s", name, user_id)
    # Re-fetch full row for response (updated_at etc.)
    get_result = (
        db.table("prompts")
        .select("name, system, user_template, version, temperature, max_output_tokens, model, updated_at")
        .eq("name", name)
        .single()
        .execute()
    )
    return PromptOut(**get_result.data)


@router.post("/prompts/reload")
async def prompts_reload(user_id: str = Depends(get_admin_user)):
    """Clear the in-memory prompt cache so the next get_prompt() refetches from DB."""
    reload_prompts()
    logger.info("Admin prompt reload by user=%s", user_id)
    return {"status": "ok", "message": "Prompts cache cleared"}


# ── Pro waitlist (landing signups) ────────────────────────────────────────

@router.get("/waitlist")
async def admin_waitlist(
    user_id: str = Depends(get_admin_user),
    db=Depends(get_supabase),
):
    """Return all Pro/Pro Plus waitlist entries (admin only)."""
    result = (
        db.table("pro_waitlist")
        .select("id, email, tier, discount_code, created_at")
        .order("created_at", desc=True)
        .execute()
    )
    items = result.data if result.data is not None else []
    return {"items": items, "total": len(items)}
