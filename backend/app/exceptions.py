"""Custom exception classes for the Zuno API.

All domain exceptions inherit from ``ZunoException`` so they can be caught
by a single global handler in ``app/main.py`` and rendered as a consistent
``ErrorResponse`` JSON body.
"""

from __future__ import annotations


class ZunoException(Exception):
    """Base exception for all Zuno API errors."""

    def __init__(
        self,
        message: str = "An unexpected error occurred",
        status_code: int = 500,
        error_code: str = "INTERNAL_ERROR",
        detail: str | None = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.detail = detail


class NotFoundException(ZunoException):
    """Resource not found (404)."""

    def __init__(self, message: str = "Resource not found", detail: str | None = None):
        super().__init__(
            message=message,
            status_code=404,
            error_code="NOT_FOUND",
            detail=detail,
        )


class ValidationError(ZunoException):
    """Request validation failed (422)."""

    def __init__(self, message: str = "Validation error", detail: str | None = None):
        super().__init__(
            message=message,
            status_code=422,
            error_code="VALIDATION_ERROR",
            detail=detail,
        )


class ForbiddenError(ZunoException):
    """Access denied (403)."""

    def __init__(self, message: str = "Forbidden", detail: str | None = None):
        super().__init__(
            message=message,
            status_code=403,
            error_code="FORBIDDEN",
            detail=detail,
        )


class ExternalServiceError(ZunoException):
    """An external service (Vertex AI, Supabase, etc.) failed (502)."""

    def __init__(self, message: str = "External service error", detail: str | None = None):
        super().__init__(
            message=message,
            status_code=502,
            error_code="EXTERNAL_SERVICE_ERROR",
            detail=detail,
        )
