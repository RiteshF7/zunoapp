# Clone prod Supabase DB (schema + data) to dev using pg_dump/psql.
# Run from repo root: .\scripts\clone-prod-to-dev-db.ps1
# Requires: pg_dump, psql, and DB passwords (no Docker).
#
# Passwords: from backend/.env.production (SUPABASE_DB_PASSWORD_PROD) and
# backend/.env.development (SUPABASE_DB_PASSWORD_DEV), or env vars, or prompt.
#
# Warning: This overwrites the dev database. Ensure dev is the target.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$ProdRef = (python backend/scripts/get_env_var.py backend/.env.production PROJECT_REF 2>$null)
$DevRef = (python backend/scripts/get_env_var.py backend/.env.development PROJECT_REF 2>$null)
if (-not $ProdRef) { Write-Host "Missing SUPABASE_URL in backend/.env.production"; exit 1 }
if (-not $DevRef) { Write-Host "Missing SUPABASE_URL in backend/.env.development"; exit 1 }

$ProdPwd = (python backend/scripts/get_env_var.py backend/.env.production SUPABASE_DB_PASSWORD_PROD 2>$null)
if (-not $ProdPwd) { $ProdPwd = $env:SUPABASE_DB_PASSWORD_PROD }
$DevPwd = (python backend/scripts/get_env_var.py backend/.env.development SUPABASE_DB_PASSWORD_DEV 2>$null)
if (-not $DevPwd) { $DevPwd = $env:SUPABASE_DB_PASSWORD_DEV }
if (-not $ProdPwd) {
    $ProdPwd = Read-Host -AsSecureString "Prod DB password (project $ProdRef)"
    $ProdPwd = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ProdPwd))
}
if (-not $DevPwd) {
    $DevPwd = Read-Host -AsSecureString "Dev DB password (project $DevRef)"
    $DevPwd = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DevPwd))
}

$ProdPwdEnc = [uri]::EscapeDataString($ProdPwd)
$DevPwdEnc = [uri]::EscapeDataString($DevPwd)
$ProdUrl = "postgresql://postgres:${ProdPwdEnc}@db.${ProdRef}.supabase.co:5432/postgres"
$DevUrl = "postgresql://postgres:${DevPwdEnc}@db.${DevRef}.supabase.co:5432/postgres"

$DumpDir = "$Root\.supabase-clone-tmp"
New-Item -ItemType Directory -Force -Path $DumpDir | Out-Null
try {
    Write-Host "Dumping from prod ($ProdRef)..."
    pg_dump $ProdUrl --schema-only -n public -f "$DumpDir/schema.sql"
    pg_dump $ProdUrl --data-only -n public -f "$DumpDir/data.sql"

    Write-Host "Resetting dev public schema..."
    $ResetFile = "$DumpDir/reset.sql"
    @"
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
"@ | Set-Content -Path $ResetFile -Encoding utf8
    psql $DevUrl --single-transaction -v ON_ERROR_STOP=1 -f $ResetFile

    Write-Host "Restoring schema and data to dev ($DevRef)..."
    psql $DevUrl --single-transaction -v ON_ERROR_STOP=1 -f "$DumpDir/schema.sql"
    psql $DevUrl --single-transaction -v ON_ERROR_STOP=1 -c "SET session_replication_role = replica" -f "$DumpDir/data.sql"

    Write-Host "Done. Prod DB cloned to dev."
} finally {
    Remove-Item -Recurse -Force $DumpDir -ErrorAction SilentlyContinue
}
