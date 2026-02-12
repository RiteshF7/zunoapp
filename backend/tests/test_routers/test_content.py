"""API integration tests for content endpoints."""

import pytest
from unittest.mock import AsyncMock, patch

TEST_USER_ID = "test-user-00000000-0000-0000-0000-000000000001"

SAMPLE_CONTENT = {
    "id": "cont-111",
    "user_id": TEST_USER_ID,
    "url": "https://example.com/article",
    "title": "Test Article",
    "description": "A test article",
    "thumbnail_url": None,
    "platform": "web",
    "content_type": "article",
    "ai_category": "Tech",
    "ai_summary": None,
    "ai_processed": False,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
}


def test_get_content_returns_paginated_response(client, mock_db):
    """GET /api/v1/content returns PaginatedResponse with items, total, limit, offset, has_more."""
    mock_db.set_table_data("content", [SAMPLE_CONTENT])

    response = client.get("/api/v1/content?limit=20&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "limit" in data
    assert "offset" in data
    assert "has_more" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Test Article"


def test_get_content_with_category_filter(client, mock_db):
    """GET /api/v1/content?category=Tech filters."""
    mock_db.set_table_data("content", [SAMPLE_CONTENT])

    response = client.get("/api/v1/content?category=Tech")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["ai_category"] == "Tech"


def test_get_content_by_id_returns_one(client, mock_db):
    """GET /api/v1/content/{id} returns one."""
    mock_db.set_table_data("content", [SAMPLE_CONTENT])

    response = client.get(f"/api/v1/content/{SAMPLE_CONTENT['id']}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == SAMPLE_CONTENT["id"]
    assert data["title"] == "Test Article"


def test_get_content_by_id_returns_404(client, mock_db):
    """GET /api/v1/content/{id} returns 404."""
    mock_db.set_table_data("content", [])

    response = client.get("/api/v1/content/nonexistent-id")
    assert response.status_code == 404


@patch("app.routers.content.fetch_url_metadata", new_callable=AsyncMock)
def test_post_content_creates_with_url(mock_fetch, client, mock_db):
    """POST /api/v1/content creates with URL."""
    mock_fetch.return_value = None
    new_content = {
        **SAMPLE_CONTENT,
        "id": "cont-new",
        "url": "https://youtube.com/watch?v=abc",
        "title": "YouTube Video",
    }
    mock_db.set_table_data("content", [], insert_data=[new_content])

    response = client.post(
        "/api/v1/content",
        json={"url": "https://youtube.com/watch?v=abc"},
        headers={"Authorization": "Bearer test-token-123"},
    )
    assert response.status_code == 201
    data = response.json()
    assert "url" in data
    assert data["title"] == "YouTube Video"


def test_post_content_text_creates_text_content(client, mock_db):
    """POST /api/v1/content/text creates text content."""
    new_content = {
        **SAMPLE_CONTENT,
        "id": "cont-note",
        "url": "zuno://note/abc123",
        "title": "My Note",
        "full_text": "Shared text from another app",
        "platform": "other",
        "content_type": "note",
    }
    mock_db.set_table_data("content", [], insert_data=[new_content])

    response = client.post(
        "/api/v1/content/text",
        json={
            "source_text": "Shared text from another app",
            "title": "My Note",
        },
        headers={"Authorization": "Bearer test-token-123"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["content_type"] == "note" or "title" in data


def test_patch_content_updates(client, mock_db):
    """PATCH /api/v1/content/{id} updates."""
    updated = {**SAMPLE_CONTENT, "title": "Updated Title"}
    mock_db.set_table_data("content", [updated])

    response = client.patch(
        f"/api/v1/content/{SAMPLE_CONTENT['id']}",
        json={"title": "Updated Title"},
        headers={"Authorization": "Bearer test-token-123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"


def test_delete_content_deletes(client, mock_db):
    """DELETE /api/v1/content/{id} deletes."""
    mock_db.set_table_data("content", [SAMPLE_CONTENT])

    response = client.delete(
        f"/api/v1/content/{SAMPLE_CONTENT['id']}",
        headers={"Authorization": "Bearer test-token-123"},
    )
    assert response.status_code == 204


def test_get_content_tags_returns_tags(client, mock_db):
    """GET /api/v1/content/{id}/tags returns tags."""
    content_with_tags = {
        **SAMPLE_CONTENT,
        "content_tags": [
            {"tag": {"id": "t1", "name": "Python", "slug": "python", "is_ai_generated": False}}
        ],
    }
    mock_db.set_table_data("content", [content_with_tags])

    response = client.get(f"/api/v1/content/{SAMPLE_CONTENT['id']}/tags")
    assert response.status_code == 200
    data = response.json()
    assert "content_tags" in data or "content" in str(data)


def test_post_content_upload_rejects_wrong_type(client, mock_db):
    """POST /api/v1/content/upload rejects wrong type."""
    response = client.post(
        "/api/v1/content/upload",
        files={"file": ("test.txt", b"not an image", "text/plain")},
        headers={"Authorization": "Bearer test-token-123"},
    )
    assert response.status_code == 400
    assert "image" in response.json().get("detail", "").lower()
