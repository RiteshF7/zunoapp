# Set Supabase Edge Function secrets from backend/.env (for linked project).
# Run from repo root after: supabase link --project-ref <ref>
# Usage: .\scripts\set-edge-secrets.ps1
# Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from backend/.env.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path backend\.env)) {
    Write-Host "backend/.env not found. Create it and set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY."
    exit 1
}
$envContent = Get-Content backend\.env
$vars = @{}
foreach ($line in $envContent) {
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
        $key = $Matches[1]
        $val = $Matches[2].Trim().Trim('"').Trim("'")
        if ($key -in 'SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY') {
            $vars[$key] = $val
        }
    }
}
if (-not $vars.SUPABASE_URL -or -not $vars.SUPABASE_SERVICE_ROLE_KEY) {
    Write-Host "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env"
    exit 1
}
& supabase secrets set "SUPABASE_URL=$($vars.SUPABASE_URL)" "SUPABASE_SERVICE_ROLE_KEY=$($vars.SUPABASE_SERVICE_ROLE_KEY)"
Write-Host "Edge Function secrets set. Add AI keys via: supabase secrets set OPENAI_API_KEY=... (etc.)"
