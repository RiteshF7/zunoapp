"""Tests for environment-based config and CORS."""

import pytest


def test_environment_defaults_to_development(test_settings):
    assert test_settings.environment == "development"


def test_debug_true_in_development(test_settings):
    assert test_settings.debug is True
    test_settings.environment = "development"
    assert test_settings.debug is True


def test_debug_false_in_production():
    from app.config import Settings
    s = Settings(
        supabase_url="https://x.co",
        supabase_service_role_key="k",
        supabase_jwt_secret="secret" * 8,
        environment="production",
    )
    assert s.debug is False


def test_cors_allow_methods_restricted_in_production():
    from app.config import Settings
    s = Settings(
        supabase_url="https://x.co",
        supabase_service_role_key="k",
        supabase_jwt_secret="secret" * 8,
        environment="production",
    )
    assert s.cors_allow_methods == ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]


def test_cors_allow_headers_restricted_in_production():
    from app.config import Settings
    s = Settings(
        supabase_url="https://x.co",
        supabase_service_role_key="k",
        supabase_jwt_secret="secret" * 8,
        environment="production",
    )
    assert "*" not in s.cors_allow_headers
    assert "Authorization" in s.cors_allow_headers
