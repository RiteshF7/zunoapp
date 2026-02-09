"""AI service — categorize, summarize, tag, embed content via Gemini or OpenAI."""

from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from app.config import Settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are a content analysis AI. Analyze the given content and return a JSON object with:\n"
    '- "category": A single category (e.g., Cooking, Tech, Travel, Fitness, Finance, '
    "Design, Health, Education, Entertainment, Lifestyle, Business, Science, Sports, Music, Art)\n"
    '- "summary": A concise 1-2 sentence summary (max 150 chars)\n'
    '- "tags": An array of 3-5 relevant tags (lowercase, no #)\n'
    '- "title": A clean title if you can infer one (optional)\n'
    "Return ONLY valid JSON."
)

GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_EMBEDDING_MODEL = "text-embedding-004"


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
    prompt = f"{SYSTEM_PROMPT}\n\nContent:\n{text}\n\nReturn ONLY valid JSON."

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={api_key}",
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.3,
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

    return {
        "category": result.get("category", "Uncategorized"),
        "summary": result.get("summary", ""),
        "tags": result.get("tags", []),
        "title": result.get("title"),
        "embedding": embedding,
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
    async with httpx.AsyncClient(timeout=60) as client:
        completion_resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": text},
                ],
                "temperature": 0.3,
                "response_format": {"type": "json_object"},
            },
        )
        completion_resp.raise_for_status()
        completion = completion_resp.json()
        result = json.loads(completion["choices"][0]["message"]["content"])

        embedding = await _openai_embedding(text, api_key)

    return {
        "category": result.get("category", "Uncategorized"),
        "summary": result.get("summary", ""),
        "tags": result.get("tags", []),
        "title": result.get("title"),
        "embedding": embedding,
    }


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
