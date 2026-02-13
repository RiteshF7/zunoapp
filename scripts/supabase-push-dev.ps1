# Link to **dev** Supabase project and push migrations. Uses SUPABASE_URL from backend/.env.development.
# Run from repo root: .\scripts\supabase-push-dev.ps1
# Requires backend/.env.development (create from .env.development.example).
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$EnvFile = Join-Path $Root "backend\.env.development"
if (-not (Test-Path $EnvFile)) {
    Write-Host "Missing backend/.env.development. Create from backend/.env.development.example and set SUPABASE_URL."
    exit 1
}

$line = Get-Content $EnvFile | Where-Object { $_ -match '^\s*SUPABASE_URL\s*=' } | Select-Object -First 1
if (-not $line) {
    Write-Host "SUPABASE_URL not set in backend/.env.development"
    exit 1
}
$url = ($line -split '=', 2)[1].Trim().Trim('"').Trim("'")
if ($url -notmatch 'https://([^.]+)\.supabase\.co') {
    Write-Host "Could not derive project ref from SUPABASE_URL"
    exit 1
}
$ProjectRef = $Matches[1]

Write-Host "Dev Supabase: linking project ref $ProjectRef"
supabase link --project-ref $ProjectRef
Write-Host "Pushing migrations..."
supabase db push
