#!/usr/bin/env python3
"""Fetch Supabase JWKS and write to backend/jwks.json.

Used for production: the backend validates JWTs using jwks.json. For a
production Supabase project, download that project's JWKS (not the dev one).

Usage:
  Set SUPABASE_URL in the environment, then from repo root or backend/:
    python backend/scripts/fetch_jwks.py
  Or from backend/:
    python scripts/fetch_jwks.py

Writes backend/jwks.json. Create backend/.env with SUPABASE_URL first, or pass
the URL as the first argument.
"""

import json
import os
import sys
from pathlib import Path
from urllib.request import urlopen

def _load_dotenv(env_path: Path) -> dict[str, str]:
    """Read key=value from .env file (no external deps)."""
    out: dict[str, str] = {}
    if not env_path.exists():
        return out
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        if "#" in val:
            val = val[: val.index("#")]
        val = val.strip().strip("'\"").strip()
        out[key.upper()] = val
    return out


def main():
    base = Path(__file__).resolve().parent.parent
    env_path = base / ".env"
    dotenv = _load_dotenv(env_path)
    url = (
        os.environ.get("SUPABASE_URL")
        or dotenv.get("SUPABASE_URL")
        or (sys.argv[1] if len(sys.argv) > 1 else None)
    )
    if not url:
        print("Usage: SUPABASE_URL=<url> python fetch_jwks.py", file=sys.stderr)
        print("   or: python fetch_jwks.py <SUPABASE_URL>", file=sys.stderr)
        sys.exit(1)
    url = url.rstrip("/")
    jwks_url = f"{url}/auth/v1/.well-known/jwks.json"
    out_path = base / "jwks.json"
    print(f"Fetching {jwks_url} -> {out_path}")
    with urlopen(jwks_url) as resp:
        data = json.loads(resp.read().decode())
    out_path.write_text(json.dumps(data, indent=2))
    print("Done. Ensure this jwks.json is from your production Supabase project.")

if __name__ == "__main__":
    main()
