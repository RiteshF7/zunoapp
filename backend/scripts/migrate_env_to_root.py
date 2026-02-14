#!/usr/bin/env python3
"""Migrate backend and ui .env files into root .env with _DEV/_PROD suffixes.

Reads: backend/.env.development, backend/.env.production, ui/.env.development, ui/.env.production
Writes: root .env

Run from repo root: python backend/scripts/migrate_env_to_root.py
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent


def read_env(path: Path) -> dict[str, str]:
    out = {}
    if not path.exists():
        return out
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip()
        if "#" in val:
            val = val[: val.index("#")].strip()
        val = val.strip("'\"")
        out[key] = val
    return out


def main():
    be_dev = read_env(ROOT / "backend" / ".env.development")
    be_prod = read_env(ROOT / "backend" / ".env.production")
    ui_dev = read_env(ROOT / "ui" / ".env.development")
    ui_prod = read_env(ROOT / "ui" / ".env.production")

    lines = [
        "# Zuno — Centralized environment config (single source of truth)",
        "# Run ./scripts/resolve-env.sh to generate backend and ui env files.",
        "",
        "# ═══════════════════════════════════════════════════════════════════════════",
        "# Supabase — Dev",
        "# ═══════════════════════════════════════════════════════════════════════════",
        f"SUPABASE_URL_DEV={be_dev.get('SUPABASE_URL', '')}",
        f"SUPABASE_SERVICE_ROLE_KEY_DEV={be_dev.get('SUPABASE_SERVICE_ROLE_KEY', '')}",
        f"SUPABASE_JWT_SECRET_DEV={be_dev.get('SUPABASE_JWT_SECRET', '')}",
        f"SUPABASE_DB_PASSWORD_DEV={be_dev.get('SUPABASE_DB_PASSWORD_DEV', '')}",
        "",
        "# ═══════════════════════════════════════════════════════════════════════════",
        "# Supabase — Prod",
        "# ═══════════════════════════════════════════════════════════════════════════",
        f"SUPABASE_URL_PROD={be_prod.get('SUPABASE_URL', '')}",
        f"SUPABASE_SERVICE_ROLE_KEY_PROD={be_prod.get('SUPABASE_SERVICE_ROLE_KEY', '')}",
        f"SUPABASE_JWT_SECRET_PROD={be_prod.get('SUPABASE_JWT_SECRET', '')}",
        f"SUPABASE_DB_PASSWORD_PROD={be_prod.get('SUPABASE_DB_PASSWORD_PROD', '')}",
        "",
        "# ═══════════════════════════════════════════════════════════════════════════",
        "# UI (Vite) — Dev",
        "# ═══════════════════════════════════════════════════════════════════════════",
        f"VITE_SUPABASE_URL_DEV={ui_dev.get('VITE_SUPABASE_URL', '')}",
        f"VITE_SUPABASE_ANON_KEY_DEV={ui_dev.get('VITE_SUPABASE_ANON_KEY', '')}",
        "",
        "# ═══════════════════════════════════════════════════════════════════════════",
        "# UI (Vite) — Prod",
        "# ═══════════════════════════════════════════════════════════════════════════",
        f"VITE_SUPABASE_URL_PROD={ui_prod.get('VITE_SUPABASE_URL', '')}",
        f"VITE_SUPABASE_ANON_KEY_PROD={ui_prod.get('VITE_SUPABASE_ANON_KEY', '')}",
        "",
        "# ═══════════════════════════════════════════════════════════════════════════",
        "# Vertex AI — Dev",
        "# ═══════════════════════════════════════════════════════════════════════════",
        f"GCP_PROJECT_ID_DEV={be_dev.get('GCP_PROJECT_ID', '')}",
        f"GCP_CREDENTIALS_JSON_DEV={be_dev.get('GCP_CREDENTIALS_JSON', '')}",
        "",
        "# ═══════════════════════════════════════════════════════════════════════════",
        "# Vertex AI — Prod",
        "# ═══════════════════════════════════════════════════════════════════════════",
        f"GCP_PROJECT_ID_PROD={be_prod.get('GCP_PROJECT_ID', '')}",
        f"GCP_CREDENTIALS_JSON_PROD={be_prod.get('GCP_CREDENTIALS_JSON', '')}",
        "",
        "# ═══════════════════════════════════════════════════════════════════════════",
        "# Backend — Dev",
        "# ═══════════════════════════════════════════════════════════════════════════",
        f"ENVIRONMENT_DEV={be_dev.get('ENVIRONMENT', 'development')}",
        f"CORS_ORIGINS_DEV={be_dev.get('CORS_ORIGINS', '')}",
        "",
        "# ═══════════════════════════════════════════════════════════════════════════",
        "# Backend — Prod",
        "# ═══════════════════════════════════════════════════════════════════════════",
        f"ENVIRONMENT_PROD={be_prod.get('ENVIRONMENT', 'production')}",
        f"CORS_ORIGINS_PROD={be_prod.get('CORS_ORIGINS', '')}",
        "",
        "# ═══════════════════════════════════════════════════════════════════════════",
        "# Shared",
        "# ═══════════════════════════════════════════════════════════════════════════",
        f"GCP_LOCATION={be_dev.get('GCP_LOCATION', 'us-central1')}",
        f"RAG_CHUNK_SIZE={be_dev.get('RAG_CHUNK_SIZE', '500')}",
        f"RAG_CHUNK_OVERLAP={be_dev.get('RAG_CHUNK_OVERLAP', '50')}",
        f"RAG_TOP_K={be_dev.get('RAG_TOP_K', '8')}",
        f"VERTEX_EMBEDDING_MODEL={be_dev.get('VERTEX_EMBEDDING_MODEL', 'text-embedding-005')}",
        f"VERTEX_LLM_MODEL={be_dev.get('VERTEX_LLM_MODEL', 'gemini-2.0-flash-001')}",
        f"BACKEND_PORT={be_dev.get('BACKEND_PORT', '8000')}",
    ]

    (ROOT / ".env").write_text("\n".join(lines), encoding="utf-8")
    print("Migrated backend and ui env files -> root/.env")
    print("Run ./scripts/resolve-env.sh to regenerate backend and ui env files.")


if __name__ == "__main__":
    main()
