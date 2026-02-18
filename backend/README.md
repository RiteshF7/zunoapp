# Zuno Backend (API + Supabase)

API-only FastAPI backend. Supabase migrations live in `supabase/`.

## Setup

```bash
cp .env.example .env   # fill in Supabase, GCP, CORS_ORIGINS
npm install            # supabase CLI
./scripts/resolve-env.sh
./scripts/use-env.sh dev
```

## Run

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Supabase

```bash
./scripts/supabase-push-dev.sh   # push migrations to dev
./scripts/supabase-push.sh       # push to prod
```
