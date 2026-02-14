# Dev environment — manual steps

Tasks done in the Dashboard or Console. Create env files manually from `.env.development.example` and `.env.production.example`, then use `use-env dev`, `supabase-push-dev`, `fetch-jwks-dev` as needed.

---

## 1. Create dev Supabase project

- Go to [Supabase Dashboard](https://supabase.com/dashboard) → **New project**.
- Name it e.g. **zuno-dev**; choose region and password.
- After creation, get the **project ref** from the URL: `https://<PROJECT_REF>.supabase.co` (e.g. `xyzabc123`).

- **Settings → API**: copy **Project URL**, **anon public** key, **service_role** key into `backend/.env.development` and `ui/.env.development`.
- **Settings → API → JWT Settings**: copy **JWT Secret** → `SUPABASE_JWT_SECRET` in `backend/.env.development`.

---

## 2. Add Auth redirect URLs (dev Supabase)

- In the **dev** Supabase project: **Authentication → URL Configuration**.
- Under **Redirect URLs**, add **all** origins you might use (the app sends the current origin as `redirect_to`, so each must be allowed):
  - `http://localhost:5173/`
  - `http://localhost:8000/app/`
  - `http://localhost:8000/app`
  - Your dev Render URL if you use one (e.g. `https://your-dev-service.onrender.com/`, `https://your-dev-service.onrender.com/app/`).
  - `com.zuno.app://callback` (for native app).
- **Site URL**: set to your main dev origin (e.g. `http://localhost:5173` or your dev Render URL). Used as the default redirect and for auth email links; with multiple entries in Redirect URLs, both localhost and Render work for OAuth.

---

## 3. Create dev Google OAuth client

- Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**.
- **Create credentials → OAuth 2.0 Client ID** (use a separate OAuth client for dev, not the production one).
- Application type: **Web application** (or add Android/iOS if you need device testing).
- **Authorized redirect URIs**: add  
  `https://<DEV_PROJECT_REF>.supabase.co/auth/v1/callback`  
  (replace `<DEV_PROJECT_REF>` with your dev Supabase project ref, e.g. from the dev project URL `https://xxxxx.supabase.co`).
- Copy **Client ID** and **Client Secret**.
- In the **dev** Supabase project only: **Authentication → Providers → Google** → enable, paste Client ID and Client Secret, save.

---

## 4. Create dev Render service (optional)

If you want a deployed dev backend (in addition to localhost):

- Go to [Render Dashboard](https://dashboard.render.com/) → **New → Web Service**.
- Connect the same repo; set **Branch** to `dev`.
- Build command and start command as for your prod service (e.g. build UI + run backend).
- **Environment**: add variables from `backend/.env.production.example` but with **dev** values:
  - `ENVIRONMENT=development`
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` from the **dev** Supabase project
  - `CORS_ORIGINS` including `http://localhost:5173`, your dev Render URL, etc.
  - GCP/Vertex vars if you use them in dev.
- After deploy, copy the dev service URL and set `VITE_API_BASE` in `ui/.env.development` if you want the local UI to talk to the deployed dev backend.

---

## 5. Clone prod DB to dev (optional)

To copy production schema and data into the dev database:

- **Bash**: `./scripts/clone-prod-to-dev-db.sh`

Requires PostgreSQL client tools (`pg_dump`, `psql`) (no Docker), `psql`, and both projects’ DB passwords. Set `SUPABASE_DB_PASSWORD_PROD` and `SUPABASE_DB_PASSWORD_DEV` or enter them when prompted. This overwrites the dev `public` schema.

---

## 6. One-off checks

- **Supabase Edge Functions** (if used): in the dev project, set secrets (e.g. `supabase secrets set ...` after `supabase link --project-ref <dev-ref>`).
- **Production**: never use dev Supabase or dev OAuth in the production Render service or prod build.

---

See [SETUP.md](SETUP.md) and [CONFIG_REFERENCE.md](CONFIG_REFERENCE.md) for the full dev flow and env reference.
