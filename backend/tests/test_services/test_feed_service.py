"""Unit tests for app/services/feed_service.py."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.config import Settings
from app.services.feed_service import (
    get_top_n,
    generate_rule_feed,
    generate_ai_feed,
    get_suggested_feed,
)

from tests.conftest import MockSupabaseClient


# ---------------------------------------------------------------------------
# get_top_n
# ---------------------------------------------------------------------------


def test_get_top_n_returns_top_n_sorted_by_count():
    """get_top_n returns top N items sorted by count descending."""
    obj = {"a": 10, "b": 30, "c": 20, "d": 5}
    result = get_top_n(obj, 3)
    assert result == [("b", 30), ("c", 20), ("a", 10)]


def test_get_top_n_with_empty_dict():
    """get_top_n with empty dict returns empty list."""
    result = get_top_n({}, 5)
    assert result == []


def test_get_top_n_with_n_greater_than_len():
    """get_top_n with n > len(obj) returns all items."""
    obj = {"x": 1, "y": 2}
    result = get_top_n(obj, 10)
    assert result == [("y", 2), ("x", 1)]


# ---------------------------------------------------------------------------
# generate_rule_feed
# ---------------------------------------------------------------------------


def test_generate_rule_feed_creates_items_from_categories():
    """generate_rule_feed creates items from categories."""
    categories = [("Tech", 5), ("Health", 3)]
    tags = [("python", 2)]
    platforms = [("youtube", 1)]
    interests = {"total_saved": 10}
    result = generate_rule_feed(categories, tags, platforms, interests)
    assert len(result) == 2
    assert result[0]["category"] == "Tech"
    assert result[1]["category"] == "Health"
    assert "Tech" in result[0]["title"]


def test_generate_rule_feed_with_no_platforms():
    """generate_rule_feed with no platforms uses 'other'."""
    categories = [("Tech", 5)]
    tags = []
    platforms = []
    interests = {}
    result = generate_rule_feed(categories, tags, platforms, interests)
    assert len(result) == 1
    assert result[0]["platform"] == "other"


# ---------------------------------------------------------------------------
# generate_ai_feed
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_generate_ai_feed_calls_provider_and_returns_items():
    """generate_ai_feed calls provider and returns items."""
    settings = Settings(
        supabase_url="https://test.supabase.co",
        supabase_service_role_key="test-key",
        supabase_jwt_secret="test-jwt-secret-that-is-at-least-32-chars-long",
    )
    mock_provider = MagicMock()
    mock_provider.generate_text = AsyncMock(
        return_value='[{"title": "Article 1", "description": "Desc 1", '
        '"source_url": "https://example.com/1", "category": "Tech", '
        '"content_type": "article", "platform": "youtube", "reason": "For you"}]'
    )

    with patch("app.services.feed_service.get_prompt") as mock_get_prompt:
        mock_get_prompt.return_value = {
            "system": "System prompt",
            "user_template": "{top_categories} {top_tags} {top_platforms} {total_saved}",
        }
        result = await generate_ai_feed(
            settings,
            mock_provider,
            [("Tech", 5)],
            [("python", 2)],
            [("youtube", 1)],
            {"total_saved": 10},
        )

    assert len(result) == 1
    assert result[0]["title"] == "Article 1"
    assert result[0]["category"] == "Tech"
    mock_provider.generate_text.assert_called_once()


@pytest.mark.asyncio
async def test_generate_ai_feed_handles_list_response_format():
    """generate_ai_feed handles list response format."""
    settings = Settings(
        supabase_url="https://test.supabase.co",
        supabase_service_role_key="test-key",
        supabase_jwt_secret="test-jwt-secret-that-is-at-least-32-chars-long",
    )
    mock_provider = MagicMock()
    mock_provider.generate_text = AsyncMock(
        return_value='{"items": [{"title": "Item", "description": "D", '
        '"source_url": "", "category": "Tech", "content_type": "article", '
        '"platform": "other", "reason": ""}]}'
    )

    with patch("app.services.feed_service.get_prompt") as mock_get_prompt:
        mock_get_prompt.return_value = {
            "system": "System",
            "user_template": "{top_categories} {top_tags} {top_platforms} {total_saved}",
        }
        result = await generate_ai_feed(
            settings,
            mock_provider,
            [],
            [],
            [],
            {},
        )

    assert len(result) == 1
    assert result[0]["title"] == "Item"


# ---------------------------------------------------------------------------
# get_suggested_feed
# ---------------------------------------------------------------------------


@pytest.fixture
def feed_mock_db():
    """Mock db for get_suggested_feed tests."""
    return MockSupabaseClient()


@pytest.mark.asyncio
async def test_get_suggested_feed_returns_empty_when_no_shared_collections(
    feed_mock_db,
):
    """get_suggested_feed returns empty when no shared collections."""
    feed_mock_db.set_table_data("content", [{"id": "c1", "ai_category": "Tech", "url": "u1"}])
    feed_mock_db.set_table_data("collections", [])
    feed_mock_db.set_table_data("collection_items", [])
    feed_mock_db.set_table_data("content_tags", [])

    result = await get_suggested_feed("user-1", feed_mock_db)

    assert result == []


@pytest.mark.asyncio
async def test_get_suggested_feed_scores_by_category_overlap(feed_mock_db):
    """get_suggested_feed scores by category overlap."""
    user_content = [
        {"id": "uc1", "ai_category": "Tech", "url": "user-url-1"},
        {"id": "uc2", "ai_category": "Tech", "url": "user-url-2"},
    ]
    shared_cols = [{"id": "col1"}]
    collection_items = [{"content_id": "sc1"}, {"content_id": "sc2"}]
    candidates = [
        {
            "id": "sc1",
            "user_id": "other-user",
            "url": "cand-url-1",
            "title": "Tech Article",
            "ai_category": "Tech",
            "created_at": "2024-01-01T00:00:00Z",
        },
        {
            "id": "sc2",
            "user_id": "other-user",
            "url": "cand-url-2",
            "title": "Health Article",
            "ai_category": "Health",
            "created_at": "2024-01-02T00:00:00Z",
        },
    ]

    feed_mock_db.set_table_data("content", user_content)
    feed_mock_db.add_table_response("content", candidates)
    feed_mock_db.set_table_data("collections", shared_cols)
    feed_mock_db.set_table_data("collection_items", collection_items)
    feed_mock_db.set_table_data("content_tags", [])

    result = await get_suggested_feed("user-1", feed_mock_db)

    assert len(result) >= 1
    assert all("relevance_score" in r for r in result)
    assert result[0]["ai_category"] == "Tech"


@pytest.mark.asyncio
async def test_get_suggested_feed_pagination_works():
    """get_suggested_feed pagination works."""
    feed_mock_db = MockSupabaseClient()
    user_content = [{"id": "uc1", "ai_category": "Tech", "url": "u1"}]
    shared_cols = [{"id": "col1"}]
    collection_items = [{"content_id": f"c{i}"} for i in range(5)]
    candidates = [
        {
            "id": f"c{i}",
            "user_id": "other",
            "url": f"url-{i}",
            "title": f"Item {i}",
            "ai_category": "Tech",
            "created_at": f"2024-01-0{i+1}T00:00:00Z",
        }
        for i in range(5)
    ]

    feed_mock_db.set_table_data("content", user_content)
    feed_mock_db.add_table_response("content", candidates)
    feed_mock_db.set_table_data("collections", shared_cols)
    feed_mock_db.set_table_data("collection_items", collection_items)
    feed_mock_db.set_table_data("content_tags", [])

    result = await get_suggested_feed("user-1", feed_mock_db, limit=2, offset=0)
    assert len(result) == 2

    feed_mock_db2 = MockSupabaseClient()
    feed_mock_db2.set_table_data("content", user_content)
    feed_mock_db2.add_table_response("content", candidates)
    feed_mock_db2.set_table_data("collections", shared_cols)
    feed_mock_db2.set_table_data("collection_items", collection_items)
    feed_mock_db2.set_table_data("content_tags", [])

    result2 = await get_suggested_feed("user-1", feed_mock_db2, limit=2, offset=2)
    assert len(result2) == 2
    assert result[0]["id"] != result2[0]["id"]
