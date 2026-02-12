"""API integration tests for the user preferences router."""

import pytest

from tests.conftest import TEST_USER_ID


def test_get_user_preferences_returns_prefs(client, mock_db, auth_headers):
    """GET /api/v1/user-preferences returns user preferences."""
    prefs = {
        "id": "pref-1",
        "user_id": TEST_USER_ID,
        "feed_type": "usersaved",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
    }
    mock_db.set_table_data("user_preferences", [prefs])
    mock_db.add_table_response("user_preferences", [prefs])

    res = client.get("/api/v1/user-preferences", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["feed_type"] == "usersaved"
    assert data["user_id"] == TEST_USER_ID


def test_get_user_preferences_returns_defaults_when_not_found(client, mock_db, auth_headers):
    """GET /api/v1/user-preferences returns empty/defaults when not found."""
    mock_db.set_table_data("user_preferences", [])

    res = client.get("/api/v1/user-preferences", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "feed_type" in data
    assert data["feed_type"] == "usersaved"


def test_patch_user_preferences_updates_feed_type(client, mock_db, auth_headers):
    """PATCH /api/v1/user-preferences updates feed_type."""
    prefs = {
        "id": "pref-1",
        "user_id": TEST_USER_ID,
        "feed_type": "usersaved",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
    }
    updated = {**prefs, "feed_type": "suggestedcontent", "updated_at": "2024-01-02T00:00:00Z"}
    mock_db.set_table_data("user_preferences", [prefs])
    mock_db.add_table_response("user_preferences", [updated])

    res = client.patch(
        "/api/v1/user-preferences",
        headers=auth_headers,
        json={"feed_type": "suggestedcontent"},
    )
    assert res.status_code == 200
    assert res.json()["feed_type"] == "suggestedcontent"


def test_patch_user_preferences_rejects_empty_body(client, mock_db, auth_headers):
    """PATCH /api/v1/user-preferences rejects empty body."""
    res = client.patch(
        "/api/v1/user-preferences",
        headers=auth_headers,
        json={},
    )
    assert res.status_code == 400
    assert "No fields" in res.json()["detail"]


def test_patch_user_preferences_returns_error_when_update_fails(client, mock_db, auth_headers):
    """PATCH /api/v1/user-preferences returns 500 when update fails."""
    prefs = {"id": "pref-1", "user_id": TEST_USER_ID, "feed_type": "usersaved"}
    mock_db.set_table_data("user_preferences", [prefs])
    mock_db.add_table_response("user_preferences", [])

    res = client.patch(
        "/api/v1/user-preferences",
        headers=auth_headers,
        json={"feed_type": "usersaved"},
    )
    assert res.status_code == 500
    assert "Failed to update" in res.json()["detail"]
