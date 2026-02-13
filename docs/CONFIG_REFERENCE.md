# Zuno App — Configuration Reference

This document covers **configuration files** for the current stack: **Vite** (`ui/`), **Capacitor** (`mobile/`), and **FastAPI** (`backend/`). Use it when setting up the project or troubleshooting config.

---

## Table of Contents

1. [Environment Variables](#1-environment-variables)
2. [UI (Vite)](#2-ui-vite)
3. [Mobile (Capacitor)](#3-mobile-capacitor)
4. [Backend (FastAPI)](#4-backend-fastapi)
5. [Supabase](#5-supabase)
6. [Design Tokens](#6-design-tokens)
7. [Git Ignore](#7-git-ignore)
8. [Quick Setup Checklist](#8-quick-setup-checklist)
9. [Legacy / Unused (Expo)](#9-legacy--unused-expo)

---

## 1. Environment Variables

### Environments (dev vs prod)

- **Production**: Use a **separate** Supabase project, Render service, and Google OAuth client. Backend on Render sets `ENVIRONMENT=production` and prod env vars; UI build uses `ui/.env.production` or `ui/.env` with prod `VITE_*` (e.g. in Render build step).
- **Development**: Use a **separate** dev Supabase project and optional dev Render. Locally: set project config to dev (e.g. `.\scripts\use-env.ps1 dev`), which writes to `config/env-mode`; backend then loads `backend/.env.development`. UI: when running `npm run dev`, Vite loads `ui/.env.development`; when running `npm run build`, Vite uses `ui/.env.production` or `ui/.env`.
- **Project config switch**: Run `.\scripts\use-env.ps1 dev` or `.\scripts\use-env.ps1 prod` (or `./scripts/use-env.sh dev|prod`) to set the active mode. Backend reads `config/env-mode` or `ZUNO_ENV`/`ENVIRONMENT` and loads `backend/.env.development` or `backend/.env.production` accordingly. See [SETUP.md](SETUP.md) and [DEV_ENV_MANUAL_STEPS.md](DEV_ENV_MANUAL_STEPS.md).

### UI (`ui/.env`, `ui/.env.development`, `ui/.env.production`)

**Files:** `ui/.env` (generic), `ui/.env.development` (for `npm run dev`), `ui/.env.production` (for `npm run build`). All git-ignored. Copy from `ui/.env.example` or `ui/.env.development.example` / `ui/.env.production.example`.

| Variable | Description | Where to find |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Supabase project REST URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous (public) key | Supabase Dashboard → Settings → API |
| `VITE_API_BASE` | (Optional) Backend API base URL. If unset, UI uses same origin or `http://10.0.2.2:8000` on Android emulator. | Set in production when API is on another host (e.g. `https://api.zuno.com`) |

- **Build-time**: Vite inlines `VITE_*` at build; production builds must set these when running `npm run build`.
- **Runtime override**: You can set `window.ZUNO_API_BASE` before the app loads to override API base (e.g. in Capacitor).
- **Local development**: Set `VITE_SUPABASE_*` in `ui/.env.development` to a **dev** Supabase project. Do not rely on the in-code dev fallback for production data; use a dedicated dev Supabase in `.env.development`.

### Backend (`backend/.env`, `backend/.env.development`, `backend/.env.production`)

**Files:** Backend loads `backend/.env` then `backend/.env.<mode>` (mode from `config/env-mode` or `ENVIRONMENT`). Use `backend/.env.development.example` and `backend/.env.production.example` as templates.

| Variable | Description | Where to find |
|----------|-------------|---------------|
| `SUPABASE_URL` | Supabase project REST URL | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secret; never expose to frontend) | Supabase Dashboard → Settings → API |
| `SUPABASE_JWT_SECRET` or JWKS | JWT verification; backend uses JWKS file at `backend/jwks.json` by default | Supabase Dashboard → Settings → API → JWT Secret; or download JWKS from `SUPABASE_URL/auth/v1/.well-known/jwks.json` |
| `OPENAI_API_KEY` / Vertex AI | AI features (categorize, summarize, embed, RAG, goals) | Your AI provider |
| `BACKEND_PORT` | Port for uvicorn (default 8000) | — |
| `CORS_ORIGINS` | Allowed origins for CORS (comma-separated) | e.g. `http://localhost:5173,https://app.zuno.com` |
| `ENVIRONMENT` | `development`, `staging`, or `production` | Controls /docs, /redoc, CORS strictness |

---

## 2. UI (Vite)

### 2.1 Vite Config (`ui/vite.config.js`)

**File:** [ui/vite.config.js](ui/vite.config.js)

| Setting | Value | Purpose |
|---------|-------|---------|
| `base` | `'/app/'` | App is served at `/app/` when built (e.g. under FastAPI at `/app/`) |
| `build.outDir` | `../backend/static/app` | Build output goes to backend static folder |
| `server.port` | 5173 | Dev server port |
| `server.proxy` | `/api`, `/health` → `http://localhost:8000` | In dev, API requests are proxied to backend so CORS and same-origin work |

### 2.2 Tailwind & Theme (`ui/index.html`, `ui/src/styles/theme.css`)

- **Tailwind**: Configured inline in [ui/index.html](ui/index.html) via `tailwind.config` (darkMode: `class`, colors, fontFamily, borderRadius, boxShadow). No separate `tailwind.config.js` in ui.
- **CSS variables**: [ui/src/styles/theme.css](ui/src/styles/theme.css) defines `--c-bg`, `--c-surface`, `--c-surface-hover`, `--c-border`, `--c-muted`, `--c-heading`, `--c-body`, `--c-shadow`, `--c-nav-bg` for light and dark. Tailwind `accent` and other colors can reference these or be set in the config.
- **Design system**: See [docs/UI_STYLE_GUIDE.md](docs/UI_STYLE_GUIDE.md) and [docs/PROJECT_RULES.md](docs/PROJECT_RULES.md).

### 2.3 Package Scripts (`ui/package.json`)

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start Vite dev server (e.g. http://localhost:5173) |
| `build` | `vite build` | Build for production into `backend/static/app` |
| `preview` | `vite preview` | Preview production build locally |

---

## 3. Mobile (Capacitor)

### 3.1 Capacitor Config (`mobile/capacitor.config.ts`)

**File:** [mobile/capacitor.config.ts](mobile/capacitor.config.ts)

| Setting | Value | Purpose |
|---------|-------|---------|
| `appId` | `com.zuno.app` | Unique app identifier (iOS bundle ID / Android package) |
| `appName` | `Zuno` | Display name |
| `webDir` | `www` | Directory with built web assets (run `npx cap copy` or `sync` from ui build output) |

- **API base**: In native app, API base is resolved by the UI at runtime (see [ui/src/core/config.js](ui/src/core/config.js) `getApiBase()`). For Android emulator, unset `VITE_API_BASE` so the app uses `http://10.0.2.2:8000`. For production, set `VITE_API_BASE` at build time or inject `window.ZUNO_API_BASE`.
- **Cleartext**: `android.allowMixedContent` and `ios.allowMixedContent` allow HTTP to local backend during development.
- **Server scheme**: `server.androidScheme` / `iosScheme: 'http'` so API calls to localhost aren’t blocked as mixed content.

### 3.2 Building for Mobile

1. Build the UI: `cd ui && npm run build`
2. Copy (or sync) output to `mobile/www` (or point `webDir` to the built output)
3. In `mobile/`: `npx cap sync`, then `npx cap open android` or `npx cap open ios`

See [docs/SETUP.md](docs/SETUP.md) and [docs/IOS_SHARE_EXTENSION_SETUP.md](docs/IOS_SHARE_EXTENSION_SETUP.md) for full mobile setup.

---

## 4. Backend (FastAPI)

### 4.1 Config (`backend/app/config.py`)

**File:** `backend/app/config.py`

Backend reads the current mode from `config/env-mode` or `ZUNO_ENV`/`ENVIRONMENT`, then loads `backend/.env` and `backend/.env.<mode>` (e.g. `.env.development` or `.env.production`), with the mode file overriding. So credentials and CORS come from the active environment. See `backend/.env.development.example` and `backend/.env.production.example` for required variables.

### 4.2 Running the Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- **Health**: `GET /health`, `GET /health/live`, `GET /health/ready`
- **App SPA**: Backend can serve the built UI at `/app` and `/app/` from `backend/static/app` (see [backend/app/main.py](backend/app/main.py)).

---

## 5. Supabase

### 5.1 Local Config (`supabase/config.toml`)

**File:** `supabase/config.toml`

Configures local Supabase (`supabase start`). Key sections: `[api]`, `[db]`, `[auth]`, `[storage]`, `[edge_runtime]`. Auth providers (e.g. Google) are configured in the Supabase Dashboard under Authentication → Providers.

### 5.2 Migrations (`supabase/migrations/`)

Applied in order by filename. Run:

```bash
supabase db push    # push to linked remote project
supabase db reset   # reset local DB and re-apply migrations + seed
```

### 5.3 Seed Data (`supabase/seed.sql`)

**File:** `supabase/seed.sql`

Optional seed data; applied when `[db.seed]` is enabled in `config.toml` during `supabase db reset`.

### 5.4 Edge Functions (`supabase/functions/`)

Backend has replaced the original Edge Functions (process-content, generate-embedding, generate-feed) with FastAPI routes. Remaining Edge Functions (if any) are documented in the repo; deploy with `supabase functions deploy <name>` and set secrets in the Dashboard or via `supabase secrets set`.

---

## 6. Design Tokens

- **App**: CSS variables in [ui/src/styles/theme.css](ui/src/styles/theme.css); Tailwind theme in [ui/index.html](ui/index.html). See [docs/UI_STYLE_GUIDE.md](docs/UI_STYLE_GUIDE.md) for tokens (colors, radius, typography) and [docs/PROJECT_RULES.md](docs/PROJECT_RULES.md) for “where tokens live”.
- **Landing**: Tailwind and tokens in [landing-ui/](landing-ui/) (separate build; e.g. `accent-blue`).

---

## 7. Git Ignore (`.gitignore`)

| Pattern | Purpose |
|---------|---------|
| `node_modules/` | Dependencies |
| `dist/`, `build/`, backend `static/` contents as needed | Build artifacts |
| `.env`, `.env.development`, `.env.production`, `config/env-mode` | Environment secrets (never commit) |
| `!.env.example`, `!.env.development.example`, `!.env.production.example` | Example env templates (committed) |
| `backend/jwks.json` | JWKS file (optional; can be generated; do not commit if it contains sensitive metadata) |
| `.DS_Store` | macOS metadata |
| `*.pem`, `*.jks`, `*.p8`, `*.p12`, `*.key`, `*.mobileprovision` | Signing keys (never commit) |

---

## 8. Quick Setup Checklist

1. Clone the repository.
2. **UI**: `cd ui && npm install`. Copy `ui/.env.example` to `ui/.env` and set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (and optionally `VITE_API_BASE` for production).
3. **Backend**: `cd backend && python -m venv venv && source venv/bin/activate` (or `venv\Scripts\activate` on Windows), `pip install -r requirements.txt`. Copy `backend/.env.example` to `backend/.env` and set Supabase and AI provider variables. Place `backend/jwks.json` (download from `SUPABASE_URL/auth/v1/.well-known/jwks.json`) if using JWKS.
4. **Supabase**: `npx supabase login`, `npx supabase link --project-ref <ref>`, `npx supabase db push`.
5. Run backend: `cd backend && uvicorn app.main:app --reload --port 8000`.
6. Run UI: `cd ui && npm run dev`. Open http://localhost:5173 (or use backend proxy if you serve UI from backend).
7. **Mobile (optional)**: Build UI, copy to `mobile/www`, then `cd mobile && npx cap sync && npx cap open android|ios`.

---

## 9. Legacy / Unused (Expo)

The project previously used **Expo / React Native**. The following are **no longer used** by the current stack; kept only for reference or removal later:

- **App manifest** (`app.json`): Expo app config (name, scheme, EAS projectId, etc.). Not used by Capacitor.
- **TypeScript** (`tsconfig.json`), **Metro** (`metro.config.js`), **Babel** (`babel.config.js`): Expo/Metro build pipeline. Current UI is Vite + plain JS.
- **NativeWind / Global CSS** (`global.css`), **NativeWind preset**: Tailwind for React Native. Current UI uses Tailwind via CDN/config in `ui/index.html` and `ui/src/styles/*.css`.
- **EAS Build** (`eas.json`): Expo Application Services. Native builds are now done via Capacitor (Xcode / Android Studio or CI that runs `cap sync` and builds the native project).
- **Design tokens in TS** (`lib/constants.ts`), **Supabase client** (`lib/supabase.ts`), **AI provider types** (`lib/ai/provider.ts`): These lived in the old frontend; current app uses `ui/src/core/config.js`, `ui/src/core/api.js`, and backend for API/types.

If you need to remove legacy files, delete or archive the Expo/React Native–specific configs and `lib/` in the old frontend; the current repo uses `ui/` (Vite) and `mobile/` (Capacitor) only.
