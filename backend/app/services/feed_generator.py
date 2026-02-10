"""AI-powered and rule-based feed generation."""

from __future__ import annotations

import json
import logging
import math
import random
from typing import Any
from urllib.parse import quote

import httpx

from app.config import Settings
from app.prompts import get_prompt

logger = logging.getLogger(__name__)


def get_top_n(obj: dict[str, int], n: int) -> list[tuple[str, int]]:
    """Return the top-N items from a {key: count} dict, sorted descending."""
    return sorted(obj.items(), key=lambda x: x[1], reverse=True)[:n]


# ---------------------------------------------------------------------------
# AI-powered feed generation
# ---------------------------------------------------------------------------
async def generate_ai_feed(
    settings: Settings,
    top_categories: list[tuple[str, int]],
    top_tags: list[tuple[str, int]],
    top_platforms: list[tuple[str, int]],
    interests: dict[str, Any],
) -> list[dict[str, Any]]:
    """Generate personalized feed recommendations using OpenAI."""
    prompt_config = get_prompt("feed_generation")
    system_prompt = prompt_config["system"]
    model = prompt_config.get("model", "gpt-4o-mini")
    temperature = prompt_config.get("temperature", 0.8)

    # Fill the user prompt template from the YAML file
    user_prompt = prompt_config["user_template"].format(
        top_categories=", ".join(f"{c} ({n} saved)" for c, n in top_categories),
        top_tags=", ".join(f"{t} ({n})" for t, n in top_tags),
        top_platforms=", ".join(p for p, _ in top_platforms),
        total_saved=interests.get("total_saved", 0),
    )

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": temperature,
                "response_format": {"type": "json_object"},
            },
        )
        resp.raise_for_status()
        data = resp.json()
        content = json.loads(data["choices"][0]["message"]["content"])
        items = content if isinstance(content, list) else content.get("items") or content.get("recommendations") or []

    return [
        {
            "title": item.get("title", ""),
            "description": item.get("description", ""),
            "image_url": f"https://picsum.photos/seed/{quote(str(item.get('title', ''))[:10])}/400/250",
            "source_url": item.get("source_url", ""),
            "category": item.get("category", ""),
            "content_type": item.get("content_type", "article"),
            "platform": item.get("platform", "other"),
            "likes": item.get("likes", random.randint(500, 10000)),
            "relevance_score": random.random() * 0.5 + 0.5,
            "reason": item.get("reason", ""),
        }
        for item in items
    ]


# ---------------------------------------------------------------------------
# Rule-based fallback feed generation
# ---------------------------------------------------------------------------
def generate_rule_feed(
    top_categories: list[tuple[str, int]],
    top_tags: list[tuple[str, int]],
    top_platforms: list[tuple[str, int]],
    interests: dict[str, Any],
) -> list[dict[str, Any]]:
    """Generate a simple rule-based feed when no AI key is available."""
    items: list[dict[str, Any]] = []

    for category, count in top_categories:
        items.append(
            {
                "title": f"Top {category} Content This Week",
                "description": f"Discover trending {category.lower()} content picked for you.",
                "image_url": f"https://picsum.photos/seed/{category}/400/250",
                "source_url": f"https://example.com/{category.lower()}",
                "category": category,
                "content_type": "article",
                "platform": top_platforms[0][0] if top_platforms else "other",
                "likes": random.randint(500, 5000),
                "relevance_score": 0.8,
                "reason": f"Because you saved {count} {category.lower()} items",
            }
        )

    return items
