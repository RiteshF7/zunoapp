# Database Migrations

This directory contains **ordered SQL migration files** for the Zuno backend
database (Supabase / PostgreSQL).

## Naming Convention

```
NNN_short_description.sql
```

- `NNN` — zero-padded sequence number (001, 002, …)
- `short_description` — lowercase, underscored summary of what the migration does

Examples:
- `001_user_preferences.sql`
- `002_add_user_interests.sql`
- `003_add_feed_items_index.sql`

## Applying Migrations

### Option A: Supabase CLI (recommended)

```bash
# Install the CLI if you haven't
npm install -g supabase

# Link your project (one-time)
supabase link --project-ref <your-project-ref>

# Push all pending migrations
supabase db push
```

### Option B: Manual (via Supabase Dashboard)

1. Open your Supabase project → **SQL Editor**
2. Run migrations **in order** (001, 002, 003, …)
3. Each file is idempotent (`IF NOT EXISTS`, `OR REPLACE`), so re-running is safe

## Tracking Applied Migrations

The `_migrations` table tracks which migrations have been applied:

```sql
SELECT * FROM _migrations ORDER BY applied_at;
```

Each migration file should include a self-registering INSERT at the end
(see the template below).

## Creating a New Migration

1. Determine the next sequence number (look at existing files)
2. Create the file: `NNN_description.sql`
3. Use this template:

```sql
-- ============================================================
-- Migration NNN: Description
-- ============================================================

-- Your DDL / DML statements here
-- Use IF NOT EXISTS / OR REPLACE for idempotency

-- Register this migration
INSERT INTO _migrations (name) VALUES ('NNN_description')
ON CONFLICT (name) DO NOTHING;
```

## Migration Tracking Table

Run `000_migration_tracking.sql` first if the `_migrations` table doesn't
exist yet.  It only needs to be applied once per database.
