-- =============================================================
-- Apply full schema to dev Supabase via SQL Editor
-- Copy this file, paste into Supabase Console → SQL Editor, Run.
-- WARNING: Drops and recreates public schema. Use only on dev.
-- =============================================================

-- 1. Reset public schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Initial schema (20260207000000)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Zuno User'),
    NEW.phone,
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tags_slug ON public.tags(slug);
CREATE INDEX idx_tags_name ON public.tags(name);

CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'folder',
  theme TEXT NOT NULL DEFAULT 'blue',
  is_smart BOOLEAN NOT NULL DEFAULT FALSE,
  smart_rules JSONB,
  item_count INTEGER NOT NULL DEFAULT 0,
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_collections_user ON public.collections(user_id);
CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  platform TEXT NOT NULL DEFAULT 'other',
  content_type TEXT NOT NULL DEFAULT 'post',
  ai_category TEXT,
  ai_summary TEXT,
  ai_processed BOOLEAN NOT NULL DEFAULT FALSE,
  embedding VECTOR(768),
  source_metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_content_user ON public.content(user_id);
CREATE INDEX idx_content_platform ON public.content(platform);
CREATE INDEX idx_content_type ON public.content(content_type);
CREATE INDEX idx_content_category ON public.content(ai_category);
CREATE INDEX idx_content_created ON public.content(created_at DESC);
ALTER TABLE public.content ADD COLUMN fts TSVECTOR
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(ai_summary, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(ai_category, '')), 'D')
  ) STORED;
CREATE INDEX idx_content_fts ON public.content USING GIN(fts);
CREATE TRIGGER content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.content_tags (
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  is_ai_assigned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (content_id, tag_id)
);
CREATE INDEX idx_content_tags_content ON public.content_tags(content_id);
CREATE INDEX idx_content_tags_tag ON public.content_tags(tag_id);

CREATE TABLE public.collection_items (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection_id, content_id)
);
CREATE INDEX idx_collection_items_collection ON public.collection_items(collection_id);
CREATE INDEX idx_collection_items_content ON public.collection_items(content_id);

CREATE TABLE public.feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  source_url TEXT NOT NULL,
  category TEXT,
  content_type TEXT NOT NULL DEFAULT 'article',
  platform TEXT NOT NULL DEFAULT 'other',
  likes INTEGER NOT NULL DEFAULT 0,
  relevance_score FLOAT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_feed_items_category ON public.feed_items(category);
CREATE INDEX idx_feed_items_type ON public.feed_items(content_type);

CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feed_item_id UUID NOT NULL REFERENCES public.feed_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, feed_item_id)
);
CREATE INDEX idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX idx_bookmarks_feed ON public.bookmarks(feed_item_id);

CREATE TABLE public.user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  categories JSONB NOT NULL DEFAULT '{}',
  tags JSONB NOT NULL DEFAULT '{}',
  platforms JSONB NOT NULL DEFAULT '{}',
  content_types JSONB NOT NULL DEFAULT '{}',
  total_saved INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_user_interests_user ON public.user_interests(user_id);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Authenticated users can read tags" ON public.tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create tags" ON public.tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can view own collections" ON public.collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create collections" ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections" ON public.collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections" ON public.collections FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own content" ON public.content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create content" ON public.content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own content" ON public.content FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own content" ON public.content FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view tags on own content" ON public.content_tags FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.content WHERE content.id = content_tags.content_id AND content.user_id = auth.uid()));
CREATE POLICY "Users can add tags to own content" ON public.content_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.content WHERE content.id = content_tags.content_id AND content.user_id = auth.uid()));
CREATE POLICY "Users can remove tags from own content" ON public.content_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.content WHERE content.id = content_tags.content_id AND content.user_id = auth.uid()));
CREATE POLICY "Users can view items in own collections" ON public.collection_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.collections WHERE collections.id = collection_items.collection_id AND collections.user_id = auth.uid()));
CREATE POLICY "Users can add items to own collections" ON public.collection_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.collections WHERE collections.id = collection_items.collection_id AND collections.user_id = auth.uid()));
CREATE POLICY "Users can remove items from own collections" ON public.collection_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.collections WHERE collections.id = collection_items.collection_id AND collections.user_id = auth.uid()));
CREATE POLICY "Authenticated users can view feed items" ON public.feed_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own interests" ON public.user_interests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own interests" ON public.user_interests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create own interests" ON public.user_interests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. RPC functions
CREATE OR REPLACE FUNCTION increment_collection_count(collection_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.collections SET item_count = item_count + 1 WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_collection_count(collection_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.collections SET item_count = GREATEST(item_count - 1, 0) WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Search functions (768 dims)
CREATE OR REPLACE FUNCTION hybrid_search(
  query_text TEXT,
  query_embedding VECTOR(768),
  match_count INT DEFAULT 20,
  full_text_weight FLOAT DEFAULT 1.0,
  semantic_weight FLOAT DEFAULT 1.0,
  rrf_k INT DEFAULT 60
)
RETURNS TABLE (
  id UUID, user_id UUID, url TEXT, title TEXT, description TEXT, thumbnail_url TEXT,
  platform TEXT, content_type TEXT, ai_category TEXT, ai_summary TEXT, created_at TIMESTAMPTZ,
  full_text_rank FLOAT, semantic_rank FLOAT, combined_score FLOAT
)
LANGUAGE SQL AS $$
WITH full_text AS (
  SELECT c.id, ROW_NUMBER() OVER (ORDER BY ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text)) DESC) AS rank
  FROM public.content c
  WHERE c.fts @@ websearch_to_tsquery('english', query_text) AND c.user_id = auth.uid()
  ORDER BY rank LIMIT match_count * 2
),
semantic AS (
  SELECT c.id, ROW_NUMBER() OVER (ORDER BY c.embedding <=> query_embedding) AS rank
  FROM public.content c
  WHERE c.embedding IS NOT NULL AND c.user_id = auth.uid()
  ORDER BY c.embedding <=> query_embedding LIMIT match_count * 2
)
SELECT c.id, c.user_id, c.url, c.title, c.description, c.thumbnail_url, c.platform, c.content_type, c.ai_category, c.ai_summary, c.created_at,
  COALESCE(1.0 / (rrf_k + ft.rank), 0.0)::FLOAT AS full_text_rank,
  COALESCE(1.0 / (rrf_k + s.rank), 0.0)::FLOAT AS semantic_rank,
  (COALESCE(1.0 / (rrf_k + ft.rank), 0.0) * full_text_weight + COALESCE(1.0 / (rrf_k + s.rank), 0.0) * semantic_weight)::FLOAT AS combined_score
FROM public.content c
LEFT JOIN full_text ft ON c.id = ft.id
LEFT JOIN semantic s ON c.id = s.id
WHERE c.user_id = auth.uid() AND (ft.id IS NOT NULL OR s.id IS NOT NULL)
ORDER BY combined_score DESC LIMIT match_count;
$$;

CREATE OR REPLACE FUNCTION search_content(query_text TEXT, match_count INT DEFAULT 20)
RETURNS TABLE (
  id UUID, url TEXT, title TEXT, description TEXT, thumbnail_url TEXT,
  platform TEXT, content_type TEXT, ai_category TEXT, ai_summary TEXT, created_at TIMESTAMPTZ, rank FLOAT
)
LANGUAGE SQL AS $$
SELECT c.id, c.url, c.title, c.description, c.thumbnail_url, c.platform, c.content_type, c.ai_category, c.ai_summary, c.created_at,
  ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text))::FLOAT AS rank
FROM public.content c
WHERE c.fts @@ websearch_to_tsquery('english', query_text) AND c.user_id = auth.uid()
ORDER BY rank DESC LIMIT match_count;
$$;

CREATE OR REPLACE FUNCTION search_by_tag(tag_slug TEXT, match_count INT DEFAULT 50)
RETURNS TABLE (
  id UUID, url TEXT, title TEXT, description TEXT, thumbnail_url TEXT,
  platform TEXT, content_type TEXT, ai_category TEXT, ai_summary TEXT, created_at TIMESTAMPTZ
)
LANGUAGE SQL AS $$
SELECT c.id, c.url, c.title, c.description, c.thumbnail_url, c.platform, c.content_type, c.ai_category, c.ai_summary, c.created_at
FROM public.content c
INNER JOIN public.content_tags ct ON c.id = ct.content_id
INNER JOIN public.tags t ON ct.tag_id = t.id
WHERE t.slug = tag_slug AND c.user_id = auth.uid()
ORDER BY c.created_at DESC LIMIT match_count;
$$;

-- 5. Knowledge engine (content_chunks, match_chunks)
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS full_text TEXT;

CREATE TABLE public.content_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  token_count INTEGER DEFAULT 0,
  embedding VECTOR(768),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_chunks_content ON public.content_chunks(content_id);
CREATE INDEX idx_chunks_user ON public.content_chunks(user_id);
CREATE INDEX idx_chunks_content_index ON public.content_chunks(content_id, chunk_index);
CREATE INDEX idx_chunks_embedding ON public.content_chunks
  USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding VECTOR(768),
  match_user_id UUID,
  match_count INT DEFAULT 8,
  similarity_threshold FLOAT DEFAULT 0.3
)
RETURNS TABLE (id UUID, content_id UUID, chunk_index INTEGER, chunk_text TEXT, token_count INTEGER, metadata JSONB, similarity FLOAT)
LANGUAGE SQL STABLE AS $$
SELECT cc.id, cc.content_id, cc.chunk_index, cc.chunk_text, cc.token_count, cc.metadata,
  (1 - (cc.embedding <=> query_embedding))::FLOAT AS similarity
FROM public.content_chunks cc
WHERE cc.user_id = match_user_id AND cc.embedding IS NOT NULL
  AND (1 - (cc.embedding <=> query_embedding)) > similarity_threshold
ORDER BY cc.embedding <=> query_embedding LIMIT match_count;
$$;

ALTER TABLE public.content_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chunks" ON public.content_chunks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own chunks" ON public.content_chunks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chunks" ON public.content_chunks FOR DELETE USING (auth.uid() = user_id);

-- 6. User preferences
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS ai_structured_content JSONB;

CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  feed_type TEXT NOT NULL DEFAULT 'usersaved' CHECK (feed_type IN ('usersaved', 'suggestedcontent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE TRIGGER trg_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- 7. User goals & personality
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE public.user_personality (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  summary TEXT NOT NULL DEFAULT '',
  primary_interests JSONB NOT NULL DEFAULT '[]'::jsonb,
  behavior_patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  content_themes JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_analyzed_content_id UUID,
  version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dismissed')),
  confidence FLOAT NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  evidence_content_ids UUID[] NOT NULL DEFAULT '{}',
  ai_reasoning TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.goal_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.user_goals(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  source_content_ids UUID[] NOT NULL DEFAULT '{}',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_goals_user_status ON public.user_goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_created ON public.user_goals(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goal_steps_goal_index ON public.goal_steps(goal_id, step_index);

ALTER TABLE public.user_personality ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own personality" ON public.user_personality FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own personality" ON public.user_personality FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own personality" ON public.user_personality FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own goals" ON public.user_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.user_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.user_goals FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.user_goals FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.goal_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own goal steps" ON public.goal_steps FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_goals g WHERE g.id = goal_steps.goal_id AND g.user_id = auth.uid()));
CREATE POLICY "Users can insert own goal steps" ON public.goal_steps FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_goals g WHERE g.id = goal_steps.goal_id AND g.user_id = auth.uid()));
CREATE POLICY "Users can update own goal steps" ON public.goal_steps FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_goals g WHERE g.id = goal_steps.goal_id AND g.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_goals g WHERE g.id = goal_steps.goal_id AND g.user_id = auth.uid()));
CREATE POLICY "Users can delete own goal steps" ON public.goal_steps FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_goals g WHERE g.id = goal_steps.goal_id AND g.user_id = auth.uid()));

CREATE TRIGGER trg_user_personality_updated_at
  BEFORE UPDATE ON public.user_personality FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_user_goals_updated_at
  BEFORE UPDATE ON public.user_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_goal_steps_updated_at
  BEFORE UPDATE ON public.goal_steps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Content goals_analyzed
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS goals_analyzed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS goals_analyzed_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_content_goals_unanalyzed
  ON public.content(user_id, goals_analyzed) WHERE ai_processed = true AND goals_analyzed = false;

-- 9. Goal consolidation
ALTER TABLE public.user_goals ADD COLUMN IF NOT EXISTS parent_goal_id UUID REFERENCES public.user_goals(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_user_goals_parent ON public.user_goals(parent_goal_id);

CREATE TABLE public.goal_merge_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggested_parent_title TEXT NOT NULL,
  suggested_parent_description TEXT NOT NULL DEFAULT '',
  suggested_parent_category TEXT NOT NULL DEFAULT '',
  child_goal_ids UUID[] NOT NULL,
  ai_reasoning TEXT NOT NULL DEFAULT '',
  new_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_goal_merge_suggestions_user_status ON public.goal_merge_suggestions(user_id, status);
ALTER TABLE public.goal_merge_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own merge suggestions" ON public.goal_merge_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own merge suggestions" ON public.goal_merge_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own merge suggestions" ON public.goal_merge_suggestions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own merge suggestions" ON public.goal_merge_suggestions FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_goal_merge_suggestions_updated_at
  BEFORE UPDATE ON public.goal_merge_suggestions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Profiles role
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));

-- 11. Backend migrations table
CREATE TABLE public._migrations (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO public._migrations (name) VALUES ('000_migration_tracking') ON CONFLICT (name) DO NOTHING;

-- 12. Pro waitlist
CREATE TABLE public.pro_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('pro', 'pro_plus')),
  discount_code TEXT,
  source TEXT DEFAULT 'landing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_pro_waitlist_created_at ON public.pro_waitlist(created_at DESC);
CREATE INDEX idx_pro_waitlist_tier ON public.pro_waitlist(tier);
ALTER TABLE public.pro_waitlist ENABLE ROW LEVEL SECURITY;
