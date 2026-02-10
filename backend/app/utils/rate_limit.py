"""Rate-limiting middleware and helpers using slowapi.

Provides:
- A shared ``limiter`` instance used across all routers.
- ``rate_limit_key`` — key function that identifies users by their JWT
  ``user_id`` (falls back to client IP for unauthenticated endpoints).
- Pre-defined limit strings that routers can import.

Configuration
-------------
The limiter uses in-memory storage by default (no Redis required).
Override with ``RATE_LIMIT_STORAGE_URI`` env var for Redis if desired.

Usage in routers::

    from app.utils.rate_limit import limiter, RATE_AI, RATE_DEFAULT

    @router.post("/expensive")
    @limiter.limit(RATE_AI)
    async def expensive(request: Request, ...):
        ...
"""

from __future__ import annotations

import logging
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

logger = logging.getLogger(__name__)


# ── Key function ──────────────────────────────────────────────────────────

def _get_rate_limit_key(request: Request) -> str:
    """Extract a rate-limit key from the request.

    Priority:
    1. Authenticated user_id (set by the ``get_current_user`` dependency)
    2. Client IP address (for public endpoints like /health, /api/config)
    """
    # The auth dependency stores user_id in request.state when available
    user_id = getattr(request.state, "rate_limit_user_id", None)
    if user_id:
        return f"user:{user_id}"
    return get_remote_address(request)


# ── Limiter instance ─────────────────────────────────────────────────────

limiter = Limiter(
    key_func=_get_rate_limit_key,
    default_limits=["200/minute"],
    storage_uri="memory://",
)


# ── Pre-defined rate limit strings ───────────────────────────────────────

RATE_AI_PROCESS = "30/hour"        # POST /api/ai/process-content
RATE_AI_EMBEDDING = "60/hour"      # POST /api/ai/generate-embedding
RATE_AI_FEED = "10/hour"           # POST /api/ai/generate-feed
RATE_SEARCH = "60/minute"          # GET  /api/search/*
RATE_WRITE = "60/minute"           # POST/PATCH/DELETE mutations
RATE_READ = "120/minute"           # GET  endpoints (general)
RATE_PUBLIC = "60/minute"          # Public (no-auth) endpoints
