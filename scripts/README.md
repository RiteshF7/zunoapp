# CLI scripts (run from repo root)

Use these to do production-prep steps from the terminal. On Windows use the `.ps1` scripts in PowerShell; on macOS/Linux use the `.sh` scripts (or Git Bash on Windows).

## One-shot: run everything

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

## Step-by-step

| Step | PowerShell | Bash |
|------|------------|------|
| Copy .env from examples (if missing) | `.\scripts\setup-env.ps1` | `./scripts/setup-env.sh` |
| Fetch JWKS (uses `backend/.env` SUPABASE_URL) | `.\scripts\fetch-jwks.ps1` | `./scripts/fetch-jwks.sh` |
| Link Supabase + push migrations | `.\scripts\supabase-push.ps1` or `.\scripts\supabase-push.ps1 <PROJECT_REF>` | `./scripts/supabase-push.sh` or `./scripts/supabase-push.sh <PROJECT_REF>` |
| Set Edge Function secrets (from backend/.env) | `.\scripts\set-edge-secrets.ps1` | `./scripts/set-edge-secrets.sh` |
| Build UI (uses `ui/.env` for VITE_*) | `.\scripts\build-ui.ps1` | `./scripts/build-ui.sh` |

- **supabase-push**: If you omit `PROJECT_REF`, it is derived from `SUPABASE_URL` in `backend/.env`.
- **set-edge-secrets**: Run after `supabase link`. Sets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for Edge Functions. Add AI keys manually: `supabase secrets set OPENAI_API_KEY=...`.

## Still manual (Dashboard)

- **Auth redirect URLs**: Supabase Dashboard → Authentication → URL Configuration → add production app URL and `com.zuno.app://callback`.
- **Set admin user**: In SQL Editor: `UPDATE public.profiles SET role = 'admin' WHERE id = '<user-uuid>';`
