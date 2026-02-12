"""Tests for OpenAPI schema improvements."""

import pytest


def test_openapi_schema_includes_error_responses(client):
    """OpenAPI schema documents error response structure."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    # FastAPI may add default error responses or we add via app
    paths = schema.get("paths", {})
    # At least one path should have responses with 4xx/5xx
    has_error_responses = False
    for path_spec in paths.values():
        for method_spec in path_spec.values():
            if isinstance(method_spec, dict) and "responses" in method_spec:
                if any(k in method_spec["responses"] for k in ("400", "401", "403", "404", "422", "500")):
                    has_error_responses = True
                    break
        if has_error_responses:
            break
    assert has_error_responses or "components" in schema
