"""API integration tests for profile endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.dependencies import get_supabase, get_settings

TEST_USER_ID = "test-user-00000000-0000-0000-0000-000000000001"


@pytest.fixture
def unauth_client(mock_db, test_settings):
    """Client without auth override - uses real get_current_user for 401 tests."""
    from app.dependencies import get_current_user, get_supabase, get_settings

    app.dependency_overrides[get_supabase] = lambda: mock_db
    app.dependency_overrides[get_settings] = lambda: test_settings
    # Do NOT override get_current_user - real auth will run

    with TestClient(app, raise_server_exceptions=False) as c:
        yield c

    app.dependency_overrides.clear()


def test_get_profile_returns_profile_data(client, mock_db):
    """GET /api/v1/profile returns profile data."""
    profile_data = {
        "id": TEST_USER_ID,
        "display_name": "Test User",
        "avatar_url": None,
        "phone": None,
        "email": "test@example.com",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
    }
    mock_db.set_table_data("profiles", [profile_data])

    response = client.get("/api/v1/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == TEST_USER_ID
    assert data["display_name"] == "Test User"


def test_get_profile_returns_404_when_not_found(client, mock_db):
    """GET /api/v1/profile returns 404 when not found (empty data)."""
    mock_db.set_table_data("profiles", [])

    response = client.get("/api/v1/profile")
    assert response.status_code == 404
    assert "not found" in response.json().get("detail", "").lower()


def test_patch_profile_updates_display_name(client, mock_db):
    """PATCH /api/v1/profile updates display_name."""
    updated_profile = {
        "id": TEST_USER_ID,
        "display_name": "Updated Name",
        "avatar_url": None,
        "phone": None,
        "email": "test@example.com",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-02T00:00:00Z",
    }
    mock_db.set_table_data("profiles", [updated_profile])

    response = client.patch(
        "/api/v1/profile",
        json={"display_name": "Updated Name"},
        headers={"Authorization": "Bearer test-token-123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["display_name"] == "Updated Name"


def test_patch_profile_returns_404_when_not_found(client, mock_db):
    """PATCH /api/v1/profile returns 404 when not found."""
    mock_db.set_table_data("profiles", [])

    response = client.patch(
        "/api/v1/profile",
        json={"display_name": "Updated"},
        headers={"Authorization": "Bearer test-token-123"},
    )
    assert response.status_code == 404


def test_profile_requires_auth(unauth_client, mock_db):
    """GET /api/v1/profile returns 401 without auth."""
    mock_db.set_table_data("profiles", [{"id": TEST_USER_ID}])

    response = unauth_client.get(
        "/api/v1/profile",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert response.status_code == 401
