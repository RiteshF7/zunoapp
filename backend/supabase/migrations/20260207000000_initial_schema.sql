-- =============================================================
-- Zuno App — Initial Database Schema Migration
-- =============================================================

-- Step 5: Enable pgvector for semantic search (Phase 11)
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================
-- Step 6a: Profiles Table
-- =============================================================

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
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

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================
-- Step 6b: Tags Table
-- =============================================================

-- Tags (AI-generated and user-created)
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_tags_slug ON public.tags(slug);
CREATE INDEX idx_tags_name ON public.tags(name);

-- =============================================================
-- Step 6c: Collections Table
-- =============================================================

-- Collections (smart and user-created)
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'folder',
  theme TEXT NOT NULL DEFAULT 'blue',
  is_smart BOOLEAN NOT NULL DEFAULT FALSE,
  smart_rules JSONB, -- AI rules for auto-populating (e.g., {"tags": ["recipe"], "categories": ["Cooking"]})
  item_count INTEGER NOT NULL DEFAULT 0,
  is_shared BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collections_user ON public.collections(user_id);

CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================
-- Step 6d: Content Table
-- =============================================================

-- Saved content items
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  platform TEXT NOT NULL DEFAULT 'other', -- youtube, instagram, twitter, etc.
  content_type TEXT NOT NULL DEFAULT 'post', -- video, reel, article, thread, post, image, podcast, audio
  ai_category TEXT, -- AI-assigned category (Cooking, Tech, Travel, etc.)
  ai_summary TEXT, -- AI-generated summary
  ai_processed BOOLEAN NOT NULL DEFAULT FALSE,
  embedding VECTOR(1536), -- OpenAI embedding for semantic search
  source_metadata JSONB, -- Additional metadata from the source
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_user ON public.content(user_id);
CREATE INDEX idx_content_platform ON public.content(platform);
CREATE INDEX idx_content_type ON public.content(content_type);
CREATE INDEX idx_content_category ON public.content(ai_category);
CREATE INDEX idx_content_created ON public.content(created_at DESC);

-- Full-text search index
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

-- =============================================================
-- Step 6e: Content-Tags Junction Table
-- =============================================================

-- Many-to-many: content <-> tags
CREATE TABLE public.content_tags (
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  is_ai_assigned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (content_id, tag_id)
);

CREATE INDEX idx_content_tags_content ON public.content_tags(content_id);
CREATE INDEX idx_content_tags_tag ON public.content_tags(tag_id);

-- =============================================================
-- Step 6f: Collection Items Junction Table
-- =============================================================

-- Many-to-many: collections <-> content
CREATE TABLE public.collection_items (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection_id, content_id)
);

CREATE INDEX idx_collection_items_collection ON public.collection_items(collection_id);
CREATE INDEX idx_collection_items_content ON public.collection_items(content_id);

-- =============================================================
-- Step 6g: Feed Items Table
-- =============================================================

-- Recommended/personalized feed items
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
  reason TEXT, -- "Why this?" explanation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feed_items_category ON public.feed_items(category);
CREATE INDEX idx_feed_items_type ON public.feed_items(content_type);

-- =============================================================
-- Step 6h: Bookmarks Table
-- =============================================================

-- User bookmarks on feed items
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feed_item_id UUID NOT NULL REFERENCES public.feed_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, feed_item_id)
);

CREATE INDEX idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX idx_bookmarks_feed ON public.bookmarks(feed_item_id);

-- =============================================================
-- Step 6i: User Interest Profile Table
-- =============================================================

-- Aggregated user interest profile (for personalized feed)
CREATE TABLE public.user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  categories JSONB NOT NULL DEFAULT '{}', -- {"Cooking": 12, "Tech": 8, "Travel": 5}
  tags JSONB NOT NULL DEFAULT '{}', -- {"recipe": 10, "startup": 6}
  platforms JSONB NOT NULL DEFAULT '{}', -- {"instagram": 15, "youtube": 10}
  content_types JSONB NOT NULL DEFAULT '{}', -- {"video": 20, "article": 8}
  total_saved INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_interests_user ON public.user_interests(user_id);

-- =============================================================
-- Step 7: Row Level Security (RLS)
-- =============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- TAGS: Anyone authenticated can read tags; users can create tags
CREATE POLICY "Authenticated users can read tags"
  ON public.tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tags"
  ON public.tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- COLLECTIONS: Users can CRUD their own collections
CREATE POLICY "Users can view own collections"
  ON public.collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create collections"
  ON public.collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
  ON public.collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
  ON public.collections FOR DELETE
  USING (auth.uid() = user_id);

-- CONTENT: Users can CRUD their own content
CREATE POLICY "Users can view own content"
  ON public.content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create content"
  ON public.content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content"
  ON public.content FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content"
  ON public.content FOR DELETE
  USING (auth.uid() = user_id);

-- CONTENT_TAGS: Users can manage tags on their own content
CREATE POLICY "Users can view tags on own content"
  ON public.content_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.content
      WHERE content.id = content_tags.content_id
      AND content.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add tags to own content"
  ON public.content_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.content
      WHERE content.id = content_tags.content_id
      AND content.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove tags from own content"
  ON public.content_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.content
      WHERE content.id = content_tags.content_id
      AND content.user_id = auth.uid()
    )
  );

-- COLLECTION_ITEMS: Users can manage items in their own collections
CREATE POLICY "Users can view items in own collections"
  ON public.collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE collections.id = collection_items.collection_id
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add items to own collections"
  ON public.collection_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE collections.id = collection_items.collection_id
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove items from own collections"
  ON public.collection_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE collections.id = collection_items.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- FEED_ITEMS: All authenticated users can read feed items
CREATE POLICY "Authenticated users can view feed items"
  ON public.feed_items FOR SELECT
  TO authenticated
  USING (true);

-- BOOKMARKS: Users can CRUD their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- USER_INTERESTS: Users can read/update their own interest profile
CREATE POLICY "Users can view own interests"
  ON public.user_interests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own interests"
  ON public.user_interests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own interests"
  ON public.user_interests FOR INSERT
  WITH CHECK (auth.uid() = user_id);
