"""Custom middleware for the Zuno API.

Provides:
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- CSP and HSTS in production
- Request ID generation (UUID4 on every request)
- Request timing (X-Response-Time header)
"""

from __future__ import annotations

import logging
import time
import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

logger = logging.getLogger(__name__)


def _get_environment() -> str:
    """Lazy load to avoid circular import."""
    from app.config import get_settings
    return get_settings().environment


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add standard security headers to every response. In production, add CSP and HSTS."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=()"
        if _get_environment() == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
            # CSP: allow same origin, inline scripts (Vite), and common CDNs used by the app
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; "
                "font-src 'self' https://fonts.gstatic.com; "
                "img-src 'self' data: https: blob:; "
                "connect-src 'self' https://*.supabase.co https://*.onrender.com wss:; "
                "frame-ancestors 'none'; "
                "base-uri 'self'; "
                "form-action 'self'"
            )
        return response


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Generate a UUID4 request ID and attach it to request.state and the response."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


class TimingMiddleware(BaseHTTPMiddleware):
    """Measure request duration and set X-Response-Time header."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        response.headers["X-Response-Time"] = f"{duration_ms:.1f}ms"
        if duration_ms > 1000:
            logger.warning(
                "Slow request: %s %s took %.0fms",
                request.method,
                request.url.path,
                duration_ms,
            )
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log every request (method, path, origin, status) so API traffic is visible in backend logs."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)
        origin = request.headers.get("origin") or "-"
        logger.info(
            "%s %s origin=%s -> %d",
            request.method,
            request.url.path,
            origin,
            response.status_code,
        )
        return response
