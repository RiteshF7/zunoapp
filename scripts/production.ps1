# Run all production-prep steps via CLI (from repo root).
# Run: .\scripts\production.ps1
# 1. Setup .env from examples if missing
# 2. Fetch JWKS from Supabase (backend/.env SUPABASE_URL)
# 3. Link Supabase and push migrations
# 4. Build UI (uses ui/.env for VITE_*)
# Prereqs: Fill backend/.env and ui/.env with your values first (or run setup-env then edit).
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "=== 1. Setup .env (copy from examples if missing) ==="
& "$Root\scripts\setup-env.ps1"

Write-Host ""
Write-Host "=== 2. Fetch JWKS (from backend/.env SUPABASE_URL) ==="
python backend/scripts/fetch_jwks.py

Write-Host ""
Write-Host "=== 3. Supabase: link and push migrations ==="
$ProjectRef = $null
if (Test-Path backend\.env) {
    $line = Get-Content backend\.env | Where-Object { $_ -match '^\s*SUPABASE_URL\s*=' } | Select-Object -First 1
    if ($line) {
        $url = ($line -split '=', 2)[1].Trim()
        if ($url -match 'https://([^.]+)\.supabase\.co') {
            $ProjectRef = $Matches[1]
        }
    }
}
if ($ProjectRef) {
    supabase link --project-ref $ProjectRef 2>$null
    supabase db push
} else {
    Write-Host "SUPABASE_URL not set in backend/.env or could not derive project ref."
    Write-Host "Run: .\scripts\supabase-push.ps1 <PROJECT_REF>"
}

Write-Host ""
Write-Host "=== 4. Build UI ==="
Set-Location (Join-Path $Root ui)
npm run build

Write-Host ""
Write-Host "=== Done. Manual steps (Dashboard): ==="
Write-Host "  - Supabase -> Auth -> URL Configuration: add production redirect URL and com.zuno.app://callback"
Write-Host "  - Supabase -> Edge Functions: set env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AI keys)"
Write-Host "  - Optional: set admin: UPDATE public.profiles SET role = 'admin' WHERE id = '<uuid>';"
