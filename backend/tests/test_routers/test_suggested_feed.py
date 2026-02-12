"""API integration tests for the suggested feed router."""

from unittest.mock import AsyncMock, patch

import pytest

from tests.conftest import TEST_USER_ID


def test_get_suggested_feed_returns_items(client, mock_db, auth_headers):
    """GET /api/v1/suggested-feed returns items."""
    with patch(
        "app.routers.suggested_feed.get_suggested_feed",
        new_callable=AsyncMock,
        return_value=[
            {
                "id": "c1",
                "user_id": "other-user",
                "url": "https://example.com/1",
                "title": "Suggested 1",
                "ai_category": "tech",
                "relevance_score": 0.9,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
            },
        ],
    ):
        res = client.get("/api/v1/suggested-feed", headers=auth_headers)

    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["title"] == "Suggested 1"
    assert data[0]["relevance_score"] == 0.9


def test_get_suggested_feed_with_category_filter(client, mock_db, auth_headers):
    """GET /api/v1/suggested-feed with category filter."""
    with patch(
        "app.routers.suggested_feed.get_suggested_feed",
        new_callable=AsyncMock,
        return_value=[
            {
                "id": "c1",
                "user_id": "other",
                "url": "https://ex.com",
                "title": "Tech item",
                "ai_category": "technology",
                "relevance_score": 0.85,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
            },
        ],
    ):
        res = client.get(
            "/api/v1/suggested-feed?category=technology",
            headers=auth_headers,
        )

    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["ai_category"] == "technology"


def test_get_suggested_feed_with_pagination(client, mock_db, auth_headers):
    """GET /api/v1/suggested-feed with pagination."""
    items = [
        {
            "id": f"c{i}",
            "user_id": "other",
            "url": f"https://ex.com/{i}",
            "title": f"Item {i}",
            "ai_category": "tech",
            "relevance_score": 0.8,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
        }
        for i in range(5)
    ]
    with patch(
        "app.routers.suggested_feed.get_suggested_feed",
        new_callable=AsyncMock,
        return_value=items,
    ):
        res = client.get(
            "/api/v1/suggested-feed?limit=5&offset=2",
            headers=auth_headers,
        )

    assert res.status_code == 200
    data = res.json()
    assert len(data) == 5


def test_get_suggested_feed_returns_empty_for_new_user(client, mock_db, auth_headers):
    """GET /api/v1/suggested-feed returns empty for new user (no shared collections)."""
    from app.utils.cache import bust_cache

    bust_cache("suggested_feed:*")
    with patch(
        "app.routers.suggested_feed.get_suggested_feed",
        new_callable=AsyncMock,
        return_value=[],
    ):
        res = client.get("/api/v1/suggested-feed", headers=auth_headers)

    assert res.status_code == 200
    assert res.json() == []
