#!/usr/bin/env python3
"""Print a variable from a .env file. Used by scripts to avoid duplicating env parsing.

Usage:
  python backend/scripts/get_env_var.py <env_file> <VAR_NAME>

  VAR_NAME: SUPABASE_URL or PROJECT_REF (derived from SUPABASE_URL).
  env_file: path to .env file (e.g. backend/.env.development).
Prints the value to stdout; exits 1 if missing.
"""

import re
import sys
from pathlib import Path


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
        out[key.upper()] = val.strip().strip("'\"").strip()
    return out


def main() -> None:
    if len(sys.argv) != 3:
        print("Usage: get_env_var.py <env_file> <VAR_NAME>", file=sys.stderr)
        sys.exit(1)
    env_file = Path(sys.argv[1]).resolve()
    var_name = sys.argv[2].upper()
    env = _read_dotenv(env_file)
    if var_name == "PROJECT_REF":
        url = env.get("SUPABASE_URL", "")
        match = re.match(r"https://([^.]+)\.supabase\.co", url.strip())
        value = match.group(1) if match else ""
    else:
        value = env.get(var_name, "")
    if not value:
        print(f"Missing or empty {var_name} in {env_file}", file=sys.stderr)
        sys.exit(1)
    print(value)


if __name__ == "__main__":
    main()
