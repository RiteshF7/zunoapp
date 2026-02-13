# Link to dev Supabase and push migrations. Uses SUPABASE_URL from backend/.env.development.
# Run from repo root: .\scripts\supabase-push-dev.ps1
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$ProjectRef = (python backend/scripts/get_env_var.py backend/.env.development PROJECT_REF 2>$null).Trim()
if (-not $ProjectRef) {
    Write-Host "Missing or invalid SUPABASE_URL in backend/.env.development."
    exit 1
}
Write-Host "Dev Supabase: linking project ref $ProjectRef"
supabase link --project-ref $ProjectRef
Write-Host "Pushing migrations..."
supabase db push
