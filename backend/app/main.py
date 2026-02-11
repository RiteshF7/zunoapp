"""FastAPI application entry point."""

import logging

from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from app.config import get_settings
from app.utils.rate_limit import limiter
from app.routers import (
    profile, collections, content, feed, search, ai,
    app_config, user_preferences, suggested_feed, admin,
    knowledge, goals,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

settings = get_settings()

app = FastAPI(
    title="Zuno API",
    description="Backend API for the Zuno content curation app",
    version="1.0.0",
)

# ── Rate limiter ──────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Middleware: inject user_id for rate-limiter key function ──────────────
@app.middleware("http")
async def inject_user_id_for_rate_limit(request: Request, call_next):
    """Extract user_id from the Authorization header (if present) and stash
    it in request.state so the rate-limiter key function can use it.

    This is intentionally lightweight — it does NOT validate the JWT.
    Full validation still happens in the ``get_current_user`` dependency.
    """
    auth = request.headers.get("authorization", "")
    if auth.startswith("Bearer "):
        try:
            import jwt as pyjwt
            token = auth[7:]
            # Decode WITHOUT verification just to read 'sub' for rate-limit keying
            payload = pyjwt.decode(token, options={"verify_signature": False})
            request.state.rate_limit_user_id = payload.get("sub")
        except Exception:
            pass
    return await call_next(request)


# ── Routers ───────────────────────────────────────────────────────────────
app.include_router(app_config.router)        # public — loaded first at app start
app.include_router(profile.router)
app.include_router(user_preferences.router)  # per-user config (feed_type, etc.)
app.include_router(collections.router)
app.include_router(content.router)
app.include_router(feed.router)
app.include_router(suggested_feed.router)    # interest-based suggestions
app.include_router(search.router)
app.include_router(ai.router)
app.include_router(knowledge.router)         # RAG knowledge engine
app.include_router(goals.router)             # AI-detected user goals
app.include_router(admin.router)             # cache bust, prompt reload, stats


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "zuno-api"}


# ── Root redirect ─────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root_redirect():
    return RedirectResponse(url="/static/index.html")


# ── Static files (test UI) ────────────────────────────────────────────────
_static_dir = Path(__file__).resolve().parent.parent / "static"
if _static_dir.is_dir():
    app.mount("/static", StaticFiles(directory=str(_static_dir)), name="static")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.backend_port,
        reload=True,
    )
