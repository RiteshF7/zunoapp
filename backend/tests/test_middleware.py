"""Tests for middleware stack: security headers, request ID, timing, GZip."""

from __future__ import annotations

import re

import pytest


# ---------------------------------------------------------------------------
# Security headers
# ---------------------------------------------------------------------------

def test_response_has_x_content_type_options(client):
    response = client.get("/health")
    assert response.headers.get("x-content-type-options") == "nosniff"


def test_response_has_x_frame_options(client):
    response = client.get("/health")
    assert response.headers.get("x-frame-options") == "DENY"


def test_response_has_x_xss_protection(client):
    response = client.get("/health")
    assert response.headers.get("x-xss-protection") == "1; mode=block"


def test_response_has_referrer_policy(client):
    response = client.get("/health")
    assert response.headers.get("referrer-policy") == "strict-origin-when-cross-origin"


def test_response_has_permissions_policy(client):
    response = client.get("/health")
    assert response.headers.get("permissions-policy") == "camera=(), microphone=()"


# ---------------------------------------------------------------------------
# Request ID
# ---------------------------------------------------------------------------

def test_response_has_x_request_id_header(client):
    response = client.get("/health")
    rid = response.headers.get("x-request-id")
    assert rid is not None
    # UUID v4 format: 8-4-4-4-12 hex chars
    assert re.match(
        r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        rid,
    )


def test_request_id_is_unique_per_request(client):
    r1 = client.get("/health")
    r2 = client.get("/health")
    assert r1.headers["x-request-id"] != r2.headers["x-request-id"]


def test_request_id_appears_on_error_responses(client):
    """Error responses also carry the X-Request-ID header."""
    response = client.get("/nonexistent-route-xyz")
    assert response.status_code == 404
    assert "x-request-id" in response.headers


# ---------------------------------------------------------------------------
# Request timing
# ---------------------------------------------------------------------------

def test_response_has_x_response_time_header(client):
    response = client.get("/health")
    rt = response.headers.get("x-response-time")
    assert rt is not None
    assert rt.endswith("ms")


def test_response_time_is_numeric(client):
    response = client.get("/health")
    rt = response.headers["x-response-time"]
    numeric_part = rt.replace("ms", "")
    assert float(numeric_part) >= 0
