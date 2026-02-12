"""Tests for structured logging configuration."""

from __future__ import annotations

import json
import logging

import pytest


# ---------------------------------------------------------------------------
# Config defaults
# ---------------------------------------------------------------------------

def test_log_level_defaults_to_info(test_settings):
    """LOG_LEVEL setting defaults to 'INFO'."""
    assert test_settings.log_level == "INFO"


def test_log_format_defaults_to_plain(test_settings):
    """LOG_FORMAT setting defaults to 'plain'."""
    assert test_settings.log_format == "plain"


# ---------------------------------------------------------------------------
# JSON formatter
# ---------------------------------------------------------------------------

def test_json_formatter_produces_parseable_json():
    """The JSON formatter outputs valid JSON with required keys."""
    from app.logging_config import build_json_formatter

    formatter = build_json_formatter()
    record = logging.LogRecord(
        name="test.logger",
        level=logging.INFO,
        pathname="test.py",
        lineno=1,
        msg="Hello structured world",
        args=(),
        exc_info=None,
    )
    output = formatter.format(record)
    data = json.loads(output)
    assert "timestamp" in data
    assert data["level"] == "INFO"
    assert data["message"] == "Hello structured world"
    assert data["logger"] == "test.logger"


def test_json_formatter_includes_request_id_when_set():
    """When request_id is set on the record, it appears in JSON output."""
    from app.logging_config import build_json_formatter

    formatter = build_json_formatter()
    record = logging.LogRecord(
        name="test", level=logging.INFO, pathname="", lineno=0,
        msg="with context", args=(), exc_info=None,
    )
    record.request_id = "abc-123"  # type: ignore[attr-defined]
    output = formatter.format(record)
    data = json.loads(output)
    assert data.get("request_id") == "abc-123"


# ---------------------------------------------------------------------------
# configure_logging helper
# ---------------------------------------------------------------------------

def test_configure_logging_plain_does_not_raise():
    from app.logging_config import configure_logging
    configure_logging(log_level="DEBUG", log_format="plain")


def test_configure_logging_json_does_not_raise():
    from app.logging_config import configure_logging
    configure_logging(log_level="INFO", log_format="json")
