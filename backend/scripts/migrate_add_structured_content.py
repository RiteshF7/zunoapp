"""One-time migration: add ai_structured_content JSONB column to content table.

Run from the backend directory:
    python scripts/migrate_add_structured_content.py
"""

import sys
from pathlib import Path

# Ensure app package is importable (parent of scripts/ is backend/)
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import get_settings
from supabase import create_client

settings = get_settings()
db = create_client(settings.supabase_url, settings.supabase_service_role_key)


def migrate():
    """Add ai_structured_content column if it doesn't exist."""
    # Use Supabase's RPC to execute raw SQL
    sql = """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'content'
              AND column_name = 'ai_structured_content'
        ) THEN
            ALTER TABLE public.content
            ADD COLUMN ai_structured_content jsonb DEFAULT NULL;

            COMMENT ON COLUMN public.content.ai_structured_content IS
                'Structured AI extraction: {tldr, key_points, action_items, save_motive}';
        END IF;
    END $$;
    """
    try:
        db.postgrest.rpc("exec_sql", {"query": sql}).execute()
        print("[OK] Migration applied via RPC.")
    except Exception as rpc_err:
        # If exec_sql RPC doesn't exist, try a raw REST call
        print(f"[INFO] RPC method not available ({rpc_err}), trying raw SQL via REST...")
        try:
            from httpx import Client as HttpClient

            resp = HttpClient(timeout=15).post(
                f"{settings.supabase_url}/rest/v1/rpc/exec_sql",
                headers={
                    "apikey": settings.supabase_service_role_key,
                    "Authorization": f"Bearer {settings.supabase_service_role_key}",
                    "Content-Type": "application/json",
                },
                json={"query": sql},
            )
            if resp.status_code < 300:
                print("[OK] Migration applied via REST RPC.")
            else:
                print(f"[WARN] REST RPC returned {resp.status_code}: {resp.text}")
                _print_manual_instructions(sql)
        except Exception as rest_err:
            print(f"[WARN] REST call also failed: {rest_err}")
            _print_manual_instructions(sql)


def _print_manual_instructions(sql: str):
    """Print SQL for user to run manually in Supabase SQL Editor."""
    print("\n" + "=" * 60)
    print("Please run this SQL manually in the Supabase SQL Editor:")
    print("=" * 60)
    clean_sql = (
        "ALTER TABLE public.content\n"
        "ADD COLUMN IF NOT EXISTS ai_structured_content jsonb DEFAULT NULL;"
    )
    print(clean_sql)
    print("=" * 60 + "\n")


if __name__ == "__main__":
    migrate()
