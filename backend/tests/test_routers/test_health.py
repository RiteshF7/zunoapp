"""API integration tests for health and config endpoints."""

import pytest


def test_get_health_returns_200_with_status_ok(client):
    """GET /health returns 200 with status, version, uptime_seconds."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "uptime_seconds" in data
    assert data["version"] == "1.0.0"
    assert isinstance(data["uptime_seconds"], (int, float))
    assert data["uptime_seconds"] >= 0


def test_get_health_live_returns_200(client):
    """GET /health/live always returns 200."""
    response = client.get("/health/live")
    assert response.status_code == 200


def test_get_health_ready_returns_200_when_db_healthy(client, mock_db):
    """GET /health/ready returns 200 when DB is healthy."""
    response = client.get("/health/ready")
    assert response.status_code == 200


def test_get_health_ready_returns_503_when_db_fails(client):
    """GET /health/ready returns 503 when DB check fails."""
    from app.main import app
    from app.dependencies import get_supabase

    class FailingDB:
        def table(self, name):
            raise Exception("DB connection failed")

    app.dependency_overrides[get_supabase] = lambda: FailingDB()
    try:
        response = client.get("/health/ready")
        assert response.status_code == 503
    finally:
        app.dependency_overrides.pop(get_supabase, None)


def test_get_root_redirects_to_static_index(client):
    """GET / redirects to /static/index.html (status 307)."""
    response = client.get("/", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == "/static/index.html"


def test_get_api_config_returns_valid_app_config(client):
    """GET /api/v1/config returns 200 with valid AppConfigOut."""
    response = client.get("/api/v1/config")
    assert response.status_code == 200
    data = response.json()
    assert "app_version" in data
    assert "min_supported_version" in data
    assert "feature_flags" in data
    assert "content_limits" in data
    assert "feed_settings" in data
    assert "app_links" in data
    assert "supported_platforms" in data
