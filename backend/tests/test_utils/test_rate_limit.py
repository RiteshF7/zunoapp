"""Unit tests for app.utils.rate_limit module."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from app.utils.rate_limit import (
    _get_rate_limit_key,
    RATE_AI_PROCESS,
    RATE_AI_EMBEDDING,
    RATE_AI_FEED,
    RATE_SEARCH,
    RATE_WRITE,
    RATE_READ,
    RATE_PUBLIC,
)


# ---------------------------------------------------------------------------
# _get_rate_limit_key
# ---------------------------------------------------------------------------

def test_get_rate_limit_key_returns_user_id_when_set():
    request = MagicMock()
    request.state.rate_limit_user_id = "user-123"
    key = _get_rate_limit_key(request)
    assert key == "user:user-123"


def test_get_rate_limit_key_returns_ip_when_no_user_id():
    request = MagicMock()
    request.state = type("State", (), {})()  # Object with no rate_limit_user_id
    with patch("app.utils.rate_limit.get_remote_address", return_value="192.168.1.1"):
        key = _get_rate_limit_key(request)
    assert key == "192.168.1.1"


def test_get_rate_limit_key_user_id_takes_priority():
    """When both could exist, user_id takes priority (set by auth)."""
    request = MagicMock()
    request.state.rate_limit_user_id = "auth-user-456"
    key = _get_rate_limit_key(request)
    assert key == "user:auth-user-456"


def test_get_rate_limit_key_state_without_user_id_returns_ip():
    """Request.state without rate_limit_user_id yields IP from get_remote_address."""
    request = MagicMock()
    state = type("State", (), {})()  # Object with no rate_limit_user_id
    request.state = state
    with patch("app.utils.rate_limit.get_remote_address", return_value="10.0.0.1"):
        key = _get_rate_limit_key(request)
    assert key == "10.0.0.1"


# ---------------------------------------------------------------------------
# Rate limit constants
# ---------------------------------------------------------------------------

def test_rate_limit_constants_defined():
    """All expected rate limit constants exist and have valid format."""
    assert RATE_AI_PROCESS == "30/hour"
    assert RATE_AI_EMBEDDING == "60/hour"
    assert RATE_AI_FEED == "10/hour"
    assert RATE_SEARCH == "60/minute"
    assert RATE_WRITE == "60/minute"
    assert RATE_READ == "120/minute"
    assert RATE_PUBLIC == "60/minute"
    assert "/" in RATE_AI_PROCESS  # format is "limit/period"
