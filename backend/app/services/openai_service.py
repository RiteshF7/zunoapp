"""AI service — categorize, summarize, tag, embed content via Gemini or OpenAI."""

from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from app.config import Settings
from app.prompts import get_prompt

logger = logging.getLogger(__name__)

GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_EMBEDDING_MODEL = "text-embedding-004"


def _get_content_analysis_prompt() -> dict[str, Any]:
    """Load the content analysis prompt config from YAML."""
    return get_prompt("content_analysis")


def _get_feed_generation_prompt() -> dict[str, Any]:
    """Load the feed generation prompt config from YAML (used by feed_generator)."""
    return get_prompt("feed_generation")


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
async def process_with_ai(text: str, settings: Settings) -> dict[str, Any]:
    """Categorize, summarize, tag, and embed the given text."""
    if settings.ai_provider == "gemini" and settings.gemini_api_key:
        return await _process_with_gemini(text, settings)
    if settings.openai_api_key:
        return await _process_with_openai(text, settings)
    raise RuntimeError("No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY.")


async def generate_embedding(text: str, settings: Settings) -> list[float] | None:
    """Generate an embedding vector using the configured AI provider."""
    if settings.ai_provider == "gemini" and settings.gemini_api_key:
        return await _gemini_embedding(text, settings.gemini_api_key)
    if settings.openai_api_key:
        return await _openai_embedding(text, settings.openai_api_key)
    return None


# ---------------------------------------------------------------------------
# Gemini implementation
# ---------------------------------------------------------------------------
async def _process_with_gemini(text: str, settings: Settings) -> dict[str, Any]:
    api_key = settings.gemini_api_key
    prompt_config = _get_content_analysis_prompt()
    system_prompt = prompt_config["system"]

    prompt = f"{system_prompt}\n\nContent:\n{text}\n\nReturn ONLY valid JSON."

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={api_key}",
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": prompt_config.get("temperature", 0.3),
                    "responseMimeType": "application/json",
                },
            },
        )
        resp.raise_for_status()
        data = resp.json()
        result_text = data["candidates"][0]["content"]["parts"][0]["text"]
        result = json.loads(result_text)

    # Generate embedding via Gemini
    embedding = await _gemini_embedding(text, api_key)

    return _normalize_ai_result(result, embedding)


def _normalize_ai_result(
    result: dict[str, Any], embedding: list[float] | None
) -> dict[str, Any]:
    """Build a consistent return dict from raw AI JSON output."""
    # Use tldr if present, fall back to legacy "summary" field
    tldr = result.get("tldr") or result.get("summary", "")
    return {
        "category": result.get("category", "Uncategorized"),
        "summary": tldr,  # backward-compat: ai_summary column in DB
        "tags": result.get("tags", []),
        "title": result.get("title"),
        "embedding": embedding,
        # New structured fields
        "structured_content": {
            "tldr": tldr,
            "key_points": result.get("key_points", []),
            "action_items": result.get("action_items", []),
            "save_motive": result.get("save_motive", ""),
        },
    }


async def _gemini_embedding(text: str, api_key: str) -> list[float] | None:
    """Generate an embedding using Gemini's text-embedding-004 model."""
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_EMBEDDING_MODEL}:embedContent?key={api_key}",
                headers={"Content-Type": "application/json"},
                json={
                    "model": f"models/{GEMINI_EMBEDDING_MODEL}",
                    "content": {"parts": [{"text": text[:2048]}]},
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data["embedding"]["values"]
    except Exception as exc:
        logger.warning("Gemini embedding failed: %s", exc)
        return None


# ---------------------------------------------------------------------------
# OpenAI implementation (fallback)
# ---------------------------------------------------------------------------
async def _process_with_openai(text: str, settings: Settings) -> dict[str, Any]:
    api_key = settings.openai_api_key
    prompt_config = _get_content_analysis_prompt()
    system_prompt = prompt_config["system"]
    model = prompt_config.get("model", "gpt-4o-mini")
    temperature = prompt_config.get("temperature", 0.3)

    async with httpx.AsyncClient(timeout=60) as client:
        completion_resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text},
                ],
                "temperature": temperature,
                "response_format": {"type": "json_object"},
            },
        )
        completion_resp.raise_for_status()
        completion = completion_resp.json()
        result = json.loads(completion["choices"][0]["message"]["content"])

        embedding = await _openai_embedding(text, api_key)

    return _normalize_ai_result(result, embedding)


async def _openai_embedding(text: str, api_key: str) -> list[float] | None:
    """Generate an embedding using OpenAI text-embedding-3-small."""
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.openai.com/v1/embeddings",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={"model": "text-embedding-3-small", "input": text},
            )
            resp.raise_for_status()
            data = resp.json()
            return data["data"][0]["embedding"]
    except Exception as exc:
        logger.warning("OpenAI embedding failed: %s", exc)
        return None
