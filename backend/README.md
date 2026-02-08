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
# Edit .env with your Supabase and OpenAI keys

# Run the server
uvicorn app.main:app --reload --port 8000
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (secret) |
| `SUPABASE_JWT_SECRET` | Yes | Supabase JWT secret for token validation |
| `OPENAI_API_KEY` | Yes* | OpenAI API key for AI features |
| `GEMINI_API_KEY` | No | Google Gemini API key (alternative AI provider) |
| `AI_PROVIDER` | No | `openai` (default) or `gemini` |
| `BACKEND_PORT` | No | Server port (default: 8000) |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |

*Required for AI features; the app works without it but AI processing and hybrid search will be unavailable.

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

## Architecture

All endpoints require a valid Supabase JWT in the `Authorization: Bearer <token>` header. The backend validates the token using the Supabase JWT secret and extracts the user ID. It then uses the Supabase service role key to bypass RLS and interact with the database directly.
