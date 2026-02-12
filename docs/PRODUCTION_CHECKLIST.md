# Production Readiness Checklist

Pre-release prerequisites (excluding Android/iOS app store submission). Use this list before going live.

---

## 1. Environment & configuration

### 1.1 UI (Vite / web)

- [ ] **Move Supabase and API config to env** — `ui/src/core/config.js` currently hardcodes Supabase URL and anon key. For production:
  - Use build-time env (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE`) and read in `config.js` / `api.js`.
  - Add `ui/.env.example` with placeholders (no real keys).
  - Build with prod env so different Supabase project and API URL can be used without code changes.

### 1.2 Backend

- [ ] **Backend .env.example** — Add `ENVIRONMENT=production` and `CORS_ORIGINS=<prod-frontend-origins>` (comma-separated). Document that prod must set these.
- [ ] **Production .env** — Set `ENVIRONMENT=production`, `CORS_ORIGINS` to your prod app URL(s) (and mobile deep-link scheme if needed), and all secrets (Supabase, GCP) via env or secret manager—never commit prod `.env`.

---

## 2. Backend production fixes

### 2.1 Health readiness check

- [ ] **Fix `/health/ready`** — It currently queries `_migrations`, which is created by `backend/migrations/`, not `supabase/migrations/`. On a fresh Supabase prod DB this will 503. Either:
  - **Option A:** Add a Supabase migration that creates `_migrations` (copy from `backend/migrations/000_migration_tracking.sql`) and run it with `supabase db push`, or
  - **Option B:** Change readiness to query a table that already exists in Supabase migrations (e.g. `profiles` with `SELECT 1 FROM profiles LIMIT 1`).

### 2.2 JWKS for JWT verification

- [ ] **Prod JWKS** — Backend loads `backend/jwks.json` from disk. For production Supabase project, ensure this file is the one from your **production** Supabase instance:
  - `curl "<SUPABASE_URL>/auth/v1/.well-known/jwks.json" > backend/jwks.json`
  - Re-download when you rotate Supabase JWT keys. Document this in deploy runbook.

### 2.3 Backend migrations on prod DB

- [ ] **Apply backend migrations** — Tables from `backend/migrations/` (e.g. `_migrations`, user_preferences–related changes in 001, 002) must exist in the production DB. Either:
  - Run those SQL files manually in Supabase SQL Editor (in order), or
  - Add equivalent DDL to `supabase/migrations/` and use `supabase db push` so one push applies everything.

---

## 3. Security

### 3.1 Response headers

- [ ] **CSP and HSTS** — Add Content-Security-Policy and Strict-Transport-Security in `SecurityHeadersMiddleware` when `environment == "production"` (e.g. in `backend/app/middleware.py`). Tighten CSP to your actual domains and script/style sources.

### 3.2 Secrets

- [ ] **No secrets in repo** — Confirm no `.env` or real keys in version control. Root `.env` and `backend/.env` are gitignored; ensure `ui/src/core/config.js` does not ship with prod Supabase service role or JWT secret (anon key in frontend is expected; keep it to anon only).
- [ ] **GCP credentials** — In prod, supply `GCP_CREDENTIALS_JSON` (or mounted service account file) via secure mechanism (env, secret manager, or container secret).

---

## 4. Supabase production

### 4.1 Project and migrations

- [ ] **Production project** — Use a dedicated Supabase project for production (not the dev one). Link CLI if needed: `supabase link --project-ref <prod-ref>`.
- [ ] **Migrations** — Run `supabase db push` (or equivalent) so all `supabase/migrations/` are applied on prod. Verify RLS and policies.

### 4.2 Auth

- [ ] **Redirect URLs** — In Supabase Dashboard → Authentication → URL Configuration, add:
  - Production app URL (e.g. `https://yourdomain.com/`)
  - Mobile deep link (e.g. `com.zuno.app://callback`) if using native app.

### 4.3 Edge Functions

- [ ] **Env for Edge Functions** — In Supabase Dashboard, set production env for Edge Functions: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and any AI/embedding keys used by `process-content`, `generate-embedding`, `generate-feed`. Deploy functions to prod after setting env.

---

## 5. Deployment and ops

### 5.1 Backend (Docker / host)

- [ ] **Run backend with prod env** — Use `ENVIRONMENT=production`, correct `CORS_ORIGINS`, Supabase and GCP credentials. Prefer env vars over baking secrets into images.
- [ ] **Health checks** — Use `/health/live` for liveness and `/health/ready` for readiness (after fixing _migrations/readiness as above). Configure your orchestrator/load balancer accordingly.

### 5.2 Frontend (web)

- [ ] **Build and serve** — Build UI with prod env (`npm run build` in `ui/`). Backend serves `backend/static` at `/static/`; ensure prod requests hit the same origin or set `VITE_API_BASE` / `ZUNO_API_BASE` so API calls go to prod backend.
- [ ] **HTTPS** — Serve app and API over HTTPS in production. If using a reverse proxy, it can terminate TLS and set HSTS.

### 5.3 Optional

- [ ] **Rate limiting** — Backend uses in-memory rate limiting. For multiple API instances, set `RATE_LIMIT_STORAGE_URI` to a Redis URL so limits are shared.
- [ ] **Logging** — In prod, consider `LOG_FORMAT=json` and `LOG_LEVEL=INFO` (or WARNING). Ensure logs do not contain secrets.
- [ ] **Monitoring** — Optional: add error tracking (e.g. Sentry) and basic metrics/uptime checks.

---

## 6. Quick reference

| Item                    | Location / action |
|-------------------------|-------------------|
| Supabase URL/keys (UI)  | `ui/src/core/config.js` → env |
| API base URL (UI)       | `ui/src/core/api.js` (ZUNO_API_BASE / origin) |
| Backend CORS            | `backend/.env`: `CORS_ORIGINS` |
| Backend env             | `backend/.env.example`: add ENVIRONMENT, CORS_ORIGINS |
| Health ready            | `backend/app/main.py` → use existing Supabase table or add _migrations to Supabase |
| JWKS                    | `backend/jwks.json` from prod Supabase JWKS URL |
| Backend migrations      | `backend/migrations/` applied to prod DB |
| Supabase migrations     | `supabase/migrations/` via `supabase db push` |
| Auth redirect URLs      | Supabase Dashboard → Auth → URL Configuration |
| Edge Function secrets   | Supabase Dashboard → Edge Functions → env |

---

*Excludes: Android/iOS app store release, signing, and store listing.*
