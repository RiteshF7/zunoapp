"""Unit tests for app/services/collection_manager.py."""

from __future__ import annotations

import pytest

from app.services.collection_manager import ensure_category_collection
from tests.conftest import MockSupabaseClient


def test_returns_none_for_empty_category():
    """Returns None for empty category."""
    db = MockSupabaseClient()
    result = ensure_category_collection(
        db, "user-123", "", "content-456"
    )
    assert result is None


def test_returns_none_for_uncategorized():
    """Returns None for 'Uncategorized' category."""
    db = MockSupabaseClient()
    result = ensure_category_collection(
        db, "user-123", "Uncategorized", "content-456"
    )
    assert result is None


def test_creates_new_collection_if_none_exists():
    """Creates new collection if none exists for that category."""
    db = MockSupabaseClient()
    new_collection = {
        "id": "coll-new-123",
        "title": "Tech",
        "user_id": "user-123",
        "is_smart": True,
        "smart_rules": {"category": "Tech"},
    }
    db.set_table_data(
        "collections",
        [],  # No existing collections
        insert_data=[new_collection],
    )
    db.set_rpc_data("increment_collection_count", None)

    result = ensure_category_collection(db, "user-123", "Tech", "content-456")

    assert result is not None
    assert result["id"] == "coll-new-123"
    assert result["title"] == "Tech"
    assert result["smart_rules"]["category"] == "Tech"


def test_reuses_existing_smart_collection():
    """Reuses existing smart collection when one matches the category."""
    db = MockSupabaseClient()
    existing = {
        "id": "coll-existing-456",
        "title": "Cooking",
        "user_id": "user-123",
        "is_smart": True,
        "smart_rules": {"category": "Cooking"},
    }
    db.set_table_data("collections", [existing])

    result = ensure_category_collection(db, "user-123", "Cooking", "content-789")

    assert result is not None
    assert result["id"] == "coll-existing-456"
    assert result["title"] == "Cooking"


def test_creates_collection_when_existing_has_different_category():
    """Creates new collection when existing collections have different categories."""
    db = MockSupabaseClient()
    other_collection = {
        "id": "coll-other",
        "title": "Tech",
        "user_id": "user-123",
        "is_smart": True,
        "smart_rules": {"category": "Tech"},
    }
    new_travel = {
        "id": "coll-travel-new",
        "title": "Travel",
        "user_id": "user-123",
        "is_smart": True,
        "smart_rules": {"category": "Travel"},
    }
    db.set_table_data(
        "collections",
        [other_collection],  # Has Tech, not Travel
        insert_data=[new_travel],
    )

    result = ensure_category_collection(db, "user-123", "Travel", "content-abc")

    assert result is not None
    assert result["title"] == "Travel"
    assert result["id"] == "coll-travel-new"


def test_returns_none_when_insert_fails():
    """Returns None when collection insert returns no data."""
    db = MockSupabaseClient()
    db.set_table_data(
        "collections",
        [],  # No existing
        insert_data=[],  # Insert returns nothing (failure)
    )

    result = ensure_category_collection(db, "user-123", "Finance", "content-xyz")

    assert result is None
