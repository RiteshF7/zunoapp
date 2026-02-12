"""API integration tests for the knowledge router."""

from unittest.mock import AsyncMock, patch

import pytest

from tests.conftest import TEST_USER_ID


def test_ask_returns_503_without_gcp(client, mock_db, auth_headers):
    """POST /api/v1/knowledge/ask returns 503 when GCP is not configured."""
    res = client.post(
        "/api/v1/knowledge/ask",
        headers=auth_headers,
        json={"query": "What have I saved about Python?"},
    )
    assert res.status_code == 503
    assert "GCP" in res.json()["detail"] or "Vertex" in res.json()["detail"]


def test_ask_validates_query_length(client, mock_db, auth_headers):
    """POST /api/v1/knowledge/ask rejects empty query (Pydantic validation)."""
    res = client.post(
        "/api/v1/knowledge/ask",
        headers=auth_headers,
        json={"query": ""},
    )
    assert res.status_code == 422


def test_reindex_returns_503_without_gcp(client, mock_db, auth_headers):
    """POST /api/v1/knowledge/reindex returns 503 when GCP is not configured."""
    mock_db.set_table_data("content", [])

    res = client.post(
        "/api/v1/knowledge/reindex",
        headers=auth_headers,
        json={},
    )
    assert res.status_code == 503


def test_get_stats_returns_counts(client, mock_db, auth_headers):
    """GET /api/v1/knowledge/stats returns knowledge base counts."""
    mock_db.set_table_data("content_chunks", [{"id": "1"}, {"id": "2"}], count=2)
    mock_db.add_table_response(
        "content_chunks",
        [{"content_id": "c1"}, {"content_id": "c2"}, {"content_id": "c1"}],
    )
    mock_db.set_table_data("content", [], count=5)

    res = client.get("/api/v1/knowledge/stats", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_chunks" in data
    assert "indexed_content" in data
    assert "total_processed_content" in data
    assert "needs_reindex" in data


def test_reindex_processes_when_gcp_configured(client, mock_db, auth_headers, test_settings):
    """POST /api/v1/knowledge/reindex processes content when GCP is configured."""
    from app.main import app
    from app.config import get_settings

    test_settings.gcp_project_id = "test-gcp-project"
    app.dependency_overrides[get_settings] = lambda: test_settings

    content_items = [
        {
            "id": "c1",
            "user_id": TEST_USER_ID,
            "url": "https://example.com",
            "title": "Test",
            "ai_processed": True,
            "full_text": "Some text",
        },
    ]
    mock_db.set_table_data("content", content_items)

    with patch(
        "app.routers.knowledge.index_content_batch",
        new_callable=AsyncMock,
        return_value={"content_processed": 1, "chunks_created": 3, "errors": 0},
    ):
        res = client.post(
            "/api/v1/knowledge/reindex",
            headers=auth_headers,
            json={},
        )

    assert res.status_code == 200
    data = res.json()
    assert data["content_processed"] == 1
    assert data["chunks_created"] == 3


def test_ask_handles_no_matching_chunks(client, mock_db, auth_headers, test_settings):
    """POST /api/v1/knowledge/ask returns fallback when no chunks match (mock AI)."""
    from app.main import app
    from app.config import get_settings

    test_settings.gcp_project_id = "test-gcp-project"
    app.dependency_overrides[get_settings] = lambda: test_settings

    mock_db.set_rpc_data("match_chunks", [])

    with patch(
        "app.routers.knowledge.expand_query",
        new_callable=AsyncMock,
        return_value="test query",
    ), patch(
        "app.routers.knowledge.generate_query_embedding",
        new_callable=AsyncMock,
        return_value=[0.1] * 768,
    ):
        res = client.post(
            "/api/v1/knowledge/ask",
            headers=auth_headers,
            json={"query": "What have I saved?"},
        )

    assert res.status_code == 200
    data = res.json()
    assert "couldn't find" in data["answer"].lower() or "Try saving" in data["answer"]
    assert data["chunks_used"] == 0
    assert data["sources"] == []


def test_get_stats_with_data(client, mock_db, auth_headers):
    """GET /api/v1/knowledge/stats returns correct structure with data."""
    mock_db.set_table_data("content_chunks", [{"id": "1"}], count=10)
    mock_db.add_table_response("content_chunks", [{"content_id": "c1"}, {"content_id": "c2"}])
    mock_db.set_table_data("content", [], count=5)

    res = client.get("/api/v1/knowledge/stats", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_chunks"] == 10
    assert data["indexed_content"] == 2
    assert data["total_processed_content"] == 5
    assert data["needs_reindex"] == 3
