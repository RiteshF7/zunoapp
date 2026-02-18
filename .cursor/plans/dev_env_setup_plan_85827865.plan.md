---
name: Dev env setup plan
overview: "Define the current deployed setup as production and add a full development environment: separate Supabase, Render, and Google OAuth for dev; support running locally or against dev Render; single project config switch (dev vs prod)."
todos: []
isProject: false
---

# Dev environment setup (current = production)

## Current state

- **Backend** ([backend/app/config.py](backend/app/config.py)): Reads a single `backend/.env`; `ENVIRONMENT` controls debug/CORS (`development` | `staging` | `production`). `/docs` and `/redoc` only when `debug` is true (i.e. development).
- **UI** ([ui/src/core/config.js](ui/src/core/config.js)): Vite inlines `VITE_*` from `ui/.env` at build. In dev mode it can use a hardcoded `_devFallback` Supabase when `import.meta.env.DEV` and no `VITE_SUPABASE_URL`.
- **Scripts**: [scripts/setup-env.ps1](scripts/setup-env.ps1) / [scripts/setup-env.sh](scripts/setup-env.sh) copy `.env.example` → `.env` for backend and UI if missing. Production runbook is in [docs/PRODUCTION.md](docs/PRODUCTION.md).

Production today = backend on Render with `ENVIRONMENT=production` and production Supabase; UI built with production `VITE_*` (in CI or deploy). No change to that flow.

---

## Goal

- **Production**: Keep as-is — **separate** production Supabase project, production Render service, production Google OAuth client. No edits to production config or secrets.
- **Development**: Full **separate** dev stack:
  - **Separate Supabase DB project** for dev (data and Auth isolated from prod).
  - **Separate Render project** for dev backend (optional; dev can run **locally** or point to dev Render).
  - **Separate Google OAuth project** for dev (e.g. a second OAuth 2.0 Client ID in Google Cloud, configured only in the dev Supabase project).
  - **Runnable locally**: backend on localhost:8000, UI on localhost:5173, both using dev Supabase and dev Google Auth; or point UI to dev Render API via `VITE_API_BASE`.
- **Single project config switch**: One place (project config) to choose **dev** or **prod** so backend and scripts use the right env files and credentials.

---

## Flow and choices (locked in before implementation)

**Desired flow**

1. Make changes in IDE locally.
2. Run app on localhost (DB = dev Supabase); verify.
3. If good → push to **dev** branch.
4. Push to **dev** → triggers **dev build/redeploy on dev Render** (auto-deploy on push, already configured).
5. If dev Render is good → **manually merge dev into prod branch** and push.
6. Push to **prod** branch → triggers **prod redeploy/build** (auto-deploy on push, already configured).
7. Test on prod; if good, done.

**Choices**


| Item                               | Choice                                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Dev branch (triggers dev Render)   | **dev**                                                                                                   |
| Prod branch (triggers prod Render) | **prod**                                                                                                  |
| Deploy trigger                     | **Render Auto-Deploy** on git push — already set and working. Dev service ← `dev`, prod service ← `prod`. |
| What gets built on deploy          | **Backend + UI** (e.g. build UI in Render build step, serve from backend)                                 |
| Promote dev → prod                 | **Manual**: merge dev into prod (PR or local), then push                                                  |
| Staging                            | **No staging** for first implementation; add later if needed                                              |


Implementation and docs will use these branch names and this flow.

---

## Branch strategy (do everything on a separate branch)

Do **all** implementation work on a separate branch so production and main stay untouched. If anything goes wrong, discard the branch or revert without affecting the current deploy.

- Create a new branch from current main before making any changes (e.g. `feature/dev-env-setup` or `dev/env-setup`).
- Implement every plan step (env templates, scripts, config switch, backend loading, docs) on this branch only.
- Test locally: switch to dev, run backend + UI, verify dev Supabase and optional dev Render.
- When satisfied, merge to main (or open a PR). To abort, delete the branch or leave it unmerged; main stays unchanged.

---

## 1. Treat current setup as production (documentation only)

- In [docs/PRODUCTION.md](docs/PRODUCTION.md) (and optionally [README.md](README.md)), state explicitly: **Production** = backend with `ENVIRONMENT=production`, production Supabase, and CORS set to production origins; UI build uses production `VITE_SUPABASE_*` and optional `VITE_API_BASE`. No code or deploy changes.
- In [docs/CONFIG_REFERENCE.md](docs/CONFIG_REFERENCE.md) (or a short “Environments” section), clarify:
  - **Production**: `backend/.env` (or Render env) with `ENVIRONMENT=production` and production Supabase; `ui/.env` used only at **build time** for prod (e.g. in CI or deploy script). Never commit these files.
  - **Development**: Use dev Supabase and `ENVIRONMENT=development` in local `backend/.env`; UI uses `ui/.env.development` or `ui/.env` with dev keys when running `npm run dev`.

No code or config changes required for “current = production.”

---

## 2. Separate resources per environment

**Dev vs prod (no shared credentials)**


| Resource         | Production                     | Development                                                         |
| ---------------- | ------------------------------ | ------------------------------------------------------------------- |
| **Supabase**     | One project (prod DB + Auth)   | Separate project (dev DB + Auth)                                    |
| **Render**       | One backend service (prod)     | Separate backend service (dev), or run backend locally              |
| **Google OAuth** | One OAuth 2.0 Client ID (prod) | Separate OAuth 2.0 Client ID (dev), configured only in dev Supabase |


- **Supabase**: Create a second Supabase project (e.g. "zuno-dev"). Use it for all dev env vars (SUPABASE_URL, keys, JWKS). Add dev redirect URLs in dev project (localhost, dev Render URL).
- **Render**: Create a second Render service (e.g. "zuno-backend-dev") from the same repo; set env vars with **dev** Supabase and `ENVIRONMENT=development`. Dev can run **locally** (localhost:8000) or set `VITE_API_BASE` to the dev Render URL when running UI locally.
- **Google Auth**: In Google Cloud Console, create a second OAuth 2.0 Client ID (e.g. "Zuno Dev Web") with redirect URI `https://<DEV_PROJECT_REF>.supabase.co/auth/v1/callback`. In the **dev** Supabase project only: Authentication → Providers → Google → paste this Client ID and Secret. Production Supabase keeps its own OAuth client.

Document in SETUP.md and CONFIG_REFERENCE.md: dev Supabase, dev Render (optional), dev Google OAuth setup and redirect URLs.

---

## 3. Project config switch (dev vs prod)

Single place to choose running type so the right env files are used.

**Mechanism**

- **Root mode file** (e.g. `config/env-mode` or root `.env.mode`, gitignored): one line, `development` or `production`. Source of truth for "which environment am I using?"
- **Backend** ([backend/app/config.py](backend/app/config.py)): On startup, (1) read mode from this file or from env `ZUNO_ENV` / `ENVIRONMENT`, (2) load `backend/.env` if present, (3) load `backend/.env.<mode>` (e.g. `.env.development` or `.env.production`) if present, with the latter overriding. So credentials and CORS come from the active mode.
- **Scripts**: Add **scripts/use-env.ps1** and **scripts/use-env.sh**: accept `dev` or `prod`; write `development` or `production` to the root mode file; print "Backend will use backend/.env.development (or .env.production). Restart backend if running."
- **UI**: Vite already uses `ui/.env.development` for `npm run dev` and `ui/.env.production` / `ui/.env` for `npm run build`. When working in dev, run `npm run dev`; when building for prod, run `npm run build`. No code change; document alignment with project config.

**Default**: If the mode file is missing, default to `development`. Production Render sets `ENVIRONMENT=production` in its env, so Render does not need the mode file.

---

## 4. Env file templates (dev and prod)

Introduce **development-only** example env files so devs don’t have to hand-edit from the generic example.

**Backend**

- Add **backend/.env.development.example** (committed) with:
  - `ENVIRONMENT=development`
  - `CORS_ORIGINS=http://localhost:5173,http://localhost:8081,http://localhost:19006,http://localhost:8000`
  - Placeholders for `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` (and optional GCP/Vertex if needed for local AI), plus short comment: “Use a separate Supabase project for dev; get keys from Supabase Dashboard.”

**UI**

- Add **ui/.env.development.example** (committed) with:
  - `VITE_SUPABASE_URL=` and `VITE_SUPABASE_ANON_KEY=` (placeholders)
  - Comment: “Copy to .env.development and fill with your **dev** Supabase project. Used when running `npm run dev`. Never use production keys here.”

Vite already loads [mode-specific env files](https://vitejs.dev/guide/env-and-mode.html): for `npm run dev` it loads `ui/.env.development` (and `.env.development.local`). So devs will use `ui/.env.development` for local dev and keep `ui/.env` for production builds (or leave `ui/.env` for prod and use only `.env.development` for dev).

**Gitignore**

- Root [.gitignore](.gitignore) currently has `.env.*` and `!.env.example`, so `.env.development.example` is ignored. Add:
  - `!.env.development.example`
  so both `backend/.env.development.example` and `ui/.env.development.example` can be committed.

---

## 5. Setup scripts for development and switch

Add scripts that create **only** dev env files (no overwrite of existing production `.env` on servers).

**New scripts**

- **scripts/setup-env-dev.ps1** (Windows) and **scripts/setup-env-dev.sh** (Unix):
  - Copy `backend/.env.development.example` → `backend/.env.development` and `ui/.env.development.example` → `ui/.env.development` only when targets do not exist. Do not overwrite. Print instructions to fill dev Supabase and (optional) dev Render URL.
- **scripts/use-env.ps1** and **scripts/use-env.sh**: Accept `dev` or `prod`; write `development` or `production` to root mode file (e.g. `config/env-mode`). Print: Restart backend to use backend/.env.development (or .env.production).

**Existing scripts**

- Keep [scripts/setup-env.ps1](scripts/setup-env.ps1) and [scripts/setup-env.sh](scripts/setup-env.sh) for generic template. Use `setup-env-dev` for dev env files and `use-env dev` / `use-env prod` to switch running type.

---

## 6. Automation: Supabase CLI and Render CLI

Use **Supabase CLI** and **Render CLI** (or their APIs) to automate as many setup tasks as possible. Scripts should call these CLIs so that only truly manual steps remain.

**Supabase CLI** (use in scripts where possible)

- **Link and DB**: `supabase link --project-ref <ref>`, `supabase db push` — already used in [scripts/supabase-push](scripts/supabase-push.ps1). For dev, add a script or flag to link to dev project ref and push migrations (read ref from `backend/.env.development` or env).
- **Project URL and keys**: `npx supabase projects list -o json`, derive URL; `npx supabase projects api-keys --project-ref <ref>` to get anon and service_role keys (if available) so scripts can write `backend/.env.development` and `ui/.env.development` with minimal typing.
- **JWKS**: Existing [scripts/fetch-jwks](scripts/fetch-jwks.ps1) — run after linking to dev project so `backend/jwks.json` is for dev.
- **Secrets**: `supabase secrets set ...` for Edge Functions — [scripts/set-edge-secrets](scripts/set-edge-secrets.ps1); support dev project when linked to dev ref.

**Render CLI** (use where supported)

- If Render provides a CLI or API (e.g. `render` CLI or Render API) for creating a service, setting env vars, or deploying: add scripts or document in setup so dev Render service can be created/updated via CLI. If not available, all Render setup stays in the manual-steps doc.

**Principle**: Any step that can be done via Supabase CLI or Render CLI should be scripted; the rest go into the manual-steps file.

---

## 7. Manual-steps deliverable: one MD file for tasks you must do yourself

At the end of implementation, create **one markdown file** (e.g. [docs/DEV_ENV_MANUAL_STEPS.md](docs/DEV_ENV_MANUAL_STEPS.md) or `docs/MANUAL_SETUP_TASKS.md`) that lists **only** the tasks that **cannot** be done via CLI and must be done manually by you.

**Contents (examples; adjust per what CLIs can do)**

- **Create dev Supabase project** — Link to Supabase Dashboard; create new project (e.g. "zuno-dev"). If Supabase API/CLI supports project creation, script it and remove from this list.
- **Add Auth redirect URLs** — Supabase Dashboard → Authentication → URL Configuration → add `http://localhost:5173/`, `http://localhost:8000/app/`, dev Render URL if used. (If Supabase CLI/API can set these, script and remove.)
- **Create dev Google OAuth client** — Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID; set redirect URI `https://<DEV_PROJECT_REF>.supabase.co/auth/v1/callback`. Paste Client ID and Secret into Supabase Dashboard → Auth → Providers → Google (dev project only).
- **Create dev Render service** (if not via Render CLI) — Render Dashboard → New → Web Service; connect repo; set env vars from `backend/.env.production.example` with dev values; document the dev service URL.
- **Any other one-off Dashboard/Console steps** that have no CLI (e.g. enabling a provider, copying keys).

Each item: short title, one or two sentences, and link to the relevant Dashboard/Console page. This file is the single checklist for “what I still have to do by hand” after running all scripts.

---

## 8. UI dev fallback (config.js)

[ui/src/core/config.js](ui/src/core/config.js) exposes a hardcoded `_devFallback` Supabase URL/anon key used when `import.meta.env.DEV` and no `VITE_SUPABASE_*` are set. If that project is your **production** Supabase, local dev could accidentally use production.

- **Recommendation**: Only use `_devFallback` when **no** `VITE_SUPABASE_URL` is set in the loaded env (current behavior is fine). Add a one-line comment in code: “Dev only; use a dedicated dev Supabase in .env.development to avoid hitting production.”
- In [docs/CONFIG_REFERENCE.md](docs/CONFIG_REFERENCE.md) (or SETUP), state: “For local development, set `VITE_SUPABASE_*` in `ui/.env.development` (or `.env`) to a **dev** Supabase project. Do not rely on the in-code dev fallback for production data.”

No strict code change required if you’re okay with the current gating; the important part is documentation and using `.env.development` with dev keys.

---

## 9. Documentation updates

- **docs/SETUP.md** (or a new “Development environment” subsection):
  - Add a short “Local development environment” section:
    1. Run `.\scripts\setup-env-dev.ps1` or `./scripts/setup-env-dev.sh` from repo root.
    2. Create (or reuse) a **dev** Supabase project; add to Auth redirect URLs: `http://localhost:5173/`, `http://localhost:8000/app/`, etc.
    3. Edit `backend/.env` and `ui/.env.development` with the dev project URL and anon/service keys; run `scripts/fetch-jwks` so `backend/jwks.json` is for the dev project.
    4. Start backend: `cd backend && uvicorn app.main:app --reload` (or current command).
    5. Start UI: `cd ui && npm run dev`. UI will use `ui/.env.development` and proxy `/api` to the local backend.
  - Link to [CONFIG_REFERENCE.md](docs/CONFIG_REFERENCE.md) and [PRODUCTION.md](docs/PRODUCTION.md) for production vs dev.
- **scripts/README.md**: Document the new dev script:
  - `setup-env-dev` — copy `.env.development.example` → `.env` (backend) and → `.env.development` (UI) when files are missing; for local development only. Production remains unchanged (Render env, prod build).
- **CONFIG_REFERENCE.md**: In the “Environment variables” section, add:
  - Backend: “For development, use `backend/.env.development.example` and run `scripts/setup-env-dev`; set `ENVIRONMENT=development` and dev Supabase.”
  - UI: “For development, copy `ui/.env.development.example` to `ui/.env.development` and set dev `VITE_SUPABASE_*`. Vite loads `.env.development` when running `npm run dev`.”

---

## 10. Backend mode-based env loading (required for project config switch)

Backend must respect the project config switch (section 3) by loading env from the active mode file.

**Implementation in [backend/app/config.py**](backend/app/config.py)

- Before loading settings: read current mode from (1) env var `ZUNO_ENV` or `ENVIRONMENT`, or (2) root mode file (e.g. `config/env-mode` or `.env.mode`). Default to `development` if unset (safe for local).
- Load env in order: (1) `backend/.env` if present, (2) `backend/.env.<mode>` (e.g. `.env.development` or `.env.production`) if present, with the latter overriding. So when mode is `development`, backend uses credentials from `.env.development`; when `production`, from `.env.production`. On Render, `ENVIRONMENT=production` is set in the service env, so backend can use that as mode and load `.env.production` (or Render provides all vars directly and no file is needed).
- Ensure `get_settings()` / startup reads the mode file once (e.g. from repo root or a fixed path relative to backend).

**Scripts**

- **setup-env-dev**: Copy `backend/.env.development.example` → `backend/.env.development` and `ui/.env.development.example` → `ui/.env.development` when missing. Do not overwrite existing files.
- **use-env** (new): Write `development` or `production` to the root mode file; remind user to restart backend. Document in scripts/README.md.

---

## Summary


| Item                   | Action                                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Branch**             | Do all work on a separate branch (e.g. `feature/dev-env-setup`); merge when done or discard if anything goes wrong.                                                            |
| Production             | No change; document: prod Supabase + prod Render + prod Google OAuth.                                                                                                          |
| Separate dev resources | Document: separate dev Supabase project, optional dev Render service, separate dev Google OAuth client (second OAuth 2.0 Client ID, configured only in dev Supabase).          |
| Project config switch  | Root mode file (`config/env-mode`); `use-env dev` / `use-env prod`; backend loads `backend/.env.<mode>`.                                                                       |
| Backend env            | Add `backend/.env.development.example` and `backend/.env.production.example`; backend config loads based on mode.                                                              |
| UI env                 | Add `ui/.env.development.example` and `ui/.env.production.example`; Vite mode = dev server (dev) vs build (prod).                                                              |
| Scripts                | Add `setup-env-dev` (create .env.development from examples), `use-env dev` / `use-env prod`.                                                                                   |
| **Automation**         | Use Supabase CLI (link, db push, projects list, api-keys, fetch-jwks, secrets set) and Render CLI where possible; script everything that can be automated.                     |
| **Manual-steps doc**   | Create **docs/DEV_ENV_MANUAL_STEPS.md** (or MANUAL_SETUP_TASKS.md) listing only tasks that cannot be done via CLI and must be done by you (with links and short instructions). |
| config.js              | Comment and docs: use `.env.development` with dev Supabase; avoid fallback for production.                                                                                     |
| Docs                   | SETUP.md (dev env: Supabase, Render, Google Auth, local + optional dev Render), CONFIG_REFERENCE.md (environments table), scripts/README.md. Link to manual-steps file.        |


**Result**: One place (project config) switches dev vs prod. Dev stack: separate Supabase, optional Render, separate Google OAuth; run locally or point UI to dev Render. Production unchanged. As much as possible is automated via Supabase CLI and Render CLI; everything that cannot be done via CLI is listed in **docs/DEV_ENV_MANUAL_STEPS.md** (or MANUAL_SETUP_TASKS.md) for you to do manually.