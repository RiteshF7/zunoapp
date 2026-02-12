"""API integration tests for the admin router."""

import pytest


def test_get_cache_stats_returns_stats(client, auth_headers):
    """GET /api/v1/admin/cache/stats returns cache statistics."""
    res = client.get("/api/v1/admin/cache/stats", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_entries" in data
    assert "active_entries" in data
    assert "expired_entries" in data
    assert "max_entries" in data


def test_post_cache_bust_clears_cache(client, auth_headers):
    """POST /api/v1/admin/cache/bust clears cache."""
    res = client.post("/api/v1/admin/cache/bust", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "pattern" in data
    assert "entries_removed" in data
    assert data["pattern"] == "*"


def test_post_cache_bust_with_pattern(client, auth_headers):
    """POST /api/v1/admin/cache/bust with pattern clears matching entries."""
    res = client.post(
        "/api/v1/admin/cache/bust",
        headers=auth_headers,
        params={"pattern": "feed:*"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["pattern"] == "feed:*"
    assert "entries_removed" in data


def test_post_prompts_reload_clears_prompt_cache(client, auth_headers):
    """POST /api/v1/admin/prompts/reload clears prompt cache."""
    res = client.post("/api/v1/admin/prompts/reload", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "reloaded" in data["message"].lower()
