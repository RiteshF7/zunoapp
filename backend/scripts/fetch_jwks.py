#!/usr/bin/env python3
"""Fetch Supabase JWKS and write to backend/jwks.json.

Used for production: the backend validates JWTs using jwks.json. For a
production Supabase project, download that project's JWKS (not the dev one).

Usage:
  Set SUPABASE_URL in the environment, then from repo root or backend/:
    python backend/scripts/fetch_jwks.py
  Or from backend/:
    python scripts/fetch_jwks.py

Writes backend/jwks.json. Optional first argument: SUPABASE_URL, or path to .env
file (e.g. backend/.env.development) to read SUPABASE_URL from.
"""

import json
import os
import re
import sys
from pathlib import Path
from urllib.request import urlopen

def _normalize_url(raw: str) -> str:
    """Clean URL: strip markdown links [text](url), duplicates, whitespace."""
    s = raw.strip().strip("'\"").strip()
    # Extract first URL (handles markdown [text](url) and concatenated URLs)
    match = re.search(r"https?://[^\s\]\)\]]+", s)
    if match:
        s = match.group(0).rstrip("/")
        # Truncate at duplicated URL (e.g. url+url pasted twice)
        for sep in ("https://", "http://"):
            idx = s.find(sep, 10)
            if idx > 0:
                s = s[:idx].rstrip("/")
                break
    return s

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
    raw = None
    if len(sys.argv) > 1:
        arg = sys.argv[1].strip()
        if arg.startswith("http://") or arg.startswith("https://"):
            raw = arg
        else:
            rel = arg.replace("backend/", "", 1) if arg.startswith("backend/") else arg
            env_path = (base / rel).resolve() if not Path(arg).is_absolute() else Path(arg).resolve()
            if not env_path.exists():
                print(f"Env file not found: {env_path}", file=sys.stderr)
                sys.exit(1)
            raw = _load_dotenv(env_path).get("SUPABASE_URL")
            if not raw:
                print(f"SUPABASE_URL not set in {env_path}", file=sys.stderr)
                sys.exit(1)
    if not raw:
        env_path = base / ".env"
        dotenv = _load_dotenv(env_path)
        raw = os.environ.get("SUPABASE_URL") or dotenv.get("SUPABASE_URL")
    if not raw:
        print("Usage: SUPABASE_URL=<url> python fetch_jwks.py", file=sys.stderr)
        print("   or: python fetch_jwks.py <SUPABASE_URL|path/to/.env>", file=sys.stderr)
        sys.exit(1)
    url = _normalize_url(raw)
    jwks_url = f"{url}/auth/v1/.well-known/jwks.json"
    out_path = base / "jwks.json"
    print(f"Fetching {jwks_url} -> {out_path}")
    with urlopen(jwks_url) as resp:
        data = json.loads(resp.read().decode())
    out_path.write_text(json.dumps(data, indent=2))
    print("Done. Ensure this jwks.json is from your production Supabase project.")

if __name__ == "__main__":
    main()
