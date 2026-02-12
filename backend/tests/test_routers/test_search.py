"""API integration tests for search endpoints."""

import pytest
from unittest.mock import AsyncMock, patch

SAMPLE_SEARCH_RESULT = {
    "id": "cont-1",
    "url": "https://example.com/1",
    "title": "Python Tutorial",
    "description": "Learn Python",
    "thumbnail_url": None,
    "platform": "web",
    "content_type": "article",
    "ai_category": "Tech",
    "ai_summary": None,
    "created_at": "2024-01-01T00:00:00Z",
    "rank": 0.9,
    "combined_score": None,
}

SAMPLE_TAG = {"name": "Python", "slug": "python", "usage_count": 42}


def test_get_search_returns_results(client, mock_db):
    """GET /api/v1/search?q=test returns results."""
    mock_db.set_rpc_data("search_content", [SAMPLE_SEARCH_RESULT])

    response = client.get("/api/v1/search?q=test")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["title"] == "Python Tutorial"


def test_get_search_requires_q_parameter(client, mock_db):
    """GET /api/v1/search requires q parameter (422 without)."""
    response = client.get("/api/v1/search")
    assert response.status_code == 422


@patch("app.routers.search.generate_query_embedding", new_callable=AsyncMock)
def test_get_search_hybrid_with_embedding_fallback(mock_embedding, client, mock_db):
    """GET /api/v1/search/hybrid?q=test with embedding mock returns None for FTS fallback."""
    mock_embedding.return_value = None
    mock_db.set_rpc_data("search_content", [SAMPLE_SEARCH_RESULT])

    response = client.get("/api/v1/search/hybrid?q=test")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    mock_embedding.assert_called_once()


@patch("app.routers.search.generate_query_embedding", new_callable=AsyncMock)
def test_get_search_hybrid_falls_back_to_fts(mock_embedding, client, mock_db):
    """GET /api/v1/search/hybrid falls back to FTS when embedding is None."""
    mock_embedding.return_value = None
    mock_db.set_rpc_data("search_content", [SAMPLE_SEARCH_RESULT])

    response = client.get("/api/v1/search/hybrid?q=test")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Python Tutorial"


def test_get_search_by_tag_returns_results(client, mock_db):
    """GET /api/v1/search/tag/python returns results."""
    mock_db.set_rpc_data("search_by_tag", [SAMPLE_SEARCH_RESULT])

    response = client.get("/api/v1/search/tag/python")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1


def test_get_popular_tags_returns_tags(client, mock_db):
    """GET /api/v1/search/tags/popular returns tags."""
    mock_db.set_table_data("tags", [SAMPLE_TAG])

    response = client.get("/api/v1/search/tags/popular")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["name"] == "Python"
    assert data[0]["slug"] == "python"
