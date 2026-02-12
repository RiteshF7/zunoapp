"""In-memory TTL cache with burst (invalidation) support.

Usage
-----
    from app.utils.cache import cache, bust_cache

    @cache(ttl=600, key="popular_tags:{limit}")
    async def get_popular_tags(limit: int = 20):
        ...

    # Bust a single key
    bust_cache("popular_tags:20")

    # Bust all keys matching a prefix
    bust_cache("popular_tags:*")

    # Bust everything
    bust_cache("*")

The cache is process-local (dict-based).  This is intentional — for a
single-server FastAPI/Uvicorn deployment it avoids the operational
overhead of Redis while still eliminating redundant DB queries.
"""

from __future__ import annotations

import logging
import time
from functools import wraps
from typing import Any, Callable

logger = logging.getLogger(__name__)

# ── Internal store ────────────────────────────────────────────────────────
# {key: (expires_at_epoch, value)}
_store: dict[str, tuple[float, Any]] = {}

# Maximum entries to prevent unbounded memory growth
_MAX_ENTRIES = 2048


# ── Public helpers ────────────────────────────────────────────────────────

def bust_cache(pattern: str = "*") -> int:
    """Invalidate cache entries.

    Parameters
    ----------
    pattern
        - ``"*"`` — flush the entire cache.
        - ``"prefix:*"`` — remove all keys starting with ``prefix:``.
        - ``"exact_key"`` — remove a single exact key.

    Returns
    -------
    int
        Number of entries removed.
    """
    if pattern == "*":
        count = len(_store)
        _store.clear()
        logger.info("Cache busted: all %d entries cleared", count)
        return count

    if pattern.endswith("*"):
        prefix = pattern[:-1]
        keys = [k for k in _store if k.startswith(prefix)]
        for k in keys:
            del _store[k]
        logger.info("Cache busted: %d entries matching '%s'", len(keys), pattern)
        return len(keys)

    # Exact key
    if pattern in _store:
        del _store[pattern]
        logger.info("Cache busted: key '%s'", pattern)
        return 1
    return 0


def get_cache_stats() -> dict[str, Any]:
    """Return basic cache statistics (useful for admin/debug endpoints)."""
    now = time.time()
    total = len(_store)
    expired = sum(1 for exp, _ in _store.values() if exp <= now)
    return {
        "total_entries": total,
        "active_entries": total - expired,
        "expired_entries": expired,
        "max_entries": _MAX_ENTRIES,
    }


def _evict_expired() -> None:
    """Remove expired entries (lazy garbage collection)."""
    now = time.time()
    expired_keys = [k for k, (exp, _) in _store.items() if exp <= now]
    for k in expired_keys:
        del _store[k]


# ── Decorator ─────────────────────────────────────────────────────────────

def cache(
    ttl: int = 300,
    key: str | None = None,
    prefix: str | None = None,
) -> Callable:
    """Decorator that caches the return value of an ``async`` function.

    Parameters
    ----------
    ttl
        Time-to-live in **seconds** (default 300 = 5 min).
    key
        A format-string for the cache key.  Placeholders are filled from
        the function's **keyword** arguments.  Example::

            @cache(ttl=600, key="popular_tags:{limit}")
            async def get_popular_tags(limit: int = 20): ...

        If omitted, a key is auto-generated from function name + all args.
    prefix
        Optional prefix prepended to the cache key.  Useful when you want
        to bust a whole group later with ``bust_cache("prefix:*")``.

    Notes
    -----
    - Only works on **async** functions.
    - Skips caching if ``bust=True`` is passed as a kwarg (the kwarg is
      consumed and not forwarded to the wrapped function).
    """

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            # Allow callers to bypass cache for a single call
            skip_cache = kwargs.pop("bust", False)

            # Build cache key
            if key is not None:
                cache_key = key.format(**kwargs)
            else:
                # Auto-key from function name + sorted kwargs
                parts = [func.__name__]
                parts.extend(str(a) for a in args)
                parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
                cache_key = ":".join(parts)

            if prefix:
                cache_key = f"{prefix}:{cache_key}"

            # Check the store (unless caller asked to bust)
            if not skip_cache and cache_key in _store:
                expires_at, cached_value = _store[cache_key]
                if time.time() < expires_at:
                    logger.debug("Cache HIT: %s", cache_key)
                    return cached_value
                # Expired — remove stale entry
                del _store[cache_key]

            # Miss — call the real function
            logger.debug("Cache MISS: %s", cache_key)
            result = await func(*args, **kwargs)

            # Periodic lazy eviction so the dict doesn't grow without bound
            if len(_store) >= _MAX_ENTRIES:
                _evict_expired()
            # Still too many? Drop oldest entries
            if len(_store) >= _MAX_ENTRIES:
                oldest_keys = sorted(_store, key=lambda k: _store[k][0])[
                    : _MAX_ENTRIES // 4
                ]
                for k in oldest_keys:
                    del _store[k]

            _store[cache_key] = (time.time() + ttl, result)
            return result

        # Expose the cache key prefix so callers can bust it
        wrapper.cache_prefix = prefix or func.__name__  # type: ignore[attr-defined]
        return wrapper

    return decorator
