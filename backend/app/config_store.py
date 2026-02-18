"""Read/write app_config_store (global and local config) in Supabase. Used by app_config, about_config, and admin."""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)

_client: Any = None


def _get_db() -> Any:
    global _client
    if _client is None:
        from supabase import create_client
        from app.config import get_settings
        s = get_settings()
        _client = create_client(s.supabase_url, s.supabase_service_role_key)
    return _client


def get_config(key: str) -> dict[str, Any] | None:
    """Return stored config value as dict, or None if not found or table missing."""
    try:
        r = (
            _get_db()
            .table("app_config_store")
            .select("value")
            .eq("key", key)
            .maybe_single()
            .execute()
        )
        data = r.data if isinstance(r.data, dict) else None
        if data and isinstance(data.get("value"), dict):
            return data["value"]
        return None
    except Exception as e:
        logger.warning("config_store get_config(%s) failed: %s", key, e)
        return None


def set_config(key: str, value: dict[str, Any]) -> None:
    """Upsert config row."""
    from datetime import datetime, timezone
    db = _get_db()
    db.table("app_config_store").upsert(
        {"key": key, "value": value, "updated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")},
        on_conflict="key",
    ).execute()
    logger.info("config_store set_config(%s)", key)
