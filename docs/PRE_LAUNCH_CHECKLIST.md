# Pre-Launch Checklist — Before Going Live

**Production** = separate Render server + separate Supabase database (not shared with dev). Use this list before going live. See [PRODUCTION.md](PRODUCTION.md) for full runbook.

---

## 1. Environment & Secrets

- [ ] **Backend:** `ENVIRONMENT=production` (Render / host env)
- [ ] **Backend:** `CORS_ORIGINS` includes your live app URL(s) and, for the native Android/iOS app, `http://localhost` and `capacitor://localhost` (Capacitor WebView sends these origins). Example: `https://zunoapp.onrender.com,https://www.zuno.com,https://zuno.com,http://localhost,capacitor://localhost`
- [ ] **Backend:** Production Supabase URL, service role key, JWT secret (never commit; set in Render/host env)
- [ ] **Backend:** GCP/Vertex AI credentials set via env or secret manager (if using AI)
- [ ] **UI build:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set for **production** Supabase when running `npm run build` (so dev fallback in config.js is never used)
- [ ] **UI build:** `VITE_API_BASE` set only if API is on a different host; leave unset if same origin

---

## 2. Supabase

- [ ] Using a **production** Supabase project (not dev)
- [ ] Auth → URL Configuration: add your production app URL(s) and `com.zuno.app://callback` for native
- [ ] Migrations applied: `supabase db push` or equivalent
- [ ] JWKS: Backend fetches from `SUPABASE_URL/auth/v1/.well-known/jwks.json` at runtime — no manual file needed if URL is correct

---

## 3. Security

- [ ] No `.env` or real keys committed (root and backend `.env` are gitignored)
- [ ] **CSP & HSTS:** Enabled when `ENVIRONMENT=production` (see `backend/app/middleware.py`)
- [ ] **Docs:** `/docs` and `/redoc` are disabled in production (`settings.debug` is false when `ENVIRONMENT=production`)

---

## 4. Build & Deploy

- [ ] **UI:** Built with production env: `./scripts/build-ui.sh` or `cd ui && npm run build` (with prod `VITE_*` in env)
- [ ] **Backend:** Serves static app from `backend/static/` (or your host’s equivalent)
- [ ] **Chrome extension:** Run `./scripts/resolve-env.sh` with `ZUNO_MODE=production` in root `.env` before packaging so extension uses prod URLs (`ZUNO_APP_URL_PROD`, `ZUNO_API_BASE_PROD`)
- [ ] **Android:** Debug = dev API from `.env` via `./scripts/build-android-debug.sh`; release = prod API via `./scripts/build-android-release.sh` (or `npm run build:android:release`)
- [ ] **Health:** `GET /health` and `GET /health/ready` return 200 after deploy

---

## 5. Post-Deploy Verification

- [ ] Open app in browser; log in (e.g. Google OAuth)
- [ ] Add redirect URL in Supabase if OAuth fails (exact URL including path)
- [ ] Save a link / create content; confirm it appears in library
- [ ] Chrome extension: connect from production app (Profile → Connect Extension); share a page and confirm it saves

---

## 6. Optional but Recommended

- [ ] Set an admin user in DB: `UPDATE public.profiles SET role = 'admin' WHERE id = '<user-uuid>';`
- [ ] Rate limiting: if multiple API instances, set `RATE_LIMIT_STORAGE_URI` to Redis
- [ ] Monitoring / uptime checks and error tracking (e.g. Sentry)
- [ ] Privacy policy URL if required for app store or compliance

---

*Production uses a separate Render server and Supabase database. If you ever need a temporary “same DB” setup, see [PRODUCTION.md](PRODUCTION.md) § “Using the same DB as production (for now)”.*
