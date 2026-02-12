"""Unit tests for app/services/user_interests.py."""

from __future__ import annotations

from unittest.mock import MagicMock

from app.services.user_interests import update_user_interests


def make_mock_db(select_data: list | None = None):
    """Create a mock db that returns select_data for select().execute()."""
    select_data = select_data or []
    chain = MagicMock()
    chain.select.return_value = chain
    chain.eq.return_value = chain
    chain.insert.return_value = chain
    chain.update.return_value = chain

    result = MagicMock()
    result.data = select_data
    chain.execute.return_value = result

    table_mock = MagicMock(return_value=chain)
    db = MagicMock()
    db.table = table_mock
    return db, chain


def test_creates_new_user_interests_record_when_none_exists():
    """Creates new user_interests record when none exists."""
    db, chain = make_mock_db(select_data=[])

    update_user_interests(db, "user-1", "Tech", ["python"], "youtube", "video")

    chain.insert.assert_called_once()
    insert_call = chain.insert.call_args[0][0]
    assert insert_call["user_id"] == "user-1"
    assert insert_call["categories"] == {"Tech": 1}
    assert insert_call["tags"] == {"python": 1}
    assert insert_call["platforms"] == {"youtube": 1}
    assert insert_call["content_types"] == {"video": 1}
    assert insert_call["total_saved"] == 1


def test_updates_existing_user_interests_increments_counters():
    """Updates existing user_interests (increments counters)."""
    existing = {
        "user_id": "user-1",
        "categories": {"Tech": 2},
        "tags": {"python": 1},
        "platforms": {"youtube": 3},
        "content_types": {"video": 1},
        "total_saved": 5,
    }
    db, chain = make_mock_db(select_data=[existing])

    update_user_interests(db, "user-1", "Tech", ["python", "ai"], "youtube", "video")

    chain.update.assert_called_once()
    update_call = chain.update.call_args[0][0]
    assert update_call["categories"]["Tech"] == 3
    assert update_call["tags"]["python"] == 2
    assert update_call["tags"]["ai"] == 1
    assert update_call["platforms"]["youtube"] == 4
    assert update_call["content_types"]["video"] == 2
    assert update_call["total_saved"] == 6


def test_handles_empty_tags_list():
    """Handles empty tags list."""
    db, chain = make_mock_db(select_data=[])

    update_user_interests(db, "user-1", "Tech", [], "youtube", "video")

    chain.insert.assert_called_once()
    insert_call = chain.insert.call_args[0][0]
    assert insert_call["tags"] == {}
    assert insert_call["total_saved"] == 1


def test_increments_total_saved():
    """Increments total_saved."""
    existing = {
        "user_id": "user-1",
        "categories": {"Health": 1},
        "tags": {},
        "platforms": {"other": 1},
        "content_types": {"article": 1},
        "total_saved": 10,
    }
    db, chain = make_mock_db(select_data=[existing])

    update_user_interests(db, "user-1", "Health", [], "other", "article")

    chain.update.assert_called_once()
    update_call = chain.update.call_args[0][0]
    assert update_call["total_saved"] == 11


def test_sets_last_updated_timestamp():
    """Sets last_updated timestamp on update."""
    existing = {
        "user_id": "user-1",
        "categories": {},
        "tags": {},
        "platforms": {},
        "content_types": {},
        "total_saved": 0,
    }
    db, chain = make_mock_db(select_data=[existing])

    update_user_interests(db, "user-1", "Tech", [], "youtube", "video")

    chain.update.assert_called_once()
    update_call = chain.update.call_args[0][0]
    assert "last_updated" in update_call
    assert isinstance(update_call["last_updated"], str)
