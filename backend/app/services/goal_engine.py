"""Goal Intelligence Engine — detects user intent and manages goals.

Called after every content save to:
1. Fetch the user's personality profile and existing goals.
2. Use RAG vector search to find semantically similar past content.
3. Fetch a few recent items for broader personality context.
4. Send everything to Vertex AI for goal analysis.
5. Apply changes: update personality, create/update goals and steps.

Optimizations applied:
- N+1 fix: batch-fetches all goal steps in one query.
- Parallel context fetching via asyncio.gather / to_thread.
- Token budget management to cap prompt size.
- Goal deduplication guard (title similarity check).
- Debounce: skips analysis if last run was < 30 s ago.
- Personality caching via in-memory TTL cache.
"""

from __future__ import annotations

import asyncio
import json
import logging
import math
from datetime import datetime, timezone
from typing import Any

from supabase import Client

from app.config import Settings
from app.prompts import get_prompt
from app.services.ai_service import _get_provider
from app.utils.cache import bust_cache

logger = logging.getLogger(__name__)

# How many semantically similar content items to retrieve via RAG
_MAX_SIMILAR_CONTENT = 15
# Minimum cosine similarity threshold for related content
_SIMILARITY_THRESHOLD = 0.3
# A few recent items for broader personality context (emerging interests)
_MAX_RECENT_CONTEXT = 5
# Debounce window: skip analysis if last run was less than this many seconds ago
_DEBOUNCE_SECONDS = 30
# Approximate token budget for the user portion of the prompt
_MAX_USER_PROMPT_TOKENS = 6000
# Characters per token estimate (conservative for English text)
_CHARS_PER_TOKEN = 4
# Similarity threshold for considering two goal titles as duplicates
_GOAL_DUPLICATE_THRESHOLD = 0.80

# ── Personality cache (in-memory, process-local) ─────────────────────────
_personality_cache: dict[str, tuple[float, dict[str, Any]]] = {}
_PERSONALITY_CACHE_TTL = 300  # 5 minutes


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
async def analyze_and_update_goals(
    db: Client,
    user_id: str,
    new_content: dict[str, Any],
    ai_result: dict[str, Any],
    settings: Settings,
) -> None:
    """Analyze saved content patterns and update user goals.

    Uses the new content's embedding to find semantically similar past
    content via pgvector (RAG search), giving the AI a precise view of
    related content rather than a blind chronological window.
    """
    if not settings.gcp_project_id:
        logger.debug("Goal analysis skipped — no AI provider configured.")
        return

    embedding = ai_result.get("embedding")

    # ── Debounce: skip if analysis ran very recently ──────────────────────
    personality = _fetch_personality_cached(db, user_id)
    if personality and personality.get("updated_at"):
        try:
            last_run = datetime.fromisoformat(
                personality["updated_at"].replace("Z", "+00:00"),
            )
            elapsed = (datetime.now(timezone.utc) - last_run).total_seconds()
            if elapsed < _DEBOUNCE_SECONDS:
                logger.info(
                    "Goal analysis debounced for user %s (last run %ds ago)",
                    user_id,
                    int(elapsed),
                )
                return
        except (ValueError, TypeError):
            pass  # Malformed timestamp — proceed with analysis

    # ── Parallel context fetching ─────────────────────────────────────────
    # Run independent DB fetches concurrently via asyncio.to_thread
    # (Supabase Python client is synchronous).
    active_goals_future = asyncio.to_thread(_fetch_active_goals, db, user_id)
    recent_future = asyncio.to_thread(
        _fetch_recent_content, db, user_id, _MAX_RECENT_CONTEXT,
        new_content.get("id"),
    )

    # RAG search needs the embedding — only run if available
    if embedding:
        similar_future = asyncio.to_thread(
            _fetch_similar_content, db, user_id, embedding,
            _MAX_SIMILAR_CONTENT, _SIMILARITY_THRESHOLD,
            new_content.get("id"),
        )
        active_goals, similar_content, recent_content = await asyncio.gather(
            active_goals_future, similar_future, recent_future,
        )
    else:
        active_goals, recent_content = await asyncio.gather(
            active_goals_future, recent_future,
        )
        similar_content = []

    # Merge similar + recent into a single deduplicated list
    related_content = _merge_content_lists(similar_content, recent_content)

    # ── Build the prompt with token budget ────────────────────────────────
    prompt_config = get_prompt("goal_analysis")
    system_prompt = prompt_config["system"]
    temperature = prompt_config.get("temperature", 0.4)
    max_tokens = prompt_config.get("max_output_tokens", 4096)

    user_prompt = _build_prompt_with_budget(
        prompt_config["user_template"],
        personality,
        active_goals,
        new_content,
        ai_result,
        related_content,
        max_tokens=_MAX_USER_PROMPT_TOKENS,
    )

    # ── Call Vertex AI ────────────────────────────────────────────────────
    provider = _get_provider(settings)
    try:
        raw_json = await provider.generate_text(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            json_mode=True,
        )
        ai_response = json.loads(raw_json)
    except Exception as exc:
        logger.error("Goal analysis AI call failed: %s", exc)
        raise

    # ── Apply personality updates ─────────────────────────────────────────
    personality_update = ai_response.get("personality_update")
    if personality_update:
        _apply_personality_update(
            db, user_id, personality_update, new_content.get("id"),
        )
        # Bust personality cache so next call sees fresh data
        _bust_personality_cache(user_id)

    # ── Apply goal changes with deduplication guard ───────────────────────
    goal_changes = ai_response.get("goal_changes", [])
    existing_titles = [g["title"].lower().strip() for g in active_goals]

    for change in goal_changes:
        try:
            action = change.get("action")
            if action == "create":
                # Deduplication guard: skip if a similar goal already exists
                new_title = (change.get("title") or "").lower().strip()
                if _is_duplicate_goal(new_title, existing_titles):
                    logger.info(
                        "Skipped duplicate goal '%s' for user %s",
                        change.get("title"),
                        user_id,
                    )
                    continue
                _create_goal(db, user_id, change, related_content)
                # Track the new title to prevent duplicates within same batch
                existing_titles.append(new_title)
            elif action == "update":
                _update_goal(db, user_id, change, related_content)
            else:
                logger.warning("Unknown goal action: %s", action)
        except Exception as exc:
            logger.error("Failed to apply goal change %s: %s", change, exc)

    logger.info(
        "Goal analysis complete for user %s: %d similar items found, "
        "%d goal changes applied",
        user_id,
        len(similar_content),
        len(goal_changes),
    )


# ---------------------------------------------------------------------------
# Token budget helper
# ---------------------------------------------------------------------------
def _estimate_tokens(text: str) -> int:
    """Rough token estimate from character count."""
    return max(1, len(text) // _CHARS_PER_TOKEN)


def _build_prompt_with_budget(
    template: str,
    personality: dict[str, Any] | None,
    goals: list[dict[str, Any]],
    new_content: dict[str, Any],
    ai_result: dict[str, Any],
    related_content: list[dict[str, Any]],
    max_tokens: int = 6000,
) -> str:
    """Build the user prompt while respecting a token budget.

    Priority allocation (highest → lowest):
    1. New content context  (~20% budget)
    2. Active goals context (~30% budget)
    3. Related content       (~35% budget)
    4. Personality context   (~15% budget)
    """
    # 1. New content — always included in full (highest priority)
    new_ctx = _format_new_content_context(new_content, ai_result)
    budget_remaining = max_tokens - _estimate_tokens(new_ctx)

    # 2. Goals context — cap to ~30% of total budget
    goals_budget = int(max_tokens * 0.30)
    goals_ctx = _format_goals_context(goals)
    if _estimate_tokens(goals_ctx) > goals_budget:
        # Truncate: show fewer step details
        goals_ctx = _format_goals_context_compact(goals, goals_budget)
    budget_remaining -= _estimate_tokens(goals_ctx)

    # 3. Related content — cap to remaining minus personality reserve
    personality_reserve = int(max_tokens * 0.15)
    related_budget = max(200, budget_remaining - personality_reserve)
    related_ctx = _format_related_content_context(related_content)
    if _estimate_tokens(related_ctx) > related_budget:
        # Reduce number of items until within budget
        trimmed = related_content
        while len(trimmed) > 2 and _estimate_tokens(
            _format_related_content_context(trimmed)
        ) > related_budget:
            trimmed = trimmed[:-1]
        related_ctx = _format_related_content_context(trimmed)
    budget_remaining -= _estimate_tokens(related_ctx)

    # 4. Personality context — gets whatever is left
    personality_ctx = _format_personality_context(personality)
    if _estimate_tokens(personality_ctx) > max(100, budget_remaining):
        # Truncate summary
        personality_ctx = _truncate_text(
            personality_ctx, max(100, budget_remaining),
        )

    return template.format(
        personality_context=personality_ctx,
        goals_context=goals_ctx,
        new_content_context=new_ctx,
        recent_content_context=related_ctx,
    )


def _truncate_text(text: str, max_tokens: int) -> str:
    """Hard-truncate text to approximately max_tokens."""
    max_chars = max_tokens * _CHARS_PER_TOKEN
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "... (truncated)"


# ---------------------------------------------------------------------------
# Goal deduplication
# ---------------------------------------------------------------------------
def _is_duplicate_goal(new_title: str, existing_titles: list[str]) -> bool:
    """Check if a new goal title is too similar to any existing goal.

    Uses a simple word-overlap Jaccard similarity — fast, no AI call needed.
    """
    if not new_title or not existing_titles:
        return False

    new_words = set(new_title.split())
    if not new_words:
        return False

    for existing in existing_titles:
        existing_words = set(existing.split())
        if not existing_words:
            continue
        intersection = new_words & existing_words
        union = new_words | existing_words
        similarity = len(intersection) / len(union) if union else 0
        if similarity >= _GOAL_DUPLICATE_THRESHOLD:
            return True

    return False


# ---------------------------------------------------------------------------
# Personality cache helpers
# ---------------------------------------------------------------------------
def _fetch_personality_cached(
    db: Client, user_id: str,
) -> dict[str, Any] | None:
    """Fetch personality with in-memory cache (5 min TTL)."""
    import time

    cache_key = user_id
    if cache_key in _personality_cache:
        expires_at, cached = _personality_cache[cache_key]
        if time.time() < expires_at:
            logger.debug("Personality cache HIT for user %s", user_id)
            return cached
        del _personality_cache[cache_key]

    result = _fetch_personality(db, user_id)
    if result is not None:
        import time as _t
        _personality_cache[cache_key] = (
            _t.time() + _PERSONALITY_CACHE_TTL,
            result,
        )
    return result


def _bust_personality_cache(user_id: str) -> None:
    """Remove a user's personality from the in-memory cache."""
    _personality_cache.pop(user_id, None)


# ---------------------------------------------------------------------------
# Data fetchers
# ---------------------------------------------------------------------------
def _fetch_personality(db: Client, user_id: str) -> dict[str, Any] | None:
    """Fetch the user's personality profile, or None if not yet created."""
    result = (
        db.table("user_personality")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )
    return result.data[0] if result.data else None


def _fetch_active_goals(db: Client, user_id: str) -> list[dict[str, Any]]:
    """Fetch all active goals with their steps for the user.

    Uses a single batch query for all steps (avoids N+1 problem).
    """
    goals_result = (
        db.table("user_goals")
        .select("*")
        .eq("user_id", user_id)
        .eq("status", "active")
        .order("created_at", desc=False)
        .execute()
    )
    goals = goals_result.data or []

    if not goals:
        return goals

    # Batch-fetch all steps for all goals in a single query
    goal_ids = [g["id"] for g in goals]
    all_steps_result = (
        db.table("goal_steps")
        .select("*")
        .in_("goal_id", goal_ids)
        .order("step_index")
        .execute()
    )

    # Group steps by goal_id
    steps_by_goal: dict[str, list[dict[str, Any]]] = {}
    for step in (all_steps_result.data or []):
        steps_by_goal.setdefault(step["goal_id"], []).append(step)

    for goal in goals:
        goal["steps"] = steps_by_goal.get(goal["id"], [])

    return goals


def _fetch_similar_content(
    db: Client,
    user_id: str,
    embedding: list[float],
    limit: int = 15,
    threshold: float = 0.3,
    exclude_content_id: str | None = None,
) -> list[dict[str, Any]]:
    """Use pgvector to find semantically similar content the user has saved.

    Leverages the existing ``match_chunks`` RPC to search content_chunks,
    then fetches the parent content records (deduplicated).
    """
    try:
        chunks_result = db.rpc(
            "match_chunks",
            {
                "query_embedding": embedding,
                "match_user_id": user_id,
                "match_count": limit * 2,  # fetch extra to account for dedup
                "similarity_threshold": threshold,
            },
        ).execute()
    except Exception as exc:
        logger.warning("RAG similarity search failed for goals: %s", exc)
        return []

    chunks = chunks_result.data or []
    if not chunks:
        return []

    # Deduplicate by content_id, keeping the highest similarity per content
    best_by_content: dict[str, float] = {}
    for chunk in chunks:
        cid = chunk.get("content_id")
        sim = chunk.get("similarity", 0)
        if cid and (cid not in best_by_content or sim > best_by_content[cid]):
            best_by_content[cid] = sim

    # Exclude the content we just saved (it's the new content, not a match)
    if exclude_content_id and exclude_content_id in best_by_content:
        del best_by_content[exclude_content_id]

    # Sort by similarity descending and take top N
    sorted_ids = sorted(best_by_content, key=best_by_content.get, reverse=True)[:limit]

    if not sorted_ids:
        return []

    # Fetch full content records
    content_result = (
        db.table("content")
        .select(
            "id, title, url, platform, content_type, ai_category, "
            "ai_summary, ai_structured_content, created_at"
        )
        .in_("id", sorted_ids)
        .execute()
    )
    content_map = {c["id"]: c for c in (content_result.data or [])}

    # Return in similarity order with scores attached
    results = []
    for cid in sorted_ids:
        if cid in content_map:
            item = content_map[cid]
            item["_similarity"] = best_by_content[cid]
            results.append(item)

    return results


def _fetch_recent_content(
    db: Client,
    user_id: str,
    limit: int = 5,
    exclude_content_id: str | None = None,
) -> list[dict[str, Any]]:
    """Fetch the most recently saved content for broader context."""
    query = (
        db.table("content")
        .select(
            "id, title, url, platform, content_type, ai_category, "
            "ai_summary, ai_structured_content, created_at"
        )
        .eq("user_id", user_id)
        .eq("ai_processed", True)
        .order("created_at", desc=True)
        .limit(limit + 1)  # +1 to account for excluding current
    )
    result = query.execute()
    items = result.data or []

    # Exclude the current content if present
    if exclude_content_id:
        items = [i for i in items if i.get("id") != exclude_content_id]

    return items[:limit]


def _merge_content_lists(
    similar: list[dict[str, Any]],
    recent: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Merge similar and recent content lists, deduplicating by ID.

    Similar content comes first (higher relevance), followed by recent
    items that weren't already found via similarity search.
    """
    seen_ids = {item["id"] for item in similar}
    merged = list(similar)

    for item in recent:
        if item["id"] not in seen_ids:
            item["_similarity"] = 0.0  # no similarity score for recent-only items
            merged.append(item)
            seen_ids.add(item["id"])

    return merged


# ---------------------------------------------------------------------------
# Prompt context formatters
# ---------------------------------------------------------------------------
def _format_personality_context(personality: dict[str, Any] | None) -> str:
    """Format the personality profile for the prompt."""
    if not personality or not personality.get("summary"):
        return "(No personality profile yet — this is a new user or first analysis.)"

    parts = [f"Summary: {personality['summary']}"]

    interests = personality.get("primary_interests", [])
    if interests:
        items = ", ".join(
            f"{i.get('name', '?')} ({i.get('confidence', 0):.0%})"
            for i in interests
        )
        parts.append(f"Primary Interests: {items}")

    patterns = personality.get("behavior_patterns", [])
    if patterns:
        parts.append(f"Behavior Patterns: {', '.join(patterns)}")

    themes = personality.get("content_themes", [])
    if themes:
        parts.append(f"Content Themes: {', '.join(themes)}")

    return "\n".join(parts)


def _format_goals_context(goals: list[dict[str, Any]]) -> str:
    """Format active goals for the prompt."""
    if not goals:
        return "(No active goals yet.)"

    parts = []
    for i, goal in enumerate(goals):
        steps = goal.get("steps", [])
        completed = sum(1 for s in steps if s.get("is_completed"))
        total = len(steps)

        goal_text = (
            f"Goal {i + 1} [id={goal['id']}]: {goal['title']}\n"
            f"  Category: {goal.get('category', '?')}\n"
            f"  Confidence: {goal.get('confidence', 0):.0%}\n"
            f"  Progress: {completed}/{total} steps completed\n"
            f"  Description: {goal.get('description', '')}"
        )

        # List steps with completion status
        for s in steps:
            status = "[DONE]" if s.get("is_completed") else "[ ]"
            goal_text += f"\n    {status} Step {s.get('step_index', 0)}: {s.get('title', '')}"

        parts.append(goal_text)

    return "\n\n".join(parts)


def _format_goals_context_compact(
    goals: list[dict[str, Any]], max_tokens: int,
) -> str:
    """Compact goal formatting when full format exceeds budget.

    Shows goal titles + progress only, omits step details.
    """
    if not goals:
        return "(No active goals yet.)"

    parts = []
    for i, goal in enumerate(goals):
        steps = goal.get("steps", [])
        completed = sum(1 for s in steps if s.get("is_completed"))
        total = len(steps)
        parts.append(
            f"Goal {i + 1} [id={goal['id']}]: {goal['title']} "
            f"({goal.get('category', '?')}, {goal.get('confidence', 0):.0%}, "
            f"{completed}/{total} done)"
        )

    return "\n".join(parts)


def _format_new_content_context(
    content: dict[str, Any], ai_result: dict[str, Any],
) -> str:
    """Format the newly saved content for the prompt."""
    structured = ai_result.get("structured_content", {})
    tags = ai_result.get("tags", [])

    parts = [
        f"Title: {content.get('title') or ai_result.get('title', 'Untitled')}",
        f"URL: {content.get('url', '')}",
        f"Platform: {content.get('platform', 'other')}",
        f"Content Type: {content.get('content_type', 'post')}",
        f"Category: {ai_result.get('category', 'Uncategorized')}",
        f"Tags: {', '.join(tags) if tags else 'none'}",
        f"TLDR: {structured.get('tldr', ai_result.get('summary', ''))}",
    ]

    key_points = structured.get("key_points", [])
    if key_points:
        parts.append("Key Points:")
        for kp in key_points:
            parts.append(f"  - {kp}")

    save_motive = structured.get("save_motive", "")
    if save_motive:
        parts.append(f"Likely Save Motive: {save_motive}")

    return "\n".join(parts)


def _format_related_content_context(
    content_list: list[dict[str, Any]],
) -> str:
    """Format the related content (similar + recent) for the prompt.

    Items with a similarity score > 0 were found via RAG vector search.
    Items with score = 0 are recent saves included for broader context.
    """
    if not content_list:
        return "(No previous content saved yet.)"

    parts = []
    for i, item in enumerate(content_list):
        structured = item.get("ai_structured_content") or {}
        tldr = structured.get("tldr", item.get("ai_summary", ""))
        similarity = item.get("_similarity", 0)

        # Show how this item was found
        match_type = (
            f"similarity: {similarity:.0%}" if similarity > 0
            else "recent save"
        )

        line = (
            f"[{i}] {item.get('title', 'Untitled')} "
            f"| Category: {item.get('ai_category', '?')} "
            f"| Platform: {item.get('platform', '?')} "
            f"| Type: {item.get('content_type', '?')} "
            f"| Match: {match_type}"
        )
        if tldr:
            line += f"\n     TLDR: {tldr[:200]}"

        save_motive = structured.get("save_motive", "")
        if save_motive:
            line += f"\n     Motive: {save_motive}"

        parts.append(line)

    return "\n\n".join(parts)


# ---------------------------------------------------------------------------
# DB mutation helpers
# ---------------------------------------------------------------------------
def _apply_personality_update(
    db: Client,
    user_id: str,
    update: dict[str, Any],
    content_id: str | None,
) -> None:
    """Upsert the user's personality profile."""
    payload = {
        "user_id": user_id,
        "summary": update.get("summary", ""),
        "primary_interests": update.get("primary_interests", []),
        "behavior_patterns": update.get("behavior_patterns", []),
        "content_themes": update.get("content_themes", []),
        "last_analyzed_content_id": content_id,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    # Check if personality exists
    existing = (
        db.table("user_personality")
        .select("user_id, version")
        .eq("user_id", user_id)
        .execute()
    )

    if existing.data:
        version = existing.data[0].get("version", 0)
        payload["version"] = version + 1
        db.table("user_personality").update(payload).eq("user_id", user_id).execute()
        logger.info("Updated personality for user %s (v%d)", user_id, version + 1)
    else:
        payload["version"] = 1
        db.table("user_personality").insert(payload).execute()
        logger.info("Created personality for user %s", user_id)


def _create_goal(
    db: Client,
    user_id: str,
    change: dict[str, Any],
    related_content: list[dict[str, Any]],
) -> None:
    """Create a new goal with its steps."""
    # Resolve evidence content IDs from indices
    evidence_ids = _resolve_content_ids(
        change.get("steps", []),
        related_content,
    )

    # Insert goal
    goal_result = (
        db.table("user_goals")
        .insert({
            "user_id": user_id,
            "title": change.get("title", "Untitled Goal"),
            "description": change.get("description", ""),
            "category": change.get("category", ""),
            "status": "active",
            "confidence": min(1.0, max(0.0, change.get("confidence", 0.5))),
            "evidence_content_ids": evidence_ids,
            "ai_reasoning": change.get("reasoning", ""),
        })
        .execute()
    )

    if not goal_result.data:
        logger.error("Failed to create goal: %s", change.get("title"))
        return

    goal_id = goal_result.data[0]["id"]

    # Insert steps
    steps = change.get("steps", [])
    _insert_steps(db, goal_id, steps, related_content, start_index=0)

    logger.info(
        "Created goal '%s' (id=%s) with %d steps for user %s",
        change.get("title"),
        goal_id,
        len(steps),
        user_id,
    )


def _update_goal(
    db: Client,
    user_id: str,
    change: dict[str, Any],
    related_content: list[dict[str, Any]],
) -> None:
    """Update an existing goal — add evidence, adjust confidence, add steps."""
    goal_id = change.get("goal_id")
    if not goal_id:
        logger.warning("Goal update missing goal_id: %s", change)
        return

    # Verify the goal exists and belongs to the user
    existing = (
        db.table("user_goals")
        .select("*")
        .eq("id", goal_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not existing.data:
        logger.warning("Goal %s not found for user %s", goal_id, user_id)
        return

    goal = existing.data

    # Build update payload
    update_payload: dict[str, Any] = {}

    # Update confidence
    new_confidence = change.get("updated_confidence")
    if new_confidence is not None:
        update_payload["confidence"] = min(1.0, max(0.0, new_confidence))

    # Update description if provided
    new_description = change.get("updated_description")
    if new_description:
        update_payload["description"] = new_description

    # Add new evidence content IDs
    add_indices = change.get("add_evidence_content_indices", [])
    if add_indices:
        new_evidence_ids = []
        for idx in add_indices:
            if 0 <= idx < len(related_content):
                cid = related_content[idx].get("id")
                if cid:
                    new_evidence_ids.append(cid)

        existing_evidence = goal.get("evidence_content_ids") or []
        merged = list(set(existing_evidence + new_evidence_ids))
        update_payload["evidence_content_ids"] = merged

    if update_payload:
        db.table("user_goals").update(update_payload).eq("id", goal_id).execute()

    # Add new steps (append after existing ones)
    new_steps = change.get("new_steps", [])
    if new_steps:
        # Find the current max step_index
        existing_steps = (
            db.table("goal_steps")
            .select("step_index")
            .eq("goal_id", goal_id)
            .order("step_index", desc=True)
            .limit(1)
            .execute()
        )
        max_index = (
            existing_steps.data[0]["step_index"] + 1
            if existing_steps.data
            else 0
        )
        _insert_steps(db, goal_id, new_steps, related_content, start_index=max_index)

    logger.info(
        "Updated goal %s: confidence=%s, +%d steps, +%d evidence",
        goal_id,
        change.get("updated_confidence"),
        len(new_steps),
        len(add_indices),
    )


def _insert_steps(
    db: Client,
    goal_id: str,
    steps: list[dict[str, Any]],
    related_content: list[dict[str, Any]],
    start_index: int = 0,
) -> None:
    """Insert goal steps into the database."""
    if not steps:
        return

    rows = []
    for i, step in enumerate(steps):
        # Resolve source content IDs from indices
        source_ids = []
        for idx in step.get("source_content_indices", []):
            if 0 <= idx < len(related_content):
                cid = related_content[idx].get("id")
                if cid:
                    source_ids.append(cid)

        rows.append({
            "goal_id": goal_id,
            "step_index": start_index + i,
            "title": step.get("title", f"Step {start_index + i + 1}"),
            "description": step.get("description", ""),
            "source_content_ids": source_ids,
            "is_completed": False,
        })

    if rows:
        db.table("goal_steps").insert(rows).execute()


def _resolve_content_ids(
    steps: list[dict[str, Any]],
    related_content: list[dict[str, Any]],
) -> list[str]:
    """Extract unique content IDs from step source_content_indices."""
    ids: set[str] = set()
    for step in steps:
        for idx in step.get("source_content_indices", []):
            if 0 <= idx < len(related_content):
                cid = related_content[idx].get("id")
                if cid:
                    ids.add(cid)
    return list(ids)
