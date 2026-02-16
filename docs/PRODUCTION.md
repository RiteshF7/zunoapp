# Zuno — Production Runbook

Single runbook for taking Zuno to production (www.zuno.com or your domain). Excludes app store submission. **Before going live:** use [PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md). Use with [scripts/README.md](../scripts/README.md) for CLI steps (e.g. `./scripts/start.sh prod --prep`).

**Production** means: a **separate** Render server and a **separate** Supabase database (not shared with dev), with `ENVIRONMENT=production`, production Google OAuth client, and UI build using production `VITE_SUPABASE_*` and optional `VITE_API_BASE`. No code or deploy flow changes—only env and Dashboard configuration.

---

## Table of Contents

1. [Quick Status](#1-quick-status)
2. [Secrets & Environment](#2-secrets--environment)
3. [Supabase](#3-supabase)
4. [Backend](#4-backend)
5. [Frontend (Web UI)](#5-frontend-web-ui)
6. [Security](#6-security)
7. [Domain-Specific (www.zuno.com)](#7-domain-specific-wwwzunocom)
8. [Checklist](#8-checklist)

---

## 1. Quick Status

| Area | Status |
|------|--------|
| UI config (env vars) | ✅ Uses `VITE_*` from env |
| Health checks | ✅ Uses `profiles` table |
| Supabase schema | ✅ Migrations ready |
| Security headers | ✅ Basic + CSP/HSTS when `ENVIRONMENT=production` |
| Domain-specific config | ❌ Needs prod values |
| Hosting & DNS | ❌ Not deployed |

---

## 2. Secrets & Environment

**Never commit production `.env`.** Root and `backend/.env` are gitignored. Use a **separate production Supabase project** and supply GCP credentials via env or secret manager, not in repo.

### 2.1 Backend (`backend/.env`)

- [ ] `ENVIRONMENT=production`
- [ ] `CORS_ORIGINS=https://www.zuno.com,https://zuno.com,...` (add mobile/Expo URLs if needed)
- [ ] `SUPABASE_URL` — production Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — production service role key
- [ ] `SUPABASE_JWT_SECRET` — production JWT secret
- [ ] GCP credentials (Vertex AI): `GCP_CREDENTIALS_JSON` or equivalent (never commit)
- [ ] Optional: `LOG_FORMAT=json`, `LOG_LEVEL=INFO`

### 2.2 UI build (`ui/.env`)

- [ ] `VITE_SUPABASE_URL` — production Supabase URL
- [ ] `VITE_SUPABASE_ANON_KEY` — production anon key
- [ ] `VITE_API_BASE` — only if API is on a different host (e.g. `https://api.zuno.com`); leave unset if same host

### 2.3 Mobile (root / Expo, if applicable)

- [ ] `EXPO_PUBLIC_BACKEND_URL=https://www.zuno.com` or `https://api.zuno.com`

### Alternative: Using the same DB as production (temporary)

If you ever run prod and dev against the same Supabase (not recommended long-term):

- Set `ENVIRONMENT=production` in backend; add your **Render backend URL** to `CORS_ORIGINS` and Supabase Auth redirect URLs
- Prefer a **separate** production Render server and Supabase database for production

---

## 3. Supabase

### 3.1 Project & migrations

- [ ] Use a **separate production Supabase project** (do not reuse dev)
- [ ] `supabase link --project-ref <prod-ref>`
- [ ] `supabase db push` (or run `./scripts/start.sh prod --prep`)

### 3.2 Auth redirect URLs

In Supabase Dashboard → Authentication → URL Configuration, add:

- `https://www.zuno.com/`, `https://www.zuno.com/app/`, `https://www.zuno.com/app`
- `https://zuno.com/`, `https://zuno.com/app/`, `https://zuno.com/app`
- `com.zuno.app://callback` (native / Capacitor)
- Keep `http://localhost:8000/app/` and `http://localhost:5173/` for local dev if needed

### 3.3 Edge Functions

- [ ] Set env in Supabase Dashboard for Edge Functions: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and any AI/embedding keys for `process-content`, `generate-embedding`, `generate-feed`
- [ ] Deploy Edge Functions to production after setting env

---

## 4. Backend

### 4.1 Supabase URL (via CLI)

```powershell
npx supabase projects list
```

Use the **REFERENCE ID** of the linked project. URL: `https://<REFERENCE_ID>.supabase.co`. Sync to `backend/.env`. Get API keys: `npx supabase projects api-keys --project-ref <REFERENCE_ID>`.

### 4.2 JWKS (JWT verification)

Backend uses `backend/jwks.json` to verify Supabase JWTs. Fetch from **production** Supabase:

**From repo root:**
```powershell
./scripts/fetch-jwks.sh
```

**Or direct:**
```powershell
python backend/scripts/fetch_jwks.py
# Or: python backend/scripts/fetch_jwks.py https://YOUR_PROJECT.supabase.co
```

**Or curl:**
```powershell
curl "https://YOUR_PROJECT.supabase.co/auth/v1/.well-known/jwks.json" -o backend/jwks.json
```

Commit `backend/jwks.json` so Render (or your host) has it. Re-run after JWT key rotation.

### 4.3 Health

- Liveness: `GET /health/live`
- Readiness: `GET /health/ready` (e.g. checks `profiles` table)

### 4.4 Deploy to Render

1. **Procfile / runtime** — `backend/Procfile`: `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`; `backend/runtime.txt`: `python-3.11.9`
2. Fetch JWKS and commit (see above)
3. Push to GitHub (or connect repo to Render)
4. **New → Web Service** on [render.com](https://render.com), connect repo
5. Configure: **Root Directory** = `backend`, **Build** = `pip install -r requirements.txt`, **Start** = Procfile or `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. **Environment** tab: set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `ENVIRONMENT=production`, `CORS_ORIGINS`, `GCP_PROJECT_ID`, `GCP_LOCATION`, `GCP_CREDENTIALS_JSON` (full JSON), optional `VERTEX_EMBEDDING_MODEL`, `VERTEX_LLM_MODEL`
7. Deploy; verify `https://<your-service>.onrender.com/health` returns `{"status":"ok","service":"zuno-api",...}`
8. Add Render URL to Supabase Auth redirect URLs; set `ui/.env` `VITE_API_BASE` if UI is on another host

---

## 5. Frontend (Web UI)

- [ ] Set `ui/.env` with production `VITE_*` values
- [ ] Build: from repo root `./scripts/build-ui.sh` → output `backend/static/` (app at `/app/`, landing at `/`)
- [ ] Deploy `backend/static/` (or full backend serving it) over HTTPS
- [ ] Ensure API and frontend are reachable (same origin or correct `VITE_API_BASE`)

---

## 6. Security

### To do

- [ ] Confirm no `.env` or real keys in version control
- [ ] GCP credentials via env/secret manager at runtime only

### Already in place

- Basic security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, etc.)
- **CSP & HSTS** when `ENVIRONMENT=production` (see `backend/app/middleware.py`)
- CORS via `CORS_ORIGINS`
- JWT validation via JWKS (fetched at runtime from Supabase URL)

---

## 7. Domain-Specific (www.zuno.com)

**Current backend URL:** `https://zunoapp.onrender.com`

- **backend/.env (local) / Render env:**  
  `ENVIRONMENT=production`  
  `CORS_ORIGINS=https://zunoapp.onrender.com,https://www.zuno.com,https://zuno.com,http://localhost:5173,...`

- **ui/.env (prod build):**  
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` = prod values  
  Same host: leave `VITE_API_BASE` unset.  
  API on api.zuno.com: `VITE_API_BASE=https://api.zuno.com`

- **Root (mobile):** `EXPO_PUBLIC_BACKEND_URL=https://www.zuno.com` or `https://api.zuno.com`

- **Supabase Auth → Redirect URLs:** add  
  `https://zunoapp.onrender.com/`, `https://zunoapp.onrender.com/app/`, `https://zunoapp.onrender.com/app`,  
  `https://www.zuno.com/`, `https://www.zuno.com/app/`, `https://www.zuno.com/app`,  
  `https://zuno.com/`, `https://zuno.com/app/`, `https://zuno.com/app`,  
  `http://localhost:5173/`, `http://localhost:8000/app/`, `com.zuno.app://callback`

- Build UI/landing: `./scripts/build-ui.sh`; deploy over HTTPS.

---

## 8. Checklist

- [ ] Prod Supabase project created/linked
- [ ] Prod env set (backend, ui)
- [ ] JWKS fetched from prod Supabase
- [ ] `supabase db push` run
- [ ] Auth redirect URLs added
- [ ] Edge Function env set and deployed
- [ ] Backend deployed with prod env
- [ ] UI built with prod env and deployed
- [ ] HTTPS everywhere
- [ ] CSP & HSTS enabled (automatic when `ENVIRONMENT=production`)

### Manual steps (after script)

| Step | Where |
|------|--------|
| Auth redirect URLs | Supabase Dashboard → Auth → URL Configuration |
| Edge Function secrets | Supabase Dashboard → Edge Functions |
| Set admin user | `UPDATE public.profiles SET role = 'admin' WHERE id = '<uuid>';` |

### Optional (post-launch)

- **Rate limiting:** If multiple API instances, set `RATE_LIMIT_STORAGE_URI` to Redis URL
- **Monitoring:** Sentry, uptime checks
- **Privacy policy:** Required for app store; host at a public URL

---

*Excludes: Android/iOS app store release, signing, and store listing.*
