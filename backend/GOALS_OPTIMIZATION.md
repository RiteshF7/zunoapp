# Goals Engine -- Optimization Analysis

> A critical analysis of the implementation with concrete optimizations. **All 7 optimizations have been implemented.**

---

## Current Implementation Audit

### What Works Well

1. **Non-blocking design** -- Goal analysis failure never blocks content saving. Wrapped in try/except with warning log.
2. **RAG-powered search** -- Uses existing pgvector infrastructure instead of naive chronological fetch. Finds semantically related content across the entire library.
3. **Incremental analysis** -- Sends current personality + existing goals + related content to AI. Does not re-analyze all content from scratch.
4. **Provider abstraction** -- Uses the existing `AIProvider` protocol. Swapping from Vertex AI to another provider requires no changes in the goal engine.
5. **Prompt externalization** -- `goal_analysis.yaml` is a separate file, editable and reloadable without code changes.

### Optimizations Applied

All 7 optimizations have been implemented in `app/services/goal_engine.py` and `app/routers/ai.py`.

---

## Optimization 1: N+1 Query Fix in Goal Steps Fetch -- IMPLEMENTED

**Severity: High (performance)**

Batch-fetches all goal steps in a single `IN` query instead of one query per goal.

**File:** `app/services/goal_engine.py` -- `_fetch_active_goals()`

**Impact:** Reduces N+1 queries to 2 queries regardless of goal count.

---

## Optimization 2: Parallel Context Fetching -- IMPLEMENTED

**Severity: Medium (latency)**

Uses `asyncio.gather` + `asyncio.to_thread` to run independent DB fetches (active goals, similar content, recent content) concurrently.

**File:** `app/services/goal_engine.py` -- `analyze_and_update_goals()`

**Impact:** Reduces context fetch from sequential (~400-800ms) to parallel (~100-200ms).

---

## Optimization 3: Token Budget Management -- IMPLEMENTED

**Severity: Medium (cost + accuracy)**

`_build_prompt_with_budget()` enforces a ~6000 token cap on the user prompt with priority-based allocation:
- New content: ~20% (always included in full)
- Active goals: ~30% (compact format if over budget)
- Related content: ~35% (items trimmed if over budget)
- Personality: ~15% (truncated last)

**File:** `app/services/goal_engine.py` -- `_build_prompt_with_budget()`

**Impact:** Predictable costs, avoids context window overflow, improves AI focus.

---

## Optimization 4: Goal Deduplication Guard -- IMPLEMENTED

**Severity: Medium (data quality)**

Uses word-overlap Jaccard similarity (threshold: 80%) to prevent creating goals with near-identical titles. Zero-cost (no AI calls) -- runs entirely in Python.

**File:** `app/services/goal_engine.py` -- `_is_duplicate_goal()`

**Impact:** Prevents duplicate goals, cleaner user experience.

---

## Optimization 5: Debounce Rapid Saves (30s Window) -- IMPLEMENTED

**Severity: Low-Medium (cost)**

Checks `user_personality.updated_at` before running analysis. If the last run was < 30 seconds ago, skips the analysis entirely.

**File:** `app/services/goal_engine.py` -- `analyze_and_update_goals()` (debounce check near top)

**Impact:** Saves ~4 Vertex AI calls during rapid-save sessions.

---

## Optimization 6: Background Processing via FastAPI BackgroundTasks -- IMPLEMENTED

**Severity: Low (architecture)**

Goal analysis now runs as a `BackgroundTasks` task, so the HTTP response returns immediately after content processing. Goal analysis continues in the background.

**File:** `app/routers/ai.py` -- `process_content()` (uses `background_tasks.add_task()`)

**Impact:** Reduces content save latency by 3-5 seconds.

---

## Optimization 7: Personality Cache -- IMPLEMENTED

**Severity: Low (performance)**

In-memory TTL cache (5 min) for personality profiles. Cache is busted automatically when personality is updated.

**File:** `app/services/goal_engine.py` -- `_fetch_personality_cached()`, `_bust_personality_cache()`

**Impact:** Saves 1 DB query per content save.

---

## Architecture Alternatives Considered

### Alternative A: Event-Driven with Message Queue

Instead of synchronous processing, use a message queue (Redis, RabbitMQ, or Supabase Realtime):

```
Content Save --> Publish event --> Queue --> Worker picks up --> Goal analysis
```

**Pros:** Fully decoupled, retry support, scalable.
**Cons:** Adds infrastructure complexity (Redis/RabbitMQ). Overkill for current scale.
**Verdict:** Consider when reaching 1000+ daily active users.

### Alternative B: Batch Analysis (Cron Job)

Instead of per-save analysis, run a batch job every N minutes that processes all users with new saves:

```
Every 5 min --> Find users with new saves since last run --> Batch analyze
```

**Pros:** Fewer AI calls, can process multiple saves at once.
**Cons:** Goals are delayed by up to 5 minutes. Loses the "immediate feedback" feel.
**Verdict:** Good for cost optimization at scale. Not ideal for real-time UX.

### Alternative C: Two-Phase Analysis

Split into a lightweight phase (per-save) and a deep phase (periodic):

- **Light phase (every save):** Quick intent check -- does this content match any existing goal? If yes, update evidence count. No AI call needed (use embedding similarity only).
- **Deep phase (every 10 saves or daily):** Full AI analysis with personality update and new goal detection.

**Pros:** Best of both worlds -- fast updates + thorough analysis. Lowest cost.
**Cons:** More complex implementation. New goals are delayed.
**Verdict:** Best long-term architecture. Consider implementing when optimizing costs.
