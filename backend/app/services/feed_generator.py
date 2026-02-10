"""Rule-based feed generation helpers.

AI-powered feed generation has moved to ai_service.generate_ai_feed().
This module keeps only the rule-based fallback and utilities.
"""

from __future__ import annotations

import random
from typing import Any


def get_top_n(obj: dict[str, int], n: int) -> list[tuple[str, int]]:
    """Return the top-N items from a {key: count} dict, sorted descending."""
    return sorted(obj.items(), key=lambda x: x[1], reverse=True)[:n]


# ---------------------------------------------------------------------------
# Rule-based fallback feed generation
# ---------------------------------------------------------------------------
def generate_rule_feed(
    top_categories: list[tuple[str, int]],
    top_tags: list[tuple[str, int]],
    top_platforms: list[tuple[str, int]],
    interests: dict[str, Any],
) -> list[dict[str, Any]]:
    """Generate a simple rule-based feed when no AI provider is available."""
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
