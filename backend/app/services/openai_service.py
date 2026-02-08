"""OpenAI / Gemini AI service — categorize, summarize, tag, embed content."""

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


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
async def process_with_ai(
    text: str, settings: Settings
) -> dict[str, Any]:
    """Categorize, summarize, tag, and embed the given text.

    Returns dict with keys: category, summary, tags, title, embedding.
    """
    if settings.ai_provider == "gemini":
        return await _process_with_gemini(text, settings)
    return await _process_with_openai(text, settings)


async def generate_embedding(
    text: str, settings: Settings
) -> list[float] | None:
    """Generate an embedding vector for the given text using OpenAI."""
    if not settings.openai_api_key:
        return None
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.openai.com/v1/embeddings",
                headers={
                    "Authorization": f"Bearer {settings.openai_api_key}",
                    "Content-Type": "application/json",
                },
                json={"model": "text-embedding-3-small", "input": text},
            )
            resp.raise_for_status()
            data = resp.json()
            return data["data"][0]["embedding"]
    except Exception as exc:
        logger.warning("Embedding generation failed: %s", exc)
        return None


# ---------------------------------------------------------------------------
# OpenAI implementation
# ---------------------------------------------------------------------------
async def _process_with_openai(text: str, settings: Settings) -> dict[str, Any]:
    api_key = settings.openai_api_key
    async with httpx.AsyncClient(timeout=60) as client:
        # Step 1: Categorize / summarize / tag
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

        # Step 2: Generate embedding
        embedding_resp = await client.post(
            "https://api.openai.com/v1/embeddings",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={"model": "text-embedding-3-small", "input": text},
        )
        embedding_resp.raise_for_status()
        embedding_data = embedding_resp.json()
        embedding = embedding_data["data"][0]["embedding"]

    return {
        "category": result.get("category", "Uncategorized"),
        "summary": result.get("summary", ""),
        "tags": result.get("tags", []),
        "title": result.get("title"),
        "embedding": embedding,
    }


# ---------------------------------------------------------------------------
# Gemini implementation
# ---------------------------------------------------------------------------
async def _process_with_gemini(text: str, settings: Settings) -> dict[str, Any]:
    api_key = settings.gemini_api_key
    prompt = (
        "Analyze this content and return a JSON object with:\n"
        '- "category": A single category (Cooking, Tech, Travel, Fitness, Finance, '
        "Design, Health, Education, Entertainment, Lifestyle, Business, Science, Sports, Music, Art)\n"
        '- "summary": A concise 1-2 sentence summary (max 150 chars)\n'
        '- "tags": An array of 3-5 relevant tags (lowercase, no #)\n'
        '- "title": A clean title if you can infer one\n\n'
        f"Content:\n{text}\n\nReturn ONLY valid JSON."
    )

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}",
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

    # Gemini doesn't have a native embedding API — use OpenAI if available, else placeholder
    embedding: list[float] | None = None
    if settings.openai_api_key:
        embedding = await generate_embedding(text, settings)
    if embedding is None:
        embedding = [0.0] * 1536  # placeholder

    return {
        "category": result.get("category", "Uncategorized"),
        "summary": result.get("summary", ""),
        "tags": result.get("tags", []),
        "title": result.get("title"),
        "embedding": embedding,
    }
