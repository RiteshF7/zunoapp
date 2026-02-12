# What's Left to Push Zuno to Production

A consolidated list of remaining tasks before going live at **www.zuno.com** (or your production domain). Excludes app store submission.

---

## Quick status

| Area | Status |
|------|--------|
| UI config (env vars) | ✅ Uses `VITE_*` from env |
| Health checks | ✅ Uses `profiles` table |
| Supabase schema | ✅ Migrations ready |
| Security headers | ⚠️ Basic done; CSP/HSTS pending |
| Domain-specific config | ❌ Needs prod values |
| Hosting & DNS | ❌ Not deployed |

---

## Using the same DB as production (for now)

If you are not yet using a separate production Supabase project:

- Keep your current Supabase URL and keys in `backend/.env` and `ui/.env`
- Set `ENVIRONMENT=production` in backend for production behavior (no /docs, strict CORS)
- Add your **Render backend URL** to `CORS_ORIGINS` (e.g. `https://zuno-backend.onrender.com`)
- Add the same URL to Supabase Auth redirect URLs when you have a web app at that domain
- When you later move to a dedicated prod DB, create a new Supabase project, update env vars, re-fetch JWKS, and push migrations

---

## How to get the correct Supabase URL (via CLI)

Use the Supabase CLI to find your linked project and its URL:

```powershell
npx supabase projects list
```

Look for the row with ● under LINKED. The **REFERENCE ID** (e.g. `orpdwhqgcthwjnbirizx`) is your project ref. The URL is:

```
https://<REFERENCE_ID>.supabase.co
```

**Example:** For ref `orpdwhqgcthwjnbirizx` → `https://orpdwhqgcthwjnbirizx.supabase.co`

**Sync to backend/.env:**
```powershell
.\scripts\get-supabase-url.ps1 -Update    # PowerShell
./scripts/get-supabase-url.sh --update    # Bash
```

**Get API keys (for SUPABASE_SERVICE_ROLE_KEY, anon key):**
```powershell
npx supabase projects api-keys --project-ref <REFERENCE_ID>
```

---

## How to fetch JWKS

The backend uses `backend/jwks.json` to verify Supabase JWTs. Fetch it from your Supabase instance (same as the one in `backend/.env`):

**Option 1 — From repo root (recommended):**
```powershell
.\scripts\fetch-jwks.ps1
```

**Option 2 — Direct Python:**
```powershell
# From repo root; uses SUPABASE_URL from backend/.env
python backend/scripts/fetch_jwks.py

# Or pass URL explicitly:
python backend/scripts/fetch_jwks.py https://YOUR_PROJECT.supabase.co
```

**Option 3 — curl:**
```powershell
curl "https://YOUR_PROJECT.supabase.co/auth/v1/.well-known/jwks.json" -o backend/jwks.json
```

This writes `backend/jwks.json`. **Commit this file** so Render (or any deploy) has it. Re-run if you rotate Supabase JWT keys.

---

## How to deploy backend to Render

### 1. Create Procfile and runtime (already added)

- `backend/Procfile`: `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- `backend/runtime.txt`: `python-3.11.9`

### 2. Fetch JWKS and commit

```powershell
.\scripts\fetch-jwks.ps1
git add backend/jwks.json
git commit -m "Add jwks.json for Render deploy"
```

### 3. Push to GitHub (or connect your repo to Render)

### 4. Create Web Service on Render

1. Go to [render.com](https://render.com) and sign in (e.g. with GitHub).
2. **New** → **Web Service**.
3. Connect your `zunoapp` repo.
4. Configure:
   - **Name:** `zuno-backend` (or any name)
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`  
     (Or leave blank; Render will use the Procfile.)
5. Click **Create Web Service**.

### 5. Set environment variables

In the service → **Environment** tab, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` | Your Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | *(service role key)* | From Supabase → Settings → API |
| `SUPABASE_JWT_SECRET` | *(JWT secret)* | From Supabase → Settings → API |
| `ENVIRONMENT` | `production` | Disables /docs, tightens CORS |
| `CORS_ORIGINS` | `https://zunoapp.onrender.com,http://localhost:5173,...` | Include Render URL + frontend origins |
| `GCP_PROJECT_ID` | Your GCP project ID | For Vertex AI |
| `GCP_LOCATION` | `us-central1` | Region for Vertex AI |
| `GCP_CREDENTIALS_JSON` | *(paste full JSON)* | Paste the entire service account JSON (one line or multiline) |
| `VERTEX_EMBEDDING_MODEL` | `text-embedding-005` | Optional, has default |
| `VERTEX_LLM_MODEL` | `gemini-2.0-flash-001` | Optional, has default |

**GCP credentials on Render:** Paste the full contents of your service account JSON file into `GCP_CREDENTIALS_JSON`. The app supports both a file path (local) and inline JSON (Render).

### 6. Deploy

Render will build and deploy. You'll get a URL like `https://zunoapp.onrender.com`.

**Verify:**
```text
https://zunoapp.onrender.com/health
```

Should return: `{"status":"ok","service":"zuno-api",...}`

### 7. After deploy

- Add the Render URL to Supabase Auth → URL Configuration → Redirect URLs (if your web app will live there or use it for API).
- Update `ui/.env` with `VITE_API_BASE=https://zunoapp.onrender.com` if the UI is served from a different host.

---

## 1. Environment configuration

### 1.1 Backend (`backend/.env`)

- [ ] `ENVIRONMENT=production`
- [ ] `CORS_ORIGINS=https://www.zuno.com,https://zuno.com` (add mobile/Expo URLs if needed)
- [ ] `SUPABASE_URL` — production Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — production service role key
- [ ] `SUPABASE_JWT_SECRET` — production JWT secret
- [ ] `GCP_CREDENTIALS_JSON` or equivalent for Vertex AI (never commit)
- [ ] Optional: `LOG_FORMAT=json`, `LOG_LEVEL=INFO`

### 1.2 UI build (`ui/.env`)

- [ ] `VITE_SUPABASE_URL` — production Supabase URL
- [ ] `VITE_SUPABASE_ANON_KEY` — production anon key
- [ ] `VITE_API_BASE` — only if API is on a different host (e.g. `https://api.zuno.com`); leave unset if same host

### 1.3 Root (mobile, if applicable)

- [ ] `EXPO_PUBLIC_BACKEND_URL=https://www.zuno.com` or `https://api.zuno.com`

---

## 2. Supabase production

### 2.1 Project & migrations

- [ ] Create or use a **separate production Supabase project** (do not reuse dev)
- [ ] `supabase link --project-ref <prod-ref>`
- [ ] `supabase db push` (or run `.\scripts\production.ps1` which does this)

### 2.2 Auth redirect URLs

In Supabase Dashboard → Authentication → URL Configuration, add:

- `https://www.zuno.com/`
- `https://www.zuno.com/app/`
- `https://www.zuno.com/app`
- `https://zuno.com/`
- `https://zuno.com/app/`
- `https://zuno.com/app`
- `com.zuno.app://callback` (for native app / Capacitor)
- Keep `http://localhost:8000/app/` and `http://localhost:5173/` for local dev if needed

### 2.3 Edge Functions

- [ ] Set env in Supabase Dashboard for Edge Functions: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and any AI/embedding keys used by `process-content`, `generate-embedding`, `generate-feed`
- [ ] Deploy Edge Functions to production after setting env

---

## 3. Backend

### 3.1 JWKS (JWT verification)

- [ ] Fetch JWKS from **production** Supabase:

  ```bash
  # Uses SUPABASE_URL from backend/.env
  python backend/scripts/fetch_jwks.py
  ```

- [ ] Re-run after any Supabase JWT key rotation

### 3.2 Deploy backend

- [ ] Deploy to Railway, Render, Fly.io, or your chosen platform
- [ ] Use `Procfile`: `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Set all env vars via platform’s secret/env UI (never bake into image)
- [ ] Use `/health/live` for liveness and `/health/ready` for readiness
- [ ] Serve over HTTPS

---

## 4. Frontend (web)

### 4.1 Build & deploy

- [ ] Set `ui/.env` with production `VITE_*` values
- [ ] Run `.\scripts\build-ui.ps1` or `./scripts/build-ui.sh` from repo root
- [ ] Output: `backend/static/` (app at `/app/`, landing at `/`)
- [ ] Deploy `backend/static/` (or the full backend serving it) over HTTPS
- [ ] Ensure API and frontend are reachable at your domain (same origin or correct `VITE_API_BASE`)

---

## 5. Security

### 5.1 Still to do

- [ ] **CSP & HSTS** — Add `Content-Security-Policy` and `Strict-Transport-Security` when `ENVIRONMENT=production` in `backend/app/middleware.py`
- [ ] Confirm no `.env` or real keys in version control
- [ ] GCP credentials supplied via env/secret manager at runtime, not in repo

### 5.2 Already in place

- Basic security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, etc.)
- CORS controlled by `CORS_ORIGINS`
- JWT validation via JWKS

---

## 6. One-shot script

From repo root, after filling `backend/.env` and `ui/.env`:

```powershell
.\scripts\production.ps1
```

Does: setup-env → fetch JWKS → supabase link+push → build UI.

---

## 7. Manual steps (after script)

| Step | Where |
|------|--------|
| Auth redirect URLs | Supabase Dashboard → Auth → URL Configuration |
| Edge Function secrets | Supabase Dashboard → Edge Functions |
| Set admin user | `UPDATE public.profiles SET role = 'admin' WHERE id = '<uuid>';` |

---

## 8. Optional (post-launch)

- **Rate limiting**: If multiple API instances, set `RATE_LIMIT_STORAGE_URI` to Redis URL
- **Monitoring**: Sentry, uptime checks
- **Privacy policy**: Required for app store; host at a public URL

---

## 9. Domain-specific (www.zuno.com)

See `docs/PRODUCTION_WWW_ZUNO_COM.md` for exact values to use when the domain is www.zuno.com.

---

## Summary checklist

- [ ] Prod Supabase project created/linked
- [ ] Prod env vars set (backend, ui)
- [ ] JWKS fetched from prod Supabase
- [ ] `supabase db push` run
- [ ] Auth redirect URLs added
- [ ] Edge Function env set and deployed
- [ ] Backend deployed with prod env
- [ ] UI built with prod env and deployed
- [ ] HTTPS everywhere
- [ ] CSP & HSTS enabled (recommended)
