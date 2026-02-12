"""FastAPI application entry point."""

import logging
import time
from contextlib import asynccontextmanager
from pathlib import Path

import jwt as pyjwt
from fastapi import APIRouter, Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import get_settings
from app.dependencies import get_supabase
from app.exceptions import ZunoException
from app.utils.rate_limit import limiter
from app.routers import (
    profile, collections, content, feed, search, ai,
    app_config, user_preferences, suggested_feed, admin,
    knowledge, goals,
)

from app.logging_config import configure_logging

settings = get_settings()
configure_logging(log_level=settings.log_level, log_format=settings.log_format)
logger = logging.getLogger(__name__)

APP_VERSION = "1.0.0"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: record start time. Shutdown: clear caches."""
    app.state.start_time = time.time()
    logger.info("Zuno API started")
    yield
    logger.info("Zuno API shutting down")
    from app.utils.cache import _store
    _store.clear()


OPENAPI_TAGS = [
    {"name": "config", "description": "App configuration and feature flags"},
    {"name": "profile", "description": "User profile"},
    {"name": "user-preferences", "description": "Per-user preferences"},
    {"name": "collections", "description": "Content collections"},
    {"name": "content", "description": "Content CRUD and upload"},
    {"name": "feed", "description": "Feed and bookmarks"},
    {"name": "suggested-feed", "description": "Suggested content"},
    {"name": "search", "description": "Search and popular tags"},
    {"name": "ai", "description": "AI processing"},
    {"name": "knowledge", "description": "RAG knowledge engine"},
    {"name": "goals", "description": "AI-detected goals"},
    {"name": "admin", "description": "Admin and cache management"},
]

app = FastAPI(
    title="Zuno API",
    description="Backend API for the Zuno content curation app",
    version=APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_tags=OPENAPI_TAGS,
)


# ── Global exception handlers ─────────────────────────────────────────────

@app.exception_handler(ZunoException)
async def zuno_exception_handler(request: Request, exc: ZunoException):
    """Handle all custom Zuno domain exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.message,
            "code": exc.error_code,
            "detail": exc.detail,
            "request_id": getattr(request.state, "request_id", None),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic / FastAPI request validation errors."""
    return JSONResponse(
        status_code=422,
        content={
            "error": "Request validation failed",
            "code": "VALIDATION_ERROR",
            "detail": str(exc.errors()),
            "request_id": getattr(request.state, "request_id", None),
        },
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle standard HTTP exceptions (404, 405, etc.) in our format."""
    detail_str = exc.detail if isinstance(exc.detail, str) else str(exc.detail) if exc.detail else "HTTP error"
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": detail_str,
            "code": "HTTP_ERROR",
            "detail": detail_str,
            "request_id": getattr(request.state, "request_id", None),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Catch-all for any unhandled exceptions — return 500 in standard format."""
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "code": "INTERNAL_ERROR",
            "detail": None,
            "request_id": getattr(request.state, "request_id", None),
        },
    )


# ── Rate limiter ──────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Middleware (order: last added = outermost = runs first) ───────────────
from fastapi.middleware.gzip import GZipMiddleware
from app.middleware import SecurityHeadersMiddleware, RequestIDMiddleware, TimingMiddleware

# Innermost → outermost (add order is reversed from execution order)
app.add_middleware(TimingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=500)

# ── CORS (must be outermost to handle preflight correctly) ────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
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
            token = auth[7:]
            # Decode WITHOUT verification just to read 'sub' for rate-limit keying
            payload = pyjwt.decode(token, options={"verify_signature": False})
            request.state.rate_limit_user_id = payload.get("sub")
        except Exception:
            pass
    return await call_next(request)


# ── API v1 ────────────────────────────────────────────────────────────────
v1 = APIRouter(prefix="/api/v1")
v1.include_router(app_config.router)         # GET /api/v1/config
v1.include_router(profile.router)            # /api/v1/profile
v1.include_router(user_preferences.router)   # /api/v1/user-preferences
v1.include_router(collections.router)        # /api/v1/collections
v1.include_router(content.router)            # /api/v1/content
v1.include_router(feed.router)               # /api/v1/feed
v1.include_router(suggested_feed.router)     # /api/v1/suggested-feed
v1.include_router(search.router)             # /api/v1/search
v1.include_router(ai.router)                 # /api/v1/ai
v1.include_router(knowledge.router)          # /api/v1/knowledge
v1.include_router(goals.router)              # /api/v1/goals
v1.include_router(admin.router)              # /api/v1/admin

app.include_router(v1)


# ── Legacy redirect: /api/... → /api/v1/... ──────────────────────────────
@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PATCH", "PUT", "DELETE"],
    include_in_schema=False,
)
async def legacy_api_redirect(path: str, request: Request):
    """Redirect old /api/... requests to /api/v1/... during migration."""
    query = f"?{request.url.query}" if request.url.query else ""
    return RedirectResponse(
        url=f"/api/v1/{path}{query}",
        status_code=307,
    )


@app.get("/health")
async def health_check(request: Request):
    """Basic health: status, version, uptime. Always 200."""
    start = getattr(request.app.state, "start_time", None) or time.time()
    uptime = time.time() - start
    return {
        "status": "ok",
        "service": "zuno-api",
        "version": APP_VERSION,
        "uptime_seconds": round(uptime, 2),
    }


@app.get("/health/live")
async def health_live():
    """Liveness probe: process is running. Always 200."""
    return {"status": "ok"}


@app.get("/health/ready")
async def health_ready(db=Depends(get_supabase)):
    """Readiness probe: DB connectivity. 200 if OK, 503 if not.
    Uses profiles table (exists in all Supabase migrations) so readiness works
    before any backend-specific migrations are applied.
    """
    try:
        db.table("profiles").select("id").limit(1).execute()
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.warning("Health ready check failed: %s", e)
        return JSONResponse(
            status_code=503,
            content={"status": "unavailable", "database": "disconnected", "detail": str(e)},
        )


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
