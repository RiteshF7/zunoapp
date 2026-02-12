"""Admin endpoints: cache management, prompt reloading, stats.

These endpoints require authentication (JWT) and are intended for
admin/debugging use.  In production you may want to add an additional
role check.
"""

import logging

from fastapi import APIRouter, Depends, Query

from app.dependencies import get_current_user
from app.utils.cache import bust_cache, get_cache_stats
from app.prompts import reload_prompts

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Cache management ──────────────────────────────────────────────────────

@router.get("/cache/stats")
async def cache_stats(user_id: str = Depends(get_current_user)):
    """Return cache statistics (total, active, expired entries)."""
    return get_cache_stats()


@router.post("/cache/bust")
async def bust(
    pattern: str = Query("*", description=(
        "Cache key pattern. '*' clears all, 'prefix:*' clears by prefix, "
        "or provide an exact key."
    )),
    user_id: str = Depends(get_current_user),
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
async def prompts_reload(user_id: str = Depends(get_current_user)):
    """Reload all AI prompts from YAML files on disk.

    Useful after editing prompt YAML files in development to pick up
    changes without restarting the server.
    """
    reload_prompts()
    logger.info("Admin prompt reload by user=%s", user_id)
    return {"status": "ok", "message": "Prompts reloaded from disk"}
