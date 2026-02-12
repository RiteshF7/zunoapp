# Production Deployment

Critical steps before going live (excluding app store release). See [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) for the full checklist.

**CLI scripts:** From repo root you can run most steps via [scripts/README.md](../scripts/README.md). Example (PowerShell): `.\scripts\production.ps1` runs setup-env, fetch-jwks, supabase link+push, and build-ui. Bash: `./scripts/production.sh`.

## Secrets: never commit production .env

- **Root `.env`** and **`backend/.env`** are gitignored. Never add them to version control.
- **`ui/.env`** is gitignored. Use `ui/.env.example` as a template; set `VITE_*` only for build (e.g. in CI or deploy script).
- **Supabase**: Use a **separate production project**. Do not reuse dev project URL/keys in production.
- **GCP**: Supply `GCP_CREDENTIALS_JSON` (or mounted service account) via your platform’s secret store, not in the image or repo.

## Backend (production)

1. **Environment**
   - Set `ENVIRONMENT=production`.
   - Set `CORS_ORIGINS` to your production app URL(s), comma-separated (e.g. `https://app.yourdomain.com`).
   - Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` for the **production** Supabase project.
   - Set GCP credentials (Vertex AI) via env or secret manager.

2. **JWKS**
   - Backend validates JWTs using `backend/jwks.json`. For production, this file must come from your **production** Supabase project:
     ```bash
     SUPABASE_URL=https://your-prod-project.supabase.co python backend/scripts/fetch_jwks.py
     ```
   - Re-run after any Supabase JWT key rotation. Do not commit prod `jwks.json` if it contains keys from a shared or untrusted project.

3. **Health**
   - Liveness: `GET /health/live`
   - Readiness: `GET /health/ready` (checks DB via `profiles` table)

4. **Docker**
   - Build and run with env vars above. Do not bake secrets into the image; use env or mounted secrets at runtime.

## UI (production build)

1. **Build-time env**
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (production Supabase project).
   - Optionally set `VITE_API_BASE` if the API is on a different host (e.g. `https://api.yourdomain.com`).
   - Build: `cd ui && npm run build`. Output goes to `backend/static/` (served at `/static/` when using the FastAPI static mount).

2. **Serving**
   - Serve over HTTPS. If the UI and API are on the same host, `window.location.origin` is used as the API base; otherwise set `VITE_API_BASE` when building.

## Supabase (production)

1. **Project**
   - Use a dedicated production project. Link CLI if needed: `supabase link --project-ref <prod-ref>`.

2. **Migrations**
   - Run `supabase db push` so all `supabase/migrations/` are applied. This includes the `_migrations` table and all app schema.

3. **Auth**
   - In Dashboard → Authentication → URL Configuration, add:
     - Production app URL (e.g. `https://app.yourdomain.com/`)
     - Mobile deep link if applicable (e.g. `com.zuno.app://callback`)

4. **Edge Functions**
   - Set production env in Dashboard for Edge Functions: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and any AI/embedding keys used by your functions. Deploy functions after setting env.

## Quick reference

| What | Where |
|------|--------|
| Backend env | `backend/.env` (not in repo); see `backend/.env.example` |
| UI build env | `ui/.env` or CI env; see `ui/.env.example` |
| JWKS | `backend/scripts/fetch_jwks.py` → `backend/jwks.json` |
| Health | `/health/live`, `/health/ready` |
| CORS | `CORS_ORIGINS` in backend .env |
| Supabase prod | Separate project; redirect URLs and Edge Function env in Dashboard |
