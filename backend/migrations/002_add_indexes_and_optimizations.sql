-- ============================================================
-- Migration 002: Add indexes for frequently queried columns
-- Improves performance for feed, search, and collection queries.
-- ============================================================

-- Feed items: frequently sorted by created_at and filtered by category
CREATE INDEX IF NOT EXISTS idx_feed_items_created_at
  ON feed_items(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feed_items_category
  ON feed_items(category);

-- Content: frequently filtered by user + category
CREATE INDEX IF NOT EXISTS idx_content_user_category
  ON content(user_id, ai_category);

CREATE INDEX IF NOT EXISTS idx_content_user_processed
  ON content(user_id, ai_processed);

-- Tags: popular tags sorted by usage_count
CREATE INDEX IF NOT EXISTS idx_tags_usage_count
  ON tags(usage_count DESC);

-- Bookmarks: looked up by user
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id
  ON bookmarks(user_id);

-- Register this migration
INSERT INTO _migrations (name) VALUES ('002_add_indexes_and_optimizations')
ON CONFLICT (name) DO NOTHING;
