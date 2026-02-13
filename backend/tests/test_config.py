"""Unit tests for app.config module."""

from __future__ import annotations

import pytest


# ---------------------------------------------------------------------------
# _read_dotenv
# ---------------------------------------------------------------------------

def _patch_backend_dir_and_mode(monkeypatch, tmp_path, mode="development"):
    import app.config
    monkeypatch.setattr(app.config, "_BACKEND_DIR", tmp_path)
    monkeypatch.setattr(app.config, "_get_mode", lambda: mode)


def test_read_dotenv_reads_key_value_pairs(tmp_path, monkeypatch):
    (tmp_path / ".env").write_text("FOO=bar\nBAZ=qux\n")
    _patch_backend_dir_and_mode(monkeypatch, tmp_path)
    import app.config
    values = app.config._read_dotenv()
    assert values["FOO"] == "bar"
    assert values["BAZ"] == "qux"


def test_read_dotenv_skips_comments(tmp_path, monkeypatch):
    (tmp_path / ".env").write_text("# comment\nFOO=bar\n# another\n")
    _patch_backend_dir_and_mode(monkeypatch, tmp_path)
    import app.config
    values = app.config._read_dotenv()
    assert "FOO" in values
    assert values["FOO"] == "bar"


def test_read_dotenv_strips_inline_comments(tmp_path, monkeypatch):
    (tmp_path / ".env").write_text("FOO=bar  # inline comment\n")
    _patch_backend_dir_and_mode(monkeypatch, tmp_path)
    import app.config
    values = app.config._read_dotenv()
    assert values["FOO"] == "bar"


def test_read_dotenv_returns_empty_when_file_missing(tmp_path, monkeypatch):
    _patch_backend_dir_and_mode(monkeypatch, tmp_path)
    import app.config
    values = app.config._read_dotenv()
    assert values == {}


def test_read_dotenv_skips_lines_without_equals(tmp_path, monkeypatch):
    (tmp_path / ".env").write_text("VALID=yes\ninvalid-line\nANOTHER=ok\n")
    _patch_backend_dir_and_mode(monkeypatch, tmp_path)
    import app.config
    values = app.config._read_dotenv()
    assert values["VALID"] == "yes"
    assert values["ANOTHER"] == "ok"
    assert len(values) == 2


def test_read_dotenv_mode_file_overrides(tmp_path, monkeypatch):
    (tmp_path / ".env").write_text("FOO=first\nBAR=only-in-env\n")
    (tmp_path / ".env.development").write_text("FOO=second\n")
    _patch_backend_dir_and_mode(monkeypatch, tmp_path)
    import app.config
    values = app.config._read_dotenv()
    assert values["FOO"] == "second"
    assert values["BAR"] == "only-in-env"


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------

def test_settings_validation_with_required_fields(monkeypatch):
    """Settings accepts required supabase fields; without them may fail if no .env."""
    from app.config import Settings
    # Clear env vars that might provide values (makes test deterministic)
    for k in ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_JWT_SECRET"):
        monkeypatch.delenv(k, raising=False)
    # Construction with required args succeeds
    s = Settings(
        supabase_url="https://test.supabase.co",
        supabase_service_role_key="test-key",
        supabase_jwt_secret="test-secret-at-least-32-chars-long",
    )
    assert s.supabase_url == "https://test.supabase.co"


def test_settings_has_defaults():
    from app.config import Settings
    s = Settings(
        supabase_url="https://test.supabase.co",
        supabase_service_role_key="test-key",
        supabase_jwt_secret="test-secret-at-least-32-chars-long",
    )
    assert s.gcp_location == "us-central1"
    assert s.rag_chunk_size == 500
    assert s.backend_port == 8000


# ---------------------------------------------------------------------------
# cors_origin_list
# ---------------------------------------------------------------------------

def test_cors_origin_list_splits_and_strips():
    from app.config import Settings
    s = Settings(
        supabase_url="https://test.supabase.co",
        supabase_service_role_key="test-key",
        supabase_jwt_secret="test-secret-at-least-32-chars-long",
        cors_origins="http://localhost:8081 , http://localhost:19006 ",
    )
    origins = s.cors_origin_list
    assert origins == ["http://localhost:8081", "http://localhost:19006"]


def test_cors_origin_list_filters_empty():
    from app.config import Settings
    s = Settings(
        supabase_url="https://test.supabase.co",
        supabase_service_role_key="test-key",
        supabase_jwt_secret="test-secret-at-least-32-chars-long",
        cors_origins="http://a.com,,http://b.com,",
    )
    origins = s.cors_origin_list
    assert "http://a.com" in origins
    assert "http://b.com" in origins
    assert "" not in origins
