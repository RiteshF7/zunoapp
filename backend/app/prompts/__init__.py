"""Prompt loader — externalizes AI prompts from service code into YAML files."""

from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml

logger = logging.getLogger(__name__)

_PROMPTS_DIR = Path(__file__).parent


@lru_cache(maxsize=32)
def get_prompt(name: str) -> dict[str, Any]:
    """Load a prompt config by name (without the .yaml extension).

    Returns a dict with at least a ``system`` key (the system prompt text)
    and optional keys like ``model``, ``temperature``, ``version``, etc.

    Raises ``FileNotFoundError`` if the YAML file doesn't exist.
    """
    path = _PROMPTS_DIR / f"{name}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"Prompt file not found: {path}")

    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    logger.info("Loaded prompt '%s' (v%s)", name, data.get("version", "?"))
    return data


def reload_prompts() -> None:
    """Clear the cached prompts so the next call re-reads from disk.

    Useful after editing YAML files in development or via an admin endpoint.
    """
    get_prompt.cache_clear()
    logger.info("Prompt cache cleared — next access will reload from disk")
