# CLI scripts (run from repo root)

Use these scripts from the terminal. On Windows use Git Bash or WSL.

## Start app (dev or prod)

```bash
./scripts/start.sh dev              # Dev: backend + frontend (Vite dev server)
./scripts/start.sh dev backend      # Dev: backend only
./scripts/start.sh dev frontend     # Dev: frontend only
./scripts/start.sh prod             # Prod: build UI, run backend
./scripts/start.sh prod --prep      # Prod: full prep (setup .env, JWKS, migrations, build) then run
```

## Single source of truth: root `.env`

You only edit **root `.env`** (with `_DEV` and `_PROD` suffixes). Everything else is generated.

| What you do | Command |
|-------------|---------|
| Switch to **dev** (writes `backend/.env`, `ui/.env` with dev vars) | `./scripts/use-dev.sh` |
| Switch to **prod** | `./scripts/use-prod.sh` |
| Resolve using `ZUNO_MODE` from root .env | `./scripts/resolve-env.sh` |

Backend and UI read **`backend/.env`** and **`ui/.env`** (one active set of vars). Scripts like `start.sh` and the Android build scripts run resolve with the right mode, so you often only need to run **`use-dev.sh`** or **use-prod.sh** once, then start backend / build UI as usual.

### When deployed (Render, Fly, etc.)

On the server **no `.env` files are used** (they are not deployed). The backend reads **environment variables** set in the host’s dashboard (e.g. Render → Environment).

- Set in Render **Environment** tab: `ENVIRONMENT=production`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `CORS_ORIGINS`, `GCP_*`, etc. (same names as in root `.env`’s `_PROD` vars, but without the suffix).
- You can copy values from your local root `.env` (the `_PROD` entries) into Render’s env; root `.env` remains the single place you maintain them locally, and Render’s env is the source of truth at runtime.

## Development environment

| Step | Command |
|------|---------|
| Switch to dev (then run backend / build) | `./scripts/use-dev.sh` |
| Link to **dev** Supabase + push migrations | `./scripts/supabase-push-dev.sh` (run use-dev.sh first) |
| Fetch JWKS for **dev** project | `./scripts/fetch-jwks-dev.sh` |
| Clone prod DB to dev (schema + data) | `./scripts/clone-prod-to-dev-db.sh` |

- **supabase-push-dev**: Uses `SUPABASE_URL` from `backend/.env.development` (or run `use-dev.sh` so `backend/.env` has dev).
- Dev setup (Supabase, OAuth, redirect URLs): see [docs/DEV_ENV_MANUAL_STEPS.md](../docs/DEV_ENV_MANUAL_STEPS.md).

## Commands that use resolved env

| Step | Command |
|------|---------|
| Copy root .env.example → .env (if missing) | `./scripts/setup-env.sh` |
| Resolve root .env → backend/.env, ui/.env, Chrome extension | `./scripts/resolve-env.sh` |
| Fetch JWKS | `./scripts/fetch-jwks.sh` or `./scripts/fetch-jwks-dev.sh` |
| Link Supabase + push migrations | `./scripts/supabase-push.sh` or `./scripts/supabase-push-dev.sh` |
| Set Edge Function secrets | `./scripts/set-edge-secrets.sh` or `./scripts/set-edge-secrets.sh dev` |
| Build UI (resolves first; uses active ui/.env) | `./scripts/build-ui.sh` |
| **Android debug** (resolves dev, builds, installs) | `./scripts/build-android-debug.sh` |
| **Android release** (resolves prod, builds, installs) | `./scripts/build-android-release.sh` |

## Still manual (Dashboard)

- **Auth redirect URLs**: Supabase Dashboard → Authentication → URL Configuration.
- **Set admin user**: In SQL Editor: `UPDATE public.profiles SET role = 'admin' WHERE id = '<uuid>';`
