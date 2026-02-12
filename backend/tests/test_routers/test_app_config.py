"""API integration tests for the app config router."""

import pytest


def test_get_config_returns_valid_config(client):
    """GET /api/v1/config returns valid config."""
    res = client.get("/api/v1/config")
    assert res.status_code == 200
    data = res.json()
    assert "app_version" in data
    assert "feature_flags" in data
    assert "content_limits" in data
    assert "feed_settings" in data
    assert "app_links" in data
    assert "supported_platforms" in data


def test_get_config_has_correct_app_version(client):
    """GET /api/v1/config has correct app_version."""
    res = client.get("/api/v1/config")
    assert res.status_code == 200
    data = res.json()
    assert data["app_version"] == "1.0.0"
    assert data["min_supported_version"] == "1.0.0"


def test_get_config_has_feature_flags(client):
    """GET /api/v1/config has feature_flags."""
    res = client.get("/api/v1/config")
    assert res.status_code == 200
    flags = res.json()["feature_flags"]
    assert "feed_enabled" in flags
    assert "ai_processing_enabled" in flags
    assert "search_enabled" in flags
    assert "collections_enabled" in flags
    assert flags["feed_enabled"] is True
