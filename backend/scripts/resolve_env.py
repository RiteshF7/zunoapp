#!/usr/bin/env python3
"""Resolve .env (with _DEV/_PROD suffixes) into active backend env.

Reads backend/.env, picks one mode, writes:
  - .env             (active; ENVIRONMENT=development|production)
  - .env.development (for scripts that need dev vars)
  - .env.production  (for scripts that need prod vars)

Copy .env.example to .env and fill values. Run with --mode or use ZUNO_MODE in .env.

Usage:
  python scripts/resolve_env.py [--mode dev|prod]
  ./scripts/resolve-env.sh
"""

import argparse
import os
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent


def _get_mode() -> str:
    mode = os.environ.get("ZUNO_ENV") or os.environ.get("ENVIRONMENT")
    if mode:
        mode = str(mode).strip().lower()
        if mode in ("development", "production", "dev", "prod"):
            return "development" if mode in ("development", "dev") else "production"
    env_path = BACKEND_DIR / ".env"
    if env_path.exists():
        env_vars = _read_dotenv(env_path)
        raw = env_vars.get("ZUNO_MODE", "").strip().lower()
        if raw in ("development", "dev"):
            return "development"
        if raw in ("production", "prod"):
            return "production"
    return "development"


def _read_dotenv(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.exists():
        return out
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        if "#" in val:
            val = val[: val.index("#")]
        out[key] = val.strip().strip("'\"").strip()
    return out


def _resolve_env(root_env: dict[str, str]) -> tuple[dict[str, str], dict[str, str]]:
    """Resolve .env into dev and prod envs. Returns (dev_env, prod_env)."""
    dev_env: dict[str, str] = {}
    prod_env: dict[str, str] = {}

    for key, val in root_env.items():
        if key.endswith("_DEV"):
            base = key[:-4]
            if key == "SUPABASE_DB_PASSWORD_DEV":
                dev_env[key] = val
            else:
                dev_env[base] = val
        elif key.endswith("_PROD"):
            base = key[:-5]
            if key == "SUPABASE_DB_PASSWORD_PROD":
                prod_env[key] = val
            else:
                prod_env[base] = val
        else:
            dev_env[key] = val
            prod_env[key] = val

    return dev_env, prod_env


def _env_to_output(env: dict[str, str]) -> str:
    lines = []
    order = [
        "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_JWT_SECRET",
        "SUPABASE_DB_PASSWORD_DEV", "SUPABASE_DB_PASSWORD_PROD",
        "GCP_PROJECT_ID", "GCP_LOCATION", "GCP_CREDENTIALS_JSON",
        "VERTEX_EMBEDDING_MODEL", "VERTEX_LLM_MODEL",
        "RAG_CHUNK_SIZE", "RAG_CHUNK_OVERLAP", "RAG_TOP_K",
        "BACKEND_PORT", "ENVIRONMENT", "CORS_ORIGINS",
    ]
    seen = set()
    for k in order:
        if k in env and k not in seen:
            seen.add(k)
            lines.append(f"{k}={env[k]}")
    for k, v in sorted(env.items()):
        if k not in seen:
            lines.append(f"{k}={v}")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Resolve .env into backend env files")
    parser.add_argument("--mode", choices=["dev", "prod"], help="Override mode")
    args = parser.parse_args()

    mode = "development"
    if args.mode:
        mode = "development" if args.mode == "dev" else "production"
    else:
        mode = _get_mode()

    env_path = BACKEND_DIR / ".env"
    if not env_path.exists():
        print(".env not found. Copy .env.example to .env and fill values.", file=sys.stderr)
        return 1

    root_env = _read_dotenv(env_path)
    dev_env, prod_env = _resolve_env(root_env)

    backend_dev = {k: v for k, v in dev_env.items() if not k.startswith("VITE_")}
    backend_prod = {k: v for k, v in prod_env.items() if not k.startswith("VITE_")}
    backend_active = {**(backend_dev if mode == "development" else backend_prod), "ENVIRONMENT": mode}

    (BACKEND_DIR / ".env").write_text(_env_to_output(backend_active), encoding="utf-8")
    (BACKEND_DIR / ".env.development").write_text(_env_to_output(backend_dev), encoding="utf-8")
    (BACKEND_DIR / ".env.production").write_text(_env_to_output(backend_prod), encoding="utf-8")

    print(f"Resolved {mode} -> .env, .env.development, .env.production")
    return 0


if __name__ == "__main__":
    sys.exit(main())
