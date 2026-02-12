"""Tests for FastAPI lifespan (startup/shutdown)."""

from __future__ import annotations

import pytest


def test_health_uptime_reflects_start_time(client):
    """After app has started, /health returns uptime_seconds >= 0."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json().get("uptime_seconds", -1) >= 0


def test_lifespan_completes_without_error(client):
    """Using the app (client) runs lifespan; no exception."""
    # First request triggers lifespan startup if not already run
    r = client.get("/health/live")
    assert r.status_code == 200
    # Shutdown runs when client context exits (after test)


def test_app_state_has_start_time_after_request(client):
    """App state has start_time after at least one request (lifespan ran)."""
    client.get("/health")
    from app.main import app
    assert hasattr(app.state, "start_time")
    assert app.state.start_time > 0
