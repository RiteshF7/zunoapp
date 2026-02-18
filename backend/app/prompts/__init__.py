"""Prompt loader — reads from Supabase prompts table with optional YAML fallback."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import yaml

logger = logging.getLogger(__name__)

_PROMPTS_DIR = Path(__file__).parent

# In-memory cache keyed by prompt name. Cleared by reload_prompts().
_cache: dict[str, dict[str, Any]] = {}

# Lazy Supabase client (avoids circular import with dependencies).
_supabase_client: Any = None


def _get_db() -> Any:
    """Return Supabase client (service role). Lazy-init to avoid circular imports."""
    global _supabase_client
    if _supabase_client is None:
        from supabase import create_client
        from app.config import get_settings
        settings = get_settings()
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
        logger.debug("Prompts: Supabase client created")
    return _supabase_client


def _row_to_config(row: dict[str, Any]) -> dict[str, Any]:
    """Convert a DB row to the prompt config dict expected by callers."""
    return {
        "system": row["system"],
        "user_template": row.get("user_template"),
        "version": row.get("version"),
        "temperature": row.get("temperature"),
        "max_output_tokens": row.get("max_output_tokens"),
        "model": row.get("model"),
    }


def _load_from_yaml(name: str) -> dict[str, Any]:
    """Load prompt from YAML file (fallback when DB is empty or unavailable)."""
    path = _PROMPTS_DIR / f"{name}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"Prompt file not found: {path}")
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    logger.info("Loaded prompt '%s' from YAML fallback (v%s)", name, data.get("version", "?"))
    return data


def get_prompt(name: str) -> dict[str, Any]:
    """Load a prompt config by name.

    Reads from the Supabase `prompts` table (cached). If the table is empty
    or the row is missing, falls back to YAML files in app/prompts/.

    Returns a dict with at least ``system`` and optional ``user_template``,
    ``version``, ``temperature``, ``max_output_tokens``, ``model``.

    Raises ``FileNotFoundError`` if neither DB nor YAML has the prompt.
    """
    if name in _cache:
        return _cache[name]

    try:
        db = _get_db()
        result = (
            db.table("prompts")
            .select("system, user_template, version, temperature, max_output_tokens, model")
            .eq("name", name)
            .maybe_single()
            .execute()
        )
        if result.data:
            data = _row_to_config(result.data)
            _cache[name] = data
            logger.info("Loaded prompt '%s' from DB (v%s)", name, data.get("version", "?"))
            return data
    except Exception as exc:
        logger.warning("Prompts: DB read failed for '%s', using YAML fallback: %s", name, exc)

    data = _load_from_yaml(name)
    _cache[name] = data
    return data


def reload_prompts() -> None:
    """Clear the in-memory prompt cache so the next get_prompt() refetches from DB."""
    global _cache
    _cache = {}
    logger.info("Prompt cache cleared — next access will reload from DB or YAML")


# Backwards compatibility: expose cache clear on the function if something expected it
def _prompt_cache_clear() -> None:
    """Clear prompt cache (alias for reload_prompts)."""
    reload_prompts()
