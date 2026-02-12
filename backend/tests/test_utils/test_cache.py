"""Unit tests for app.utils.cache module."""

from __future__ import annotations

import pytest

from app.utils.cache import _store, bust_cache, get_cache_stats, cache, _evict_expired


def _clear_store():
    """Clear the cache store between tests to avoid pollution."""
    _store.clear()


# ---------------------------------------------------------------------------
# bust_cache
# ---------------------------------------------------------------------------

def test_bust_cache_clears_all_entries():
    _clear_store()
    _store["a"] = (0, 1)
    _store["b"] = (0, 2)
    count = bust_cache("*")
    assert count == 2
    assert len(_store) == 0


def test_bust_cache_prefix_clears_matching_only():
    _clear_store()
    _store["prefix:foo"] = (0, 1)
    _store["prefix:bar"] = (0, 2)
    _store["other:baz"] = (0, 3)
    count = bust_cache("prefix:*")
    assert count == 2
    assert "prefix:foo" not in _store
    assert "prefix:bar" not in _store
    assert "other:baz" in _store


def test_bust_cache_exact_key_clears_single():
    _clear_store()
    _store["exact_key"] = (0, 42)
    _store["other_key"] = (0, 99)
    count = bust_cache("exact_key")
    assert count == 1
    assert "exact_key" not in _store
    assert "other_key" in _store


def test_bust_cache_returns_count_of_removed():
    _clear_store()
    _store["one"] = (0, 1)
    _store["two"] = (0, 2)
    assert bust_cache("*") == 2
    _clear_store()
    assert bust_cache("nonexistent") == 0


# ---------------------------------------------------------------------------
# get_cache_stats
# ---------------------------------------------------------------------------

def test_get_cache_stats_empty():
    _clear_store()
    stats = get_cache_stats()
    assert stats["total_entries"] == 0
    assert stats["active_entries"] == 0
    assert stats["expired_entries"] == 0
    assert stats["max_entries"] == 2048


def test_get_cache_stats_counts_active_vs_expired():
    import time
    _clear_store()
    now = time.time()
    _store["active"] = (now + 60, "val1")  # expires in future
    _store["expired"] = (now - 60, "val2")  # already expired
    stats = get_cache_stats()
    assert stats["total_entries"] == 2
    assert stats["active_entries"] == 1
    assert stats["expired_entries"] == 1


# ---------------------------------------------------------------------------
# cache decorator
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_cache_decorator_caches_result():
    _clear_store()
    call_count = 0

    @cache(ttl=300, key="test_key")
    async def fetch_data():
        nonlocal call_count
        call_count += 1
        return {"data": 42}

    result1 = await fetch_data()
    result2 = await fetch_data()
    assert result1 == result2 == {"data": 42}
    assert call_count == 1  # Function called only once


@pytest.mark.asyncio
async def test_cache_bust_bypasses_cache():
    _clear_store()
    call_count = 0

    @cache(ttl=300, key="bust_key")
    async def fetch_data():
        nonlocal call_count
        call_count += 1
        return call_count

    r1 = await fetch_data()
    r2 = await fetch_data(bust=True)
    r3 = await fetch_data()
    assert r1 == 1
    assert r2 == 2  # bust=True bypassed cache
    assert r3 == 2  # from cache again


@pytest.mark.asyncio
async def test_cache_key_template_formats():
    _clear_store()

    @cache(ttl=300, key="item:{id}")
    async def get_item(id: int):
        return f"item-{id}"

    await get_item(id=1)
    await get_item(id=2)
    assert "item:1" in _store
    assert "item:2" in _store


@pytest.mark.asyncio
async def test_cache_prefix_prepends_to_key():
    _clear_store()

    @cache(ttl=300, key="detail", prefix="user")
    async def get_user_detail():
        return "detail"

    await get_user_detail()
    assert "user:detail" in _store


# ---------------------------------------------------------------------------
# _evict_expired
# ---------------------------------------------------------------------------

def test_evict_expired_removes_expired_entries():
    import time
    _clear_store()
    now = time.time()
    _store["live"] = (now + 300, "keep")
    _store["dead"] = (now - 300, "remove")
    _evict_expired()
    assert "live" in _store
    assert "dead" not in _store
