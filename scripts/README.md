# CLI scripts (run from repo root)

Use these to do production-prep steps from the terminal. On Windows use the `.ps1` scripts in PowerShell; on macOS/Linux use the `.sh` scripts (or Git Bash on Windows).

## Development environment

| Step | PowerShell | Bash |
|------|------------|------|
| Set project config to dev or prod | `.\scripts\use-env.ps1 dev` or `.\scripts\use-env.ps1 prod` | `./scripts/use-env.sh dev` or `./scripts/use-env.sh prod` |
| Link to **dev** Supabase + push migrations | `.\scripts\supabase-push-dev.ps1` | `./scripts/supabase-push-dev.sh` |
| Fetch JWKS for **dev** project | `.\scripts\fetch-jwks-dev.ps1` | `./scripts/fetch-jwks-dev.sh` |
| Clone prod DB to dev (schema + data) | `.\scripts\clone-prod-to-dev-db.ps1` | `./scripts/clone-prod-to-dev-db.sh` |

- **use-env**: Writes `development` or `production` to `config/env-mode`. Backend then loads `backend/.env.development` or `backend/.env.production`. Restart the backend after switching. Create env files manually from `.env.development.example` and `.env.production.example`.
- **supabase-push-dev**: Uses `SUPABASE_URL` from `backend/.env.development` to link and push migrations.
- **clone-prod-to-dev-db**: Uses `pg_dump`/`psql` to copy prod schema and data to dev. Requires PostgreSQL client tools (pg_dump, psql) and DB passwords (`SUPABASE_DB_PASSWORD_PROD`, `SUPABASE_DB_PASSWORD_DEV` or prompts). No Docker. Overwrites dev `public` schema.
- Dev setup (Supabase, OAuth, redirect URLs): see [docs/DEV_ENV_MANUAL_STEPS.md](../docs/DEV_ENV_MANUAL_STEPS.md).

---

## One-shot: run everything (production)

**PowerShell (Windows):**
```powershell
.\scripts\production.ps1
```

**Bash:**
```bash
./scripts/production.sh
```

This will: copy `.env.example` → `.env` if missing, fetch JWKS, link Supabase and push migrations, and build the UI. Fill `backend/.env` and `ui/.env` with your values first (or run `setup-env` then edit).

---

## Step-by-step (production / generic)

| Step | PowerShell | Bash |
|------|------------|------|
| Copy .env from examples (if missing) | `.\scripts\setup-env.ps1` | `./scripts/setup-env.sh` |
| Get Supabase URL from CLI (and update backend/.env) | `.\scripts\get-supabase-url.ps1 -Update` | `./scripts/get-supabase-url.sh --update` |
| Fetch JWKS (uses `backend/.env` SUPABASE_URL) | `.\scripts\fetch-jwks.ps1` | `./scripts/fetch-jwks.sh` |
| Link Supabase + push migrations | `.\scripts\supabase-push.ps1` or `.\scripts\supabase-push.ps1 <PROJECT_REF>` | `./scripts/supabase-push.sh` or `./scripts/supabase-push.sh <PROJECT_REF>` |
| Set Edge Function secrets (from backend/.env) | `.\scripts\set-edge-secrets.ps1` | `./scripts/set-edge-secrets.sh` |
| Build UI (uses `ui/.env` for VITE_*) | `.\scripts\build-ui.ps1` | `./scripts/build-ui.sh` |

- **supabase-push**: If you omit `PROJECT_REF`, it is derived from `SUPABASE_URL` in `backend/.env`.
- **set-edge-secrets**: Run after `supabase link`. Sets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for Edge Functions. Add AI keys manually: `supabase secrets set OPENAI_API_KEY=...`.

## Still manual (Dashboard)

- **Auth redirect URLs**: Supabase Dashboard → Authentication → URL Configuration → add production app URL and `com.zuno.app://callback`.
- **Dev environment**: See [docs/DEV_ENV_MANUAL_STEPS.md](../docs/DEV_ENV_MANUAL_STEPS.md) for creating dev Supabase project, dev Google OAuth client, dev Render service, and redirect URLs.
- **Set admin user**: In SQL Editor: `UPDATE public.profiles SET role = 'admin' WHERE id = '<user-uuid>';`
