"""About config endpoint: GET /api/about-config (reference dev/prod URLs for About screen).

Read-only; returns reference URLs from server env (ZUNO_*_DEV, ZUNO_*_PROD).
No secrets. Used by the About App screen to compare current runtime with expected dev/prod.
"""

import os

from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.utils.rate_limit import limiter, RATE_PUBLIC

router = APIRouter(prefix="/about-config", tags=["config"])


class EnvRef(BaseModel):
    """Reference URLs for one environment (dev or prod)."""

    apiBase: str | None = None
    appUrl: str | None = None


class AboutConfigOut(BaseModel):
    """Reference dev and prod URLs for comparison on About screen."""

    dev: EnvRef = EnvRef()
    prod: EnvRef = EnvRef()


def _get_ref() -> AboutConfigOut:
    """Build reference from server env. Only include keys that are set."""
    dev = EnvRef(
        apiBase=os.environ.get("ZUNO_API_BASE_DEV") or None,
        appUrl=os.environ.get("ZUNO_APP_URL_DEV") or None,
    )
    prod = EnvRef(
        apiBase=os.environ.get("ZUNO_API_BASE_PROD") or None,
        appUrl=os.environ.get("ZUNO_APP_URL_PROD") or None,
    )
    return AboutConfigOut(dev=dev, prod=prod)


@router.get("", response_model=AboutConfigOut)
@limiter.limit(RATE_PUBLIC)
async def get_about_config(request: Request):
    """Return reference dev/prod URLs (for About App screen comparison).
    Reads from DB (app_config_store key=local) when set by admin; else from env."""
    from app.config_store import get_config
    data = get_config("local")
    if data:
        dev = data.get("dev") or {}
        prod = data.get("prod") or {}
        return AboutConfigOut(
            dev=EnvRef(apiBase=dev.get("apiBase"), appUrl=dev.get("appUrl")),
            prod=EnvRef(apiBase=prod.get("apiBase"), appUrl=prod.get("appUrl")),
        )
    return _get_ref()
