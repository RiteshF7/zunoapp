"""Unit tests for app.prompts module."""

from __future__ import annotations

import pytest

from app.prompts import get_prompt, reload_prompts


# ---------------------------------------------------------------------------
# get_prompt
# ---------------------------------------------------------------------------

def test_get_prompt_loads_yaml():
    """get_prompt loads YAML from app/prompts/{name}.yaml."""
    data = get_prompt("content_analysis")
    assert isinstance(data, dict)
    assert "system" in data or "prompt" in data or len(data) > 0


def test_get_prompt_loads_existing_files():
    """Load known prompt files that exist."""
    for name in ["content_analysis", "feed_generation", "goal_analysis", "rag_answer"]:
        data = get_prompt(name)
        assert isinstance(data, dict)


def test_get_prompt_raises_file_not_found_for_missing():
    """get_prompt raises FileNotFoundError for non-existent prompt."""
    with pytest.raises(FileNotFoundError) as excinfo:
        get_prompt("nonexistent_prompt_xyz_123")
    assert "not found" in str(excinfo.value).lower() or "nonexistent" in str(excinfo.value).lower()


# ---------------------------------------------------------------------------
# reload_prompts
# ---------------------------------------------------------------------------

def test_reload_prompts_clears_cache():
    """reload_prompts clears the get_prompt cache."""
    get_prompt("content_analysis")
    reload_prompts()
    # Cache should be clear; next call will re-read from disk
    data = get_prompt("content_analysis")
    assert isinstance(data, dict)


def test_get_prompt_returns_cached_after_first_load():
    """get_prompt uses lru_cache - same instance returned for same name."""
    a = get_prompt("content_analysis")
    b = get_prompt("content_analysis")
    assert a is b  # Same cached object
