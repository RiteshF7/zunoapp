"""API integration tests for feed endpoints."""

import pytest

TEST_USER_ID = "test-user-00000000-0000-0000-0000-000000000001"

SAMPLE_FEED_ITEM = {
    "id": "feed-1",
    "title": "Feed Item 1",
    "description": "Description",
    "image_url": None,
    "source_url": "https://example.com/1",
    "category": "Tech",
    "content_type": "article",
    "platform": "web",
    "likes": 0,
    "relevance_score": None,
    "reason": None,
    "created_at": "2024-01-01T00:00:00Z",
}


def test_get_feed_returns_paginated_items(client, mock_db):
    """GET /api/v1/feed returns PaginatedResponse with items."""
    mock_db.set_table_data("feed_items", [SAMPLE_FEED_ITEM])

    response = client.get("/api/v1/feed")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "has_more" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Feed Item 1"


def test_get_feed_with_category_filter(client, mock_db):
    """GET /api/v1/feed with category filter."""
    mock_db.set_table_data("feed_items", [SAMPLE_FEED_ITEM])

    response = client.get("/api/v1/feed?category=Tech")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["category"] == "Tech"


def test_get_feed_bookmarks_returns_list(client, mock_db):
    """GET /api/v1/feed/bookmarks returns list."""
    mock_db.set_table_data(
        "bookmarks",
        [{"feed_item_id": "feed-1"}, {"feed_item_id": "feed-2"}],
    )

    response = client.get("/api/v1/feed/bookmarks")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert "feed-1" in data
    assert "feed-2" in data


def test_post_bookmarks_toggle_adds_bookmark(client, mock_db):
    """POST /api/v1/feed/bookmarks/{id}/toggle adds bookmark (insert)."""
    mock_db.set_table_data("bookmarks", [])

    response = client.post(
        "/api/v1/feed/bookmarks/feed-123/toggle",
        headers={"Authorization": "Bearer test-token-123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["bookmarked"] is True


def test_post_bookmarks_toggle_removes_existing_bookmark(client, mock_db):
    """POST /api/v1/feed/bookmarks/{id}/toggle removes existing bookmark."""
    mock_db.set_table_data("bookmarks", [{"id": "bk-1", "user_id": TEST_USER_ID, "feed_item_id": "feed-123"}])

    response = client.post(
        "/api/v1/feed/bookmarks/feed-123/toggle",
        headers={"Authorization": "Bearer test-token-123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["bookmarked"] is False
