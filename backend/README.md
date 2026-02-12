# Zuno Backend API

FastAPI backend for the Zuno content curation app. Sits between the React Native frontend and Supabase, handling all CRUD operations, JWT auth validation, and AI processing.

## Quick Start

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Copy and fill in environment variables
cp .env.example .env
# Edit .env with your Supabase and Vertex AI config

# Run the server
uvicorn app.main:app --reload --port 8000
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (secret) |
| `SUPABASE_JWT_SECRET` | Yes | Supabase JWT secret for token validation |
| `GCP_PROJECT_ID` | Yes* | Google Cloud project ID for Vertex AI |
| `GCP_LOCATION` | No | GCP region (default: `us-central1`) |
| `GCP_CREDENTIALS_JSON` | No | Path to service account JSON (uses ADC if empty) |
| `VERTEX_EMBEDDING_MODEL` | No | Embedding model (default: `text-embedding-005`) |
| `VERTEX_LLM_MODEL` | No | LLM model (default: `gemini-2.0-flash-001`) |
| `RAG_CHUNK_SIZE` | No | Target tokens per chunk (default: 500) |
| `RAG_CHUNK_OVERLAP` | No | Overlap tokens between chunks (default: 50) |
| `RAG_TOP_K` | No | Chunks to retrieve for RAG (default: 8) |
| `BACKEND_PORT` | No | Server port (default: 8000) |
| `ENVIRONMENT` | No | `development`, `staging`, or `production` (default: development). Production disables /docs and /redoc and tightens CORS. |
| `CORS_ORIGINS` | Yes in prod | Comma-separated allowed origins. Set to your production app URL(s) before going live. |

*Required for AI features (content analysis, embeddings, feed generation, knowledge engine). See [docs/VERTEX_AI_SETUP.md](../docs/VERTEX_AI_SETUP.md) for setup instructions.

### Production: JWKS for JWT validation

The backend loads `backend/jwks.json` to verify Supabase JWTs. For **production**, that file must come from your **production** Supabase project (different from dev). From repo root:

```bash
SUPABASE_URL=https://your-prod-project.supabase.co python backend/scripts/fetch_jwks.py
```

This writes `backend/jwks.json`. Re-run after any Supabase JWT key rotation. Never commit a `jwks.json` that contains keys from a project you don't control.

## API Endpoints (25 total)

### Profile
- `GET /api/profile` — get current user's profile
- `PATCH /api/profile` — update display_name, avatar_url

### Collections
- `GET /api/collections` — list user's collections
- `GET /api/collections/{id}` — get single collection
- `POST /api/collections` — create collection
- `PATCH /api/collections/{id}` — update collection
- `DELETE /api/collections/{id}` — delete collection
- `GET /api/collections/{id}/items` — get items in collection
- `POST /api/collections/{id}/items` — add content to collection
- `DELETE /api/collections/{id}/items/{content_id}` — remove from collection

### Content
- `GET /api/content` — list content (with query filters)
- `GET /api/content/{id}` — get single content
- `POST /api/content` — save new content
- `PATCH /api/content/{id}` — update content
- `DELETE /api/content/{id}` — delete content
- `GET /api/content/{id}/tags` — get content with tags

### Feed
- `GET /api/feed` — get feed items
- `GET /api/bookmarks` — get bookmarked feed item IDs
- `POST /api/bookmarks/{feed_item_id}/toggle` — toggle bookmark

### Search
- `GET /api/search?q=...` — full-text search
- `GET /api/search/hybrid?q=...` — hybrid (FTS + semantic) search
- `GET /api/search/tag/{slug}` — tag-based search
- `GET /api/tags/popular` — popular tags

### AI Processing
- `POST /api/ai/process-content` — AI categorize/summarize/tag/embed
- `POST /api/ai/generate-embedding` — generate embedding vector
- `POST /api/ai/generate-feed` — generate personalized feed

### Knowledge Engine (RAG)
- `POST /api/knowledge/ask` — query your saved content with RAG
- `POST /api/knowledge/reindex` — re-chunk and re-embed content
- `GET /api/knowledge/stats` — knowledge base statistics

## Architecture

All endpoints require a valid Supabase JWT in the `Authorization: Bearer <token>` header. The backend validates the token using the Supabase JWT secret and extracts the user ID. It then uses the Supabase service role key to bypass RLS and interact with the database directly.
