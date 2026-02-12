"""Structured logging configuration for the Zuno API.

Supports two formats controlled by the ``LOG_FORMAT`` setting:
- ``"plain"``  — human-readable lines (default, good for development).
- ``"json"``   — machine-parseable JSON lines (good for production / log aggregation).

Both formats include ``request_id`` when available (set by the
``RequestIDMiddleware``).
"""

from __future__ import annotations

import logging
import sys

from pythonjsonlogger.json import JsonFormatter


def build_json_formatter() -> JsonFormatter:
    """Build a JSON log formatter with standard fields."""
    return JsonFormatter(
        fmt="%(asctime)s %(levelname)s %(name)s %(message)s",
        rename_fields={
            "levelname": "level",
            "name": "logger",
            "asctime": "timestamp",
        },
        datefmt="%Y-%m-%dT%H:%M:%S",
        defaults={"request_id": None},
    )


def configure_logging(log_level: str = "INFO", log_format: str = "plain") -> None:
    """Configure the root logger based on application settings.

    Parameters
    ----------
    log_level
        Python log level name (``"DEBUG"``, ``"INFO"``, ``"WARNING"``, etc.).
    log_format
        ``"plain"`` for human-readable or ``"json"`` for structured JSON.
    """
    root = logging.getLogger()
    root.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    # Remove existing handlers to avoid duplicates on reconfiguration
    root.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)

    if log_format == "json":
        handler.setFormatter(build_json_formatter())
    else:
        handler.setFormatter(
            logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s")
        )

    root.addHandler(handler)
