# Goals Intelligence Engine

> AI-powered intent detection and goal management system that analyzes user content patterns to automatically detect what the user is trying to achieve and generates actionable step-by-step goals.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [End-to-End Data Flow](#2-end-to-end-data-flow)
3. [Database Schema](#3-database-schema)
4. [AI Processing Pipeline](#4-ai-processing-pipeline)
5. [RAG-Powered Pattern Detection](#5-rag-powered-pattern-detection)
6. [API Endpoints](#6-api-endpoints)
7. [File Map](#7-file-map)

---

## 1. System Overview

```mermaid
flowchart TB
    subgraph trigger ["Trigger: Content Save"]
        Save["POST /api/ai/process-content"]
    end

    subgraph existing ["Existing Pipeline (unchanged)"]
        Scrape["Scrape URL Metadata"]
        Categorize["Vertex AI: Categorize + Summarize"]
        Embed["Vertex AI: Generate 768-dim Embedding"]
        Chunk["Chunk Text for RAG"]
        Tags["Create/Link Tags"]
        Collection["Auto-create Smart Collection"]
        Interests["Update user_interests Counters"]
    end

    subgraph goalEngine ["NEW: Goal Intelligence Engine"]
        FetchPersonality["Fetch user_personality"]
        FetchGoals["Fetch Active Goals + Steps"]
        RAGSearch["RAG Vector Search: Find Similar Content"]
        FetchRecent["Fetch 5 Recent Saves"]
        Merge["Merge + Deduplicate"]
        BuildPrompt["Build Prompt Context"]
        VertexCall["Vertex AI Gemini: Analyze Patterns"]
        ApplyPersonality["Upsert user_personality"]
        ApplyGoals["Create/Update Goals + Steps"]
    end

    subgraph storage ["Supabase Storage"]
        PersonalityTable["user_personality"]
        GoalsTable["user_goals"]
        StepsTable["goal_steps"]
    end

    Save --> existing
    existing --> goalEngine
    Embed -.->|"Reuses embedding"| RAGSearch

    FetchPersonality --> BuildPrompt
    FetchGoals --> BuildPrompt
    RAGSearch --> Merge
    FetchRecent --> Merge
    Merge --> BuildPrompt
    BuildPrompt --> VertexCall
    VertexCall --> ApplyPersonality
    VertexCall --> ApplyGoals
    ApplyPersonality --> PersonalityTable
    ApplyGoals --> GoalsTable
    ApplyGoals --> StepsTable
```

### Key Principle

The goal engine **piggybacks on the existing AI pipeline**. It does not duplicate work:

- The embedding was already generated for the content record -- the goal engine **reuses** it for RAG similarity search.
- The content analysis (category, tags, TLDR, save_motive) was already computed -- the goal engine reads those results.
- The only new Vertex AI call is a single Gemini prompt for pattern analysis and goal generation.

---

## 2. End-to-End Data Flow

```mermaid
sequenceDiagram
    autonumber
    participant User as User
    participant API as FastAPI
    participant Pipeline as Existing AI Pipeline
    participant Engine as Goal Engine
    participant RAG as pgvector RAG Search
    participant Gemini as Vertex AI Gemini
    participant DB as Supabase

    User->>API: POST /api/ai/process-content {content_id}
    API->>Pipeline: Steps 1-7 (scrape, categorize, embed, chunk, tags, collection, interests)
    Pipeline-->>API: ai_result {category, tags, summary, embedding, structured_content}

    Note over API,DB: Step 8 - Goal Analysis (non-blocking)

    API->>Engine: analyze_and_update_goals(db, user_id, content, ai_result, settings)

    par Fetch Context
        Engine->>DB: SELECT * FROM user_personality WHERE user_id = ?
        DB-->>Engine: personality (or NULL for new users)
    and
        Engine->>DB: SELECT * FROM user_goals WHERE status = 'active'
        DB-->>Engine: active goals with steps
    end

    Engine->>RAG: match_chunks(embedding, user_id, limit=30, threshold=0.3)
    RAG-->>Engine: Similar chunks ranked by cosine similarity
    Engine->>DB: Fetch parent content records for top 15 unique matches
    DB-->>Engine: Similar content with titles, categories, summaries

    Engine->>DB: SELECT recent 5 content items
    DB-->>Engine: Recent saves for broader context

    Engine->>Engine: Merge similar + recent, deduplicate by ID

    Engine->>Engine: Build prompt with 4 context blocks
    Note over Engine: 1. Personality profile<br/>2. Active goals + step status<br/>3. New content analysis<br/>4. Related content (similarity-ranked)

    Engine->>Gemini: goal_analysis.yaml system prompt + context
    Gemini-->>Engine: JSON response

    Note over Engine,DB: Apply Changes

    alt personality_update present
        Engine->>DB: UPSERT user_personality
    end

    loop For each goal_change
        alt action = "create"
            Engine->>DB: INSERT user_goals
            Engine->>DB: INSERT goal_steps (3-10 steps)
        else action = "update"
            Engine->>DB: UPDATE user_goals (confidence, evidence)
            Engine->>DB: INSERT new goal_steps (appended after existing)
        end
    end

    Engine-->>API: Done
    API-->>User: ProcessContentResponse (unchanged)

    Note over User: User can now view goals via GET /api/goals
```

### What Happens at Each Stage

| Stage | System | What Happens |
|-------|--------|-------------|
| Content save | FastAPI | Existing pipeline runs: scrape, categorize, embed, chunk, tag |
| Personality fetch | Supabase | Read the user's AI personality profile (empty on first save) |
| Goals fetch | Supabase | Read all active goals with their steps and completion status |
| RAG search | pgvector | Use the new content's embedding to find semantically similar past content across the user's entire library |
| Recent fetch | Supabase | Get 5 most recent saves for broader emerging-interest context |
| Prompt build | Python | Assemble 4 context blocks: personality, goals, new content, related content |
| AI analysis | Vertex AI | Single Gemini call: detect patterns, update personality, decide goal changes |
| Apply changes | Supabase | Upsert personality, create/update goals and steps |

---

## 3. Database Schema

### user_personality

Internal AI-managed table. One row per user.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID PK | FK to auth.users |
| `summary` | TEXT | "A curious tech enthusiast exploring AI video tools..." |
| `primary_interests` | JSONB | `[{"name": "AI Video Editing", "confidence": 0.85}]` |
| `behavior_patterns` | JSONB | `["tool-explorer", "skill-builder"]` |
| `content_themes` | JSONB | `["AI creativity tools", "automation"]` |
| `last_analyzed_content_id` | UUID | Last content that triggered analysis |
| `version` | INT | Increments on each update |
| `created_at` / `updated_at` | TIMESTAMPTZ | Timestamps |

### user_goals

User-facing interactive goals.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Goal ID |
| `user_id` | UUID FK | FK to auth.users |
| `title` | TEXT | "Master AI Video Editing" |
| `description` | TEXT | Why AI detected this goal |
| `category` | TEXT | Broad category |
| `status` | TEXT | `active` / `completed` / `dismissed` |
| `confidence` | FLOAT | 0.0 - 1.0 |
| `evidence_content_ids` | UUID[] | Content IDs that support this goal |
| `ai_reasoning` | TEXT | Internal: why AI created this |
| `created_at` / `updated_at` | TIMESTAMPTZ | Timestamps |

### goal_steps

Interactive steps within each goal.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID PK | Step ID |
| `goal_id` | UUID FK | FK to user_goals (CASCADE delete) |
| `step_index` | INT | Order (0-based) |
| `title` | TEXT | Step title |
| `description` | TEXT | Detailed instruction |
| `source_content_ids` | UUID[] | Content that inspired this step |
| `is_completed` | BOOL | User toggle |
| `completed_at` | TIMESTAMPTZ | When marked complete |
| `created_at` / `updated_at` | TIMESTAMPTZ | Timestamps |

---

## 4. AI Processing Pipeline

### Prompt Structure

The `goal_analysis.yaml` prompt receives 4 context blocks:

1. **Personality Context** -- current profile summary, interests, patterns, themes (or "new user" marker)
2. **Goals Context** -- all active goals with steps and `[DONE]` / `[ ]` markers
3. **New Content Context** -- the just-saved item: title, URL, platform, category, tags, TLDR, key_points, save_motive
4. **Related Content Context** -- up to 20 items found via RAG similarity + recent saves, each with similarity score or "recent save" marker

### AI Response Format

```json
{
  "personality_update": {
    "summary": "A creative professional exploring AI-powered video editing...",
    "primary_interests": [
      {"name": "AI Video Editing", "confidence": 0.85},
      {"name": "Content Creation", "confidence": 0.6}
    ],
    "behavior_patterns": ["tool-explorer", "skill-builder"],
    "content_themes": ["AI creativity tools", "video production"]
  },
  "goal_changes": [
    {
      "action": "create",
      "title": "Master AI Video Editing",
      "description": "Based on 3 saved items about AI video tools...",
      "category": "Tech",
      "confidence": 0.85,
      "reasoning": "3 items about AI video editing saved recently",
      "steps": [
        {
          "title": "Explore Runway ML basics",
          "description": "Watch the saved tutorial on text-to-video generation",
          "source_content_indices": [0]
        }
      ]
    },
    {
      "action": "update",
      "goal_id": "existing-uuid",
      "add_evidence_content_indices": [0],
      "updated_confidence": 0.92,
      "new_steps": [
        {
          "title": "Try the CapCut AI features",
          "description": "Apply techniques from the newly saved article",
          "source_content_indices": [0]
        }
      ]
    }
  ]
}
```

### Goal Creation Rules (enforced by prompt)

- Minimum 2 related content items required (or 1 very specific item)
- Minimum 0.6 confidence threshold
- Title must be action-oriented
- 3-10 steps per goal
- Steps must reference actual saved content

### Goal Update Rules (enforced by prompt)

- Completed steps are never modified
- New steps are appended after existing ones
- Confidence can increase as more evidence arrives
- Description can be refined as intent becomes clearer

---

## 5. RAG-Powered Pattern Detection

Instead of naively fetching the last N items, the goal engine uses the **same pgvector infrastructure** as the knowledge engine:

1. The new content's embedding (768-dim, already generated) is used as the query vector
2. The `match_chunks` RPC searches `content_chunks` for cosine similarity >= 0.3
3. Results are deduplicated by `content_id` (keeping highest similarity per content)
4. Parent content records are fetched with full metadata
5. A small recent window (5 items) provides broader context

**Why this is better than chronological fetch:**

| Approach | Scope | Precision | Scalability |
|----------|-------|-----------|-------------|
| Last 20 items | Only recent | Low -- unrelated items dilute signal | Misses old patterns |
| RAG similarity | Entire library | High -- only semantically related items | Works at any scale |

---

## 6. API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/goals` | List goals (optional `?status=active\|completed\|dismissed`) |
| `GET` | `/api/goals/{id}` | Goal detail with all steps |
| `PATCH` | `/api/goals/{id}` | Update title, description, or status |
| `PATCH` | `/api/goals/{id}/steps/{step_id}` | Toggle step completion |
| `DELETE` | `/api/goals/{id}` | Delete goal (cascades to steps) |

### Example: List Active Goals

```
GET /api/goals?status=active
Authorization: Bearer <jwt>
```

```json
[
  {
    "id": "abc-123",
    "user_id": "user-456",
    "title": "Master AI Video Editing",
    "description": "Based on 3 saved items about AI video tools...",
    "category": "Tech",
    "status": "active",
    "confidence": 0.85,
    "evidence_content_ids": ["content-1", "content-2", "content-3"],
    "created_at": "2026-02-11T10:00:00Z",
    "updated_at": "2026-02-11T12:00:00Z"
  }
]
```

### Example: Toggle Step Completion

```
PATCH /api/goals/abc-123/steps/step-789
Authorization: Bearer <jwt>
Content-Type: application/json

{"is_completed": true}
```

---

## 7. File Map

| File | Purpose |
|------|---------|
| `supabase/migrations/20260211100000_user_goals.sql` | Database tables, RLS, indexes, triggers |
| `app/services/goal_engine.py` | Core engine: context fetch, RAG search, AI call, DB mutations |
| `app/prompts/goal_analysis.yaml` | System prompt + user template for Gemini |
| `app/schemas/models.py` | Pydantic models: GoalOut, GoalDetailOut, GoalStepOut, etc. |
| `app/routers/goals.py` | REST endpoints for goal CRUD |
| `app/routers/ai.py` | Modified: calls `analyze_and_update_goals()` in step 8 |
| `app/main.py` | Modified: registers `goals.router` |
| `static/index.html` | Test UI: Goals tab, goal list, goal detail, step toggling |
