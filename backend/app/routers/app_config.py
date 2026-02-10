"""App config endpoint: GET /api/config (public — no auth required).

Returns dynamic configuration that the mobile app loads at startup.
Change the defaults here (or override from env / DB in the future)
to control feature flags, limits, and links without shipping an app update.
"""

import logging

from fastapi import APIRouter

from app.schemas.models import (
    AppConfigOut,
    FeatureFlags,
    ContentLimits,
    FeedSettings,
    AppLinks,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/config", tags=["config"])

# ── Static config (can later be moved to a DB table / env overrides) ──────

_CONFIG = AppConfigOut(
    app_version="1.0.0",
    min_supported_version="1.0.0",
    maintenance_mode=False,
    maintenance_message=None,
    feature_flags=FeatureFlags(
        feed_enabled=True,
        vfeed_enabled=False,
        ai_processing_enabled=True,
        search_enabled=True,
        collections_enabled=True,
        share_enabled=True,
    ),
    content_limits=ContentLimits(
        max_saves=500,
        max_collections=50,
        max_tags_per_content=10,
    ),
    feed_settings=FeedSettings(
        page_size=20,
        refresh_interval_seconds=300,
        max_feed_items=200,
    ),
    app_links=AppLinks(
        terms_url="https://zuno.app/terms",
        privacy_url="https://zuno.app/privacy",
        support_url="https://zuno.app/support",
        app_store_url="",
        play_store_url="",
    ),
    supported_platforms=[
        "youtube", "instagram", "x", "reddit",
        "tiktok", "spotify", "web",
    ],
)


@router.get("", response_model=AppConfigOut)
async def get_app_config():
    """Return the current app configuration.

    This is a **public** endpoint (no JWT required) so the app can
    fetch it before the user has signed in.
    """
    logger.info("Serving app config (v%s)", _CONFIG.app_version)
    return _CONFIG
