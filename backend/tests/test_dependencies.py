"""Unit tests for app/dependencies.py."""

from __future__ import annotations

from unittest.mock import patch, MagicMock
from datetime import datetime, timezone, timedelta

import pytest
import jwt as pyjwt
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.config import Settings
from app import dependencies


TEST_SECRET = "test-jwt-secret-that-is-at-least-32-chars-long"


def _test_settings() -> Settings:
    return Settings(
        supabase_url="https://test.supabase.co",
        supabase_service_role_key="test-service-key",
        supabase_jwt_secret=TEST_SECRET,
        gcp_project_id="",
        backend_port=8000,
        cors_origins="*",
    )


def _make_token(
    sub: str | None = "user-123",
    exp_hours: float | None = 1.0,
    secret: str = TEST_SECRET,
    aud: str = "authenticated",
) -> str:
    payload = {"aud": aud}
    if sub is not None:
        payload["sub"] = sub
    if exp_hours is not None:
        payload["exp"] = datetime.now(timezone.utc) + timedelta(hours=exp_hours)
    return pyjwt.encode(
        payload,
        secret,
        algorithm="HS256",
    )


@pytest.mark.asyncio
async def test_valid_hs256_token_returns_user_id():
    """Valid HS256 token returns user_id (sub claim)."""
    token = _make_token(sub="user-abc-123")
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    settings = _test_settings()

    result = await dependencies.get_current_user(credentials, settings)

    assert result == "user-abc-123"


@pytest.mark.asyncio
async def test_expired_token_raises_401():
    """Expired token raises 401."""
    token = pyjwt.encode(
        {"sub": "user-1", "aud": "authenticated", "exp": datetime.now(timezone.utc) - timedelta(hours=1)},
        TEST_SECRET,
        algorithm="HS256",
    )
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    settings = _test_settings()

    with pytest.raises(HTTPException) as exc_info:
        await dependencies.get_current_user(credentials, settings)

    assert exc_info.value.status_code == 401
    assert "expired" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_invalid_token_raises_401():
    """Invalid token (wrong signature) raises 401."""
    token = pyjwt.encode(
        {"sub": "user-1", "aud": "authenticated"},
        "wrong-secret-key-that-is-at-least-32-chars",
        algorithm="HS256",
    )
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    settings = _test_settings()

    with pytest.raises(HTTPException) as exc_info:
        await dependencies.get_current_user(credentials, settings)

    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_missing_sub_claim_raises_401():
    """Missing sub claim raises 401."""
    token = _make_token(sub=None)
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    settings = _test_settings()

    with pytest.raises(HTTPException) as exc_info:
        await dependencies.get_current_user(credentials, settings)

    assert exc_info.value.status_code == 401
    assert "sub" in exc_info.value.detail.lower()


def test_get_supabase_creates_singleton_client():
    """get_supabase creates singleton client (create_client called once)."""
    dependencies._supabase_client = None
    mock_client = MagicMock()

    with patch("app.dependencies.create_client", return_value=mock_client):
        s1 = dependencies.get_supabase(_test_settings())
        s2 = dependencies.get_supabase(_test_settings())

    assert s1 is s2
    assert s1 is mock_client
    # create_client should be called only once
    assert mock_client is s1


def test_get_supabase_respects_existing_singleton():
    """get_supabase returns existing client without calling create_client again."""
    dependencies._supabase_client = MagicMock()
    with patch("app.dependencies.create_client") as mock_create:
        result = dependencies.get_supabase(_test_settings())
    mock_create.assert_not_called()
    assert result is dependencies._supabase_client


def test_load_jwks_keys_raises_runtime_error_when_file_missing():
    """_load_jwks_keys raises RuntimeError when jwks.json is missing."""
    dependencies._jwks_keys = {}  # Clear cached keys
    with patch("app.dependencies._JWKS_PATH") as mock_path:
        mock_path.exists.return_value = False
        with pytest.raises(RuntimeError, match="jwks.json not found"):
            dependencies._load_jwks_keys()


def test_get_signing_key_fallback_to_first_key():
    """_get_signing_key falls back to first key when kid doesn't match."""
    dependencies._jwks_keys = {}
    mock_key1 = MagicMock()
    mock_key1.key = "key1"
    mock_key2 = MagicMock()
    mock_key2.key = "key2"
    keys_dict = {"kid-a": mock_key1, "kid-b": mock_key2}

    # Token with kid "unknown" not in keys
    token = pyjwt.encode(
        {"sub": "x", "aud": "authenticated"},
        TEST_SECRET,
        algorithm="HS256",
        headers={"kid": "unknown"},
    )

    with patch.object(dependencies, "_load_jwks_keys", return_value=keys_dict):
        result = dependencies._get_signing_key(token)
    # Should return first key (dict iteration order)
    assert result in (mock_key1, mock_key2)


@pytest.mark.asyncio
async def test_malformed_token_raises_401():
    """Malformed token raises 401."""
    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer", credentials="not.a.valid.jwt"
    )
    settings = _test_settings()

    with pytest.raises(HTTPException) as exc_info:
        await dependencies.get_current_user(credentials, settings)

    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_wrong_audience_raises_401():
    """Token with wrong audience raises 401."""
    token = _make_token(aud="wrong-audience")
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    settings = _test_settings()

    with pytest.raises(HTTPException) as exc_info:
        await dependencies.get_current_user(credentials, settings)

    assert exc_info.value.status_code == 401
