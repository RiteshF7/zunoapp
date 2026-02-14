"""API integration tests for the AI router."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from tests.conftest import TEST_USER_ID


def test_process_content_returns_404_for_missing_content(client, mock_db, auth_headers):
    """POST /api/v1/ai/process-content returns 404 for missing content."""
    mock_db.set_table_data("content", [])

    res = client.post(
        "/api/v1/ai/process-content",
        headers=auth_headers,
        json={"content_id": "nonexistent"},
    )
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_generate_embedding_returns_502_when_fails(client, auth_headers):
    """POST /api/v1/ai/generate-embedding returns 502 when embedding fails."""
    with patch(
        "app.routers.ai.generate_embedding",
        new_callable=AsyncMock,
        return_value=None,
    ):
        res = client.post(
            "/api/v1/ai/generate-embedding",
            headers=auth_headers,
            json={"text": "Hello world"},
        )
    assert res.status_code == 502
    assert "embedding" in res.json()["detail"].lower()


def test_generate_feed_returns_items(client, mock_db, auth_headers):
    """POST /api/v1/ai/generate-feed returns feed items."""
    interests = [
        {
            "user_id": TEST_USER_ID,
            "total_saved": 5,
            "categories": {"tech": 3, "health": 2},
            "tags": {"python": 2},
            "platforms": {"youtube": 3},
        },
    ]
    feed_items = [
        {"id": "f1", "title": "Item 1", "description": "Desc", "source_url": "https://ex.com/1", "category": "tech", "created_at": "2024-01-01T00:00:00Z"},
    ]
    mock_db.set_table_data("user_interests", interests)
    mock_db.set_table_data("feed_items", feed_items)

    res = client.post("/api/v1/ai/generate-feed", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "interests" in data


def test_generate_feed_handles_no_interests(client, mock_db, auth_headers):
    """POST /api/v1/ai/generate-feed handles user with no interests."""
    mock_db.set_table_data("user_interests", [])

    res = client.post("/api/v1/ai/generate-feed", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["items"] == []
    assert "Save more" in data["message"]


def test_process_content_returns_202_and_starts_background(client, mock_db, auth_headers):
    """POST /api/v1/ai/process-content returns 202 immediately; processing runs in background."""
    content = {
        "id": "c1",
        "user_id": TEST_USER_ID,
        "url": "https://example.com/article",
        "title": "Test",
        "description": "",
    }
    mock_db.set_table_data("content", [content])

    res = client.post(
        "/api/v1/ai/process-content",
        headers=auth_headers,
        json={"content_id": "c1"},
    )

    assert res.status_code == 202
    data = res.json()
    assert data["success"] is True
    assert data.get("message") == "Processing started"
    assert data.get("content_id") == "c1"
