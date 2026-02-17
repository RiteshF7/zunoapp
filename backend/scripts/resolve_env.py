#!/usr/bin/env python3
"""Single source of truth: root .env → one active env per app.

Reads root .env (with _DEV/_PROD suffixes), picks one mode, writes:
  - backend/.env   (single file; ENVIRONMENT=development|production)
  - ui/.env        (single file; all VITE_* for that mode)

You only edit root .env. Run with --mode or use ZUNO_MODE in root .env.
Scripts (build-android-debug, build-android-release, start.sh) run this with the right mode.

Usage:
  python backend/scripts/resolve_env.py [--mode dev|prod]
  ./scripts/resolve-env.sh              # uses ZUNO_MODE from root .env
  ./scripts/use-dev.sh                  # switch to dev (then start backend / build UI)
  ./scripts/use-prod.sh                 # switch to prod
"""

import argparse
import os
import sys
from pathlib import Path

# Repo root (parent of backend/)
BACKEND_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BACKEND_DIR.parent


def _get_mode() -> str:
    mode = os.environ.get("ZUNO_ENV") or os.environ.get("ENVIRONMENT")
    if mode:
        mode = str(mode).strip().lower()
        if mode in ("development", "production", "dev", "prod"):
            return "development" if mode in ("development", "dev") else "production"
    root_env = ROOT_DIR / ".env"
    if root_env.exists():
        env_vars = _read_dotenv(root_env)
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
    """Resolve root env into dev and prod envs. Returns (dev_env, prod_env)."""
    dev_env: dict[str, str] = {}
    prod_env: dict[str, str] = {}

    for key, val in root_env.items():
        if key.endswith("_DEV"):
            base = key[:-4]  # strip _DEV
            # SUPABASE_DB_PASSWORD_DEV stays as-is (scripts read this exact name)
            if key == "SUPABASE_DB_PASSWORD_DEV":
                dev_env[key] = val
            else:
                dev_env[base] = val
        elif key.endswith("_PROD"):
            base = key[:-5]  # strip _PROD
            if key == "SUPABASE_DB_PASSWORD_PROD":
                prod_env[key] = val
            else:
                prod_env[base] = val
        else:
            # Shared - goes to both
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
    parser = argparse.ArgumentParser(description="Resolve root .env into backend and ui env files")
    parser.add_argument("--mode", choices=["dev", "prod"], help="Override mode (default: from config/env-mode)")
    args = parser.parse_args()

    mode = "development"
    if args.mode:
        mode = "development" if args.mode == "dev" else "production"
    else:
        mode = _get_mode()

    root_env_path = ROOT_DIR / ".env"
    if not root_env_path.exists():
        print("root/.env not found. Copy from .env.example and fill values.", file=sys.stderr)
        return 1

    root_env = _read_dotenv(root_env_path)
    dev_env, prod_env = _resolve_env(root_env)

    # Build backend envs - include all non-VITE vars
    backend_dev = {k: v for k, v in dev_env.items() if not k.startswith("VITE_")}
    backend_prod = {k: v for k, v in prod_env.items() if not k.startswith("VITE_")}

    # Build ui envs - only VITE_*
    ui_dev = {k: v for k, v in dev_env.items() if k.startswith("VITE_")}
    ui_prod = {k: v for k, v in prod_env.items() if k.startswith("VITE_")}
    # OAuth deep link: dev APK uses com.zuno.app.dev, prod uses com.zuno.app (must match Android applicationId)
    ui_dev["VITE_APP_SCHEME"] = "com.zuno.app.dev"
    ui_prod["VITE_APP_SCHEME"] = "com.zuno.app"

    # Active env (what backend and UI use by default)
    backend_active = {**(backend_dev if mode == "development" else backend_prod), "ENVIRONMENT": mode}
    ui_active = ui_dev if mode == "development" else ui_prod

    (BACKEND_DIR / ".env").write_text(_env_to_output(backend_active), encoding="utf-8")
    ui_dir = ROOT_DIR / "ui"
    ui_dir.mkdir(exist_ok=True)
    (ui_dir / ".env").write_text(_env_to_output(ui_active), encoding="utf-8")

    # Keep .env.development / .env.production for scripts that need both (e.g. clone-prod-to-dev-db)
    (BACKEND_DIR / ".env.development").write_text(_env_to_output(backend_dev), encoding="utf-8")
    (BACKEND_DIR / ".env.production").write_text(_env_to_output(backend_prod), encoding="utf-8")

    print(f"Resolved {mode} → backend/.env, ui/.env (active). Also backend/.env.development, .env.production.")

    # Inject Chrome extension defaults from current mode (ZUNO_APP_URL, ZUNO_API_BASE)
    env = dev_env if mode == "development" else prod_env
    app_url = (env.get("ZUNO_APP_URL") or "https://zunoapp.onrender.com/app/").rstrip("/") + "/"
    api_base = (env.get("ZUNO_API_BASE") or "https://zunoapp.onrender.com").rstrip("/")
    ext_dir = ROOT_DIR / "chrome-extension"
    for name in ("background.js", "popup.js", "content.js"):
        path = ext_dir / name
        if path.exists():
            text = path.read_text(encoding="utf-8")
            text = text.replace("__ZUNO_APP_URL__", app_url).replace("__ZUNO_API_BASE__", api_base)
            path.write_text(text, encoding="utf-8")

    return 0


if __name__ == "__main__":
    sys.exit(main())
