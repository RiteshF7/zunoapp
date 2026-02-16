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

## Development environment

| Step | Command |
|------|---------|
| Set project config to dev or prod | `./scripts/use-env.sh dev` or `./scripts/use-env.sh prod` |
| Link to **dev** Supabase + push migrations | `./scripts/supabase-push-dev.sh` |
| Fetch JWKS for **dev** project | `./scripts/fetch-jwks-dev.sh` |
| Clone prod DB to dev (schema + data) | `./scripts/clone-prod-to-dev-db.sh` |

- **use-env**: Writes `development` or `production` to `config/env-mode`, runs `resolve-env.sh` to regenerate backend and ui env files. Restart the backend after switching.
- **supabase-push-dev**: Uses `SUPABASE_URL` from `backend/.env.development`.
- **clone-prod-to-dev-db**: Requires `pg_dump`/`psql`. Overwrites dev `public` schema.
- Dev setup (Supabase, OAuth, redirect URLs): see [docs/DEV_ENV_MANUAL_STEPS.md](../docs/DEV_ENV_MANUAL_STEPS.md).

## Centralized env (single source of truth)

All env vars live in **root `.env`** with `_DEV` and `_PROD` suffixes. Run `./scripts/resolve-env.sh` to generate `backend/.env.development`, `backend/.env.production`, `ui/.env.development`, `ui/.env.production`, and to inject **Chrome extension** defaults (ZUNO_APP_URL, ZUNO_API_BASE) from the current ZUNO_MODE. **Android** debug/release builds use the same .env via `build-android-debug.sh` (dev) and `build-android-release.sh` (prod).

| Step | Command |
|------|---------|
| Copy root .env.example → .env (if missing) | `./scripts/setup-env.sh` |
| Resolve root .env → backend, ui, **Chrome extension** | `./scripts/resolve-env.sh` |
| Get Supabase URL from CLI (and update root .env) | `./scripts/get-supabase-url.sh --update [dev\|prod]` |
| Fetch JWKS (uses backend/.env.production or .development) | `./scripts/fetch-jwks.sh` or `./scripts/fetch-jwks-dev.sh` |
| Link Supabase + push migrations | `./scripts/supabase-push.sh` or `./scripts/supabase-push-dev.sh` |
| Set Edge Function secrets | `./scripts/set-edge-secrets.sh` or `./scripts/set-edge-secrets.sh dev` |
| Build UI (resolves env first, uses ui/.env.production) | `./scripts/build-ui.sh` |
| **Android debug** (dev API from .env) | `./scripts/build-android-debug.sh` |
| **Android release** (prod API from .env) | `./scripts/build-android-release.sh` |

## Still manual (Dashboard)

- **Auth redirect URLs**: Supabase Dashboard → Authentication → URL Configuration.
- **Set admin user**: In SQL Editor: `UPDATE public.profiles SET role = 'admin' WHERE id = '<uuid>';`
