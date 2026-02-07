# Phase 7 — Supabase Backend Setup

## Overview

Set up the Supabase project, define the complete database schema with all tables and relationships, configure Row Level Security (RLS) policies, enable the `pgvector` extension for future semantic search, and connect the Expo app to the Supabase client.

## Prerequisites

- Phases 1–6 completed and verified (all UI screens working with mock data)
- A Supabase account (https://supabase.com — free tier is sufficient)
- Supabase CLI installed (optional, for local development)

---

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click **New Project**
3. Fill in:
   - **Name**: `zuno`
   - **Database Password**: (save this somewhere secure)
   - **Region**: Choose the closest to your users
4. Wait for the project to be provisioned (~2 minutes)
5. Once ready, go to **Settings > API** and note:
   - **Project URL**: `https://YOUR_PROJECT_REF.supabase.co`
   - **Anon/Public Key**: `eyJ...` (used client-side)
   - **Service Role Key**: `eyJ...` (NEVER expose this client-side)

---

## Step 2: Install Supabase Client in Expo

```bash
npm install @supabase/supabase-js

# For secure storage of auth tokens
npx expo install expo-secure-store
```

---

## Step 3: Configure Supabase Client

**File:** `lib/supabase.ts`

```typescript
// lib/supabase.ts
import "react-native-url-polyfill/dist/polyfill";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Custom storage adapter using SecureStore (mobile) or localStorage (web)
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

Also install the URL polyfill:

```bash
npm install react-native-url-polyfill
```

---

## Step 4: Create Environment Variables

**File:** `.env` (project root — add to `.gitignore`)

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

Add to `.gitignore`:

```
# Environment variables
.env
.env.local
.env.production
```

---

## Step 5: Enable pgvector Extension

Run this in the **Supabase SQL Editor** (Dashboard > SQL Editor > New Query):

```sql
-- Enable pgvector for semantic search (Phase 11)
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Step 6: Create Database Schema

Run the following SQL in the Supabase SQL Editor. Execute each block in order.

### 6a. Profiles Table

```sql
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
```

### 6b. Tags Table

```sql
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
```

### 6c. Collections Table

```sql
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
```

### 6d. Content Table

```sql
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
```

### 6e. Content-Tags Junction Table

```sql
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
```

### 6f. Collection Items Junction Table

```sql
-- Many-to-many: collections <-> content
CREATE TABLE public.collection_items (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection_id, content_id)
);

CREATE INDEX idx_collection_items_collection ON public.collection_items(collection_id);
CREATE INDEX idx_collection_items_content ON public.collection_items(content_id);
```

### 6g. Feed Items Table

```sql
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
```

### 6h. Bookmarks Table

```sql
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
```

### 6i. User Interest Profile Table

```sql
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
```

---

## Step 7: Configure Row Level Security (RLS)

```sql
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
```

---

## Step 8: Seed Data for Feed Items

Insert sample feed items so the Feed screen works with real data:

```sql
INSERT INTO public.feed_items (title, description, image_url, source_url, category, content_type, platform, likes, reason) VALUES
  ('10 Must-Know TypeScript Tips for 2025', 'Boost your TypeScript skills with these essential tips and best practices for modern development.', 'https://picsum.photos/seed/ts-tips/400/250', 'https://example.com/typescript-tips', 'Tutorial', 'video', 'youtube', 2340, 'Trending in Tech'),
  ('The Ultimate Guide to Meal Prep', 'Save time and eat healthy with this comprehensive meal prep guide covering 20 recipes.', 'https://picsum.photos/seed/meal-prep/400/250', 'https://example.com/meal-prep', 'Article', 'reel', 'instagram', 1567, 'Because you saved 5 cooking videos'),
  ('Minimalist Home Office Setup 2025', 'Transform your workspace with these minimalist design ideas and productivity hacks.', 'https://picsum.photos/seed/office/400/250', 'https://example.com/home-office', 'Resource', 'image', 'pinterest', 892, 'Similar to your saved design content'),
  ('React Native Performance Deep Dive', 'Learn advanced techniques to optimize your React Native app performance.', 'https://picsum.photos/seed/rn-perf/400/250', 'https://example.com/rn-performance', 'Tutorial', 'video', 'youtube', 3105, 'Trending in your interests'),
  ('5-Minute Morning Yoga Routine', 'Start your day right with this quick and effective morning yoga flow for all levels.', 'https://picsum.photos/seed/yoga/400/250', 'https://example.com/morning-yoga', 'Health', 'reel', 'instagram', 4521, 'Popular among users like you'),
  ('Building a Second Brain with AI', 'How to use AI tools to organize your knowledge and boost creativity.', 'https://picsum.photos/seed/second-brain/400/250', 'https://example.com/second-brain', 'Article', 'thread', 'twitter', 1890, 'Because you saved AI articles');
```

---

## Step 9: Save Migration Files Locally

Save the SQL as local migration files for version control:

**File:** `supabase/migrations/001_initial_schema.sql`

Copy all the SQL from Steps 5–8 into this file for reference.

**File:** `supabase/seed.sql`

Copy the seed data INSERT from Step 8 into this file.

---

## Step 10: Generate TypeScript Types

**File:** `types/supabase.ts`

```typescript
// types/supabase.ts
// These types match the Supabase database schema.
// In production, generate these with: npx supabase gen types typescript

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  is_ai_generated: boolean;
  created_by: string | null;
  usage_count: number;
  created_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  icon: string;
  theme: string;
  is_smart: boolean;
  smart_rules: Record<string, any> | null;
  item_count: number;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  platform: string;
  content_type: string;
  ai_category: string | null;
  ai_summary: string | null;
  ai_processed: boolean;
  source_metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface ContentTag {
  content_id: string;
  tag_id: string;
  is_ai_assigned: boolean;
  created_at: string;
}

export interface CollectionItem {
  collection_id: string;
  content_id: string;
  added_at: string;
}

export interface FeedItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  source_url: string;
  category: string | null;
  content_type: string;
  platform: string;
  likes: number;
  relevance_score: number | null;
  reason: string | null;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  feed_item_id: string;
  created_at: string;
}

export interface UserInterests {
  id: string;
  user_id: string;
  categories: Record<string, number>;
  tags: Record<string, number>;
  platforms: Record<string, number>;
  content_types: Record<string, number>;
  total_saved: number;
  last_updated: string;
}

// Database type map
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> };
      tags: { Row: Tag; Insert: Omit<Tag, "id" | "created_at" | "usage_count">; Update: Partial<Tag> };
      collections: { Row: Collection; Insert: Omit<Collection, "id" | "created_at" | "updated_at" | "item_count">; Update: Partial<Collection> };
      content: { Row: Content; Insert: Omit<Content, "id" | "created_at" | "updated_at">; Update: Partial<Content> };
      content_tags: { Row: ContentTag; Insert: Omit<ContentTag, "created_at">; Update: Partial<ContentTag> };
      collection_items: { Row: CollectionItem; Insert: Omit<CollectionItem, "added_at">; Update: Partial<CollectionItem> };
      feed_items: { Row: FeedItem; Insert: Omit<FeedItem, "id" | "created_at">; Update: Partial<FeedItem> };
      bookmarks: { Row: Bookmark; Insert: Omit<Bookmark, "id" | "created_at">; Update: Partial<Bookmark> };
      user_interests: { Row: UserInterests; Insert: Omit<UserInterests, "id" | "last_updated">; Update: Partial<UserInterests> };
    };
  };
}
```

---

## Verification Checklist

- [ ] **Supabase project created**: Dashboard accessible at supabase.com
- [ ] **pgvector enabled**: Run `SELECT * FROM pg_extension WHERE extname = 'vector';` — returns a row
- [ ] **All tables created**: Check Table Editor in Supabase dashboard — 9 tables visible
- [ ] **Profiles trigger works**: Creating a user in Auth creates a profile row
- [ ] **RLS enabled**: All tables show "RLS Enabled" badge in dashboard
- [ ] **Seed data inserted**: Feed items table has 6 rows
- [ ] **Full-text search index**: Run `SELECT fts FROM public.content LIMIT 1;` — column exists
- [ ] **Supabase client works**: Import `supabase` from `lib/supabase.ts` in the app — no errors
- [ ] **Environment variables set**: `.env` file has `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] **TypeScript types match**: `types/supabase.ts` matches all created tables
- [ ] **Migration file saved**: `supabase/migrations/001_initial_schema.sql` contains all SQL

### Quick Connection Test

Add this temporarily to any screen to verify the connection:

```tsx
import { supabase } from "@/lib/supabase";

// Inside a useEffect:
useEffect(() => {
  async function testConnection() {
    const { data, error } = await supabase.from("feed_items").select("count");
    console.log("Supabase test:", { data, error });
  }
  testConnection();
}, []);
```

If you see `{ data: [{count: 6}], error: null }`, the connection works.

---

## What's Next

Once this phase is verified, proceed to **Phase 8 — Authentication** (`PHASE_08_AUTH.md`).
