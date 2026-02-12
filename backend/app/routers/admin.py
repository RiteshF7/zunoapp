"""Admin endpoints: cache management, prompt reloading, stats.

Only users with profile.role = 'admin' can call these endpoints (except /me).
GET /admin/me returns {"admin": true|false} for any authenticated user.
"""

import logging

from fastapi import APIRouter, Depends, Query

from app.dependencies import get_current_user_role, get_admin_user
from app.utils.cache import bust_cache, get_cache_stats
from app.prompts import reload_prompts

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

@router.post("/prompts/reload")
async def prompts_reload(user_id: str = Depends(get_admin_user)):
    """Reload all AI prompts from YAML files on disk.

    Useful after editing prompt YAML files in development to pick up
    changes without restarting the server.
    """
    reload_prompts()
    logger.info("Admin prompt reload by user=%s", user_id)
    return {"status": "ok", "message": "Prompts reloaded from disk"}
