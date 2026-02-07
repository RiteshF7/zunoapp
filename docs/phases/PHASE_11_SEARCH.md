# Phase 11 — Search

## Overview

Implement natural language search, tag-based search, and semantic search using pgvector. Build a dedicated search screen with a text input, search results list, tag suggestions, and recent searches. The search combines full-text search (Postgres `tsvector`) with semantic search (pgvector cosine similarity) using a hybrid scoring approach.

## Prerequisites

- Phase 10 completed (AI service layer working, embeddings being generated)
- pgvector extension enabled in Supabase
- Content items have embeddings (from AI processing)
- Full-text search index on content table (created in Phase 7)

---

## Step 1: Create Hybrid Search RPC Function

Run in Supabase SQL Editor:

```sql
-- Hybrid search: combines full-text search with semantic (vector) search
CREATE OR REPLACE FUNCTION hybrid_search(
  query_text TEXT,
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 20,
  full_text_weight FLOAT DEFAULT 1.0,
  semantic_weight FLOAT DEFAULT 1.0,
  rrf_k INT DEFAULT 60
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  url TEXT,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  platform TEXT,
  content_type TEXT,
  ai_category TEXT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ,
  -- Scoring
  full_text_rank FLOAT,
  semantic_rank FLOAT,
  combined_score FLOAT
)
LANGUAGE SQL
AS $$
WITH full_text AS (
  SELECT
    c.id,
    ROW_NUMBER() OVER (ORDER BY ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text)) DESC) AS rank
  FROM public.content c
  WHERE c.fts @@ websearch_to_tsquery('english', query_text)
  AND c.user_id = auth.uid()
  ORDER BY rank
  LIMIT match_count * 2
),
semantic AS (
  SELECT
    c.id,
    ROW_NUMBER() OVER (ORDER BY c.embedding <=> query_embedding) AS rank
  FROM public.content c
  WHERE c.embedding IS NOT NULL
  AND c.user_id = auth.uid()
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count * 2
)
SELECT
  c.id,
  c.user_id,
  c.url,
  c.title,
  c.description,
  c.thumbnail_url,
  c.platform,
  c.content_type,
  c.ai_category,
  c.ai_summary,
  c.created_at,
  COALESCE(1.0 / (rrf_k + ft.rank), 0.0)::FLOAT AS full_text_rank,
  COALESCE(1.0 / (rrf_k + s.rank), 0.0)::FLOAT AS semantic_rank,
  (
    COALESCE(1.0 / (rrf_k + ft.rank), 0.0) * full_text_weight +
    COALESCE(1.0 / (rrf_k + s.rank), 0.0) * semantic_weight
  )::FLOAT AS combined_score
FROM public.content c
LEFT JOIN full_text ft ON c.id = ft.id
LEFT JOIN semantic s ON c.id = s.id
WHERE c.user_id = auth.uid()
AND (ft.id IS NOT NULL OR s.id IS NOT NULL)
ORDER BY combined_score DESC
LIMIT match_count;
$$;

-- Simple full-text search (no embeddings needed)
CREATE OR REPLACE FUNCTION search_content(
  query_text TEXT,
  match_count INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  url TEXT,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  platform TEXT,
  content_type TEXT,
  ai_category TEXT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ,
  rank FLOAT
)
LANGUAGE SQL
AS $$
SELECT
  c.id,
  c.url,
  c.title,
  c.description,
  c.thumbnail_url,
  c.platform,
  c.content_type,
  c.ai_category,
  c.ai_summary,
  c.created_at,
  ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text))::FLOAT AS rank
FROM public.content c
WHERE c.fts @@ websearch_to_tsquery('english', query_text)
AND c.user_id = auth.uid()
ORDER BY rank DESC
LIMIT match_count;
$$;

-- Tag-based search
CREATE OR REPLACE FUNCTION search_by_tag(
  tag_slug TEXT,
  match_count INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  url TEXT,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  platform TEXT,
  content_type TEXT,
  ai_category TEXT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL
AS $$
SELECT
  c.id,
  c.url,
  c.title,
  c.description,
  c.thumbnail_url,
  c.platform,
  c.content_type,
  c.ai_category,
  c.ai_summary,
  c.created_at
FROM public.content c
INNER JOIN public.content_tags ct ON c.id = ct.content_id
INNER JOIN public.tags t ON ct.tag_id = t.id
WHERE t.slug = tag_slug
AND c.user_id = auth.uid()
ORDER BY c.created_at DESC
LIMIT match_count;
$$;
```

---

## Step 2: Create the Search Service

**File:** `services/search.service.ts`

```typescript
// services/search.service.ts
import { supabase } from "@/lib/supabase";
import { Content } from "@/types/supabase";

export interface SearchResult {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  platform: string;
  content_type: string;
  ai_category: string | null;
  ai_summary: string | null;
  created_at: string;
  rank?: number;
  combined_score?: number;
}

export const searchService = {
  // Full-text search (simple, no embeddings)
  async searchContent(query: string, limit = 20): Promise<SearchResult[]> {
    const { data, error } = await supabase.rpc("search_content", {
      query_text: query,
      match_count: limit,
    });

    if (error) throw error;
    return data || [];
  },

  // Hybrid search (full-text + semantic)
  async hybridSearch(query: string, limit = 20): Promise<SearchResult[]> {
    // First, generate an embedding for the query
    const embedding = await generateQueryEmbedding(query);

    if (!embedding) {
      // Fallback to full-text search if embedding generation fails
      return searchService.searchContent(query, limit);
    }

    const { data, error } = await supabase.rpc("hybrid_search", {
      query_text: query,
      query_embedding: embedding,
      match_count: limit,
    });

    if (error) throw error;
    return data || [];
  },

  // Tag-based search
  async searchByTag(tagSlug: string, limit = 50): Promise<SearchResult[]> {
    const { data, error } = await supabase.rpc("search_by_tag", {
      tag_slug: tagSlug,
      match_count: limit,
    });

    if (error) throw error;
    return data || [];
  },

  // Get popular tags for the current user
  async getPopularTags(limit = 20): Promise<{ name: string; slug: string; count: number }[]> {
    const { data, error } = await supabase
      .from("tags")
      .select("name, slug, usage_count")
      .order("usage_count", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((t) => ({
      name: t.name,
      slug: t.slug,
      count: t.usage_count,
    }));
  },

  // Get recent searches (stored locally)
  async getRecentSearches(): Promise<string[]> {
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      const stored = await AsyncStorage.getItem("zuno_recent_searches");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Save a search to recents
  async saveRecentSearch(query: string): Promise<void> {
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      const recent = await searchService.getRecentSearches();
      const updated = [query, ...recent.filter((q) => q !== query)].slice(0, 10);
      await AsyncStorage.setItem("zuno_recent_searches", JSON.stringify(updated));
    } catch {
      // Silently fail
    }
  },

  // Clear recent searches
  async clearRecentSearches(): Promise<void> {
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.removeItem("zuno_recent_searches");
    } catch {
      // Silently fail
    }
  },
};

// Generate embedding for a search query
async function generateQueryEmbedding(query: string): Promise<number[] | null> {
  try {
    const { data, error } = await supabase.functions.invoke("generate-embedding", {
      body: { text: query },
    });

    if (error) throw error;
    return data?.embedding || null;
  } catch {
    return null;
  }
}
```

---

## Step 3: Create Embedding Generation Edge Function

**File:** `supabase/functions/generate-embedding/index.ts`

```typescript
// supabase/functions/generate-embedding/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY")!;

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });

    const data = await response.json();
    const embedding = data.data[0].embedding;

    return new Response(
      JSON.stringify({ embedding }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

Deploy it:

```bash
supabase functions deploy generate-embedding --no-verify-jwt
```

---

## Step 4: Create the Search Hook

**File:** `hooks/useSearch.ts`

```typescript
// hooks/useSearch.ts
import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { searchService, SearchResult } from "@/services/search.service";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    searchService.getRecentSearches().then(setRecentSearches);
  }, []);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Try hybrid search first, fallback to full-text
      const data = await searchService.hybridSearch(searchQuery);
      setResults(data);

      // Save to recent searches
      await searchService.saveRecentSearch(searchQuery);
      const updated = await searchService.getRecentSearches();
      setRecentSearches(updated);
    } catch (error) {
      console.error("Search error:", error);
      // Fallback to simple search
      try {
        const data = await searchService.searchContent(searchQuery);
        setResults(data);
      } catch {
        setResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  const searchByTag = useCallback(async (tagSlug: string) => {
    setIsSearching(true);
    try {
      const data = await searchService.searchByTag(tagSlug);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  const clearRecentSearches = useCallback(async () => {
    await searchService.clearRecentSearches();
    setRecentSearches([]);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    recentSearches,
    search,
    searchByTag,
    clearSearch,
    clearRecentSearches,
  };
}

export function usePopularTags() {
  return useQuery({
    queryKey: ["popular-tags"],
    queryFn: () => searchService.getPopularTags(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
```

---

## Step 5: Build the Search Screen

**File:** `app/search.tsx`

```tsx
// app/search.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchBar } from "@/components/common/SearchBar";
import { IconButton } from "@/components/common/IconButton";
import { Icon } from "@/components/common/Icon";
import { ContentTypeBadge } from "@/components/feed/ContentTypeBadge";
import { PlatformBadge } from "@/components/feed/PlatformBadge";
import { useSearch, usePopularTags } from "@/hooks/useSearch";
import { useThemeStore } from "@/stores/themeStore";
import { SearchResult } from "@/services/search.service";

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeStore();
  const {
    query,
    setQuery,
    results,
    isSearching,
    recentSearches,
    search,
    searchByTag,
    clearSearch,
    clearRecentSearches,
  } = useSearch();
  const { data: popularTags } = usePopularTags();

  const handleSearch = () => {
    if (query.trim()) {
      search(query.trim());
    }
  };

  const handleTagPress = (slug: string) => {
    searchByTag(slug);
    setQuery(`#${slug}`);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <Pressable
      className="flex-row bg-white dark:bg-card-dark rounded-2xl p-3 mb-3 mx-6 gap-3"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {/* Thumbnail */}
      {item.thumbnail_url ? (
        <Image
          source={{ uri: item.thumbnail_url }}
          className="w-20 h-20 rounded-xl"
          resizeMode="cover"
        />
      ) : (
        <View className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center">
          <Icon name="description" size={24} color={isDark ? "#475569" : "#94a3b8"} />
        </View>
      )}

      {/* Content */}
      <View className="flex-1 justify-center">
        <View className="flex-row items-center gap-2 mb-1">
          <PlatformBadge platform={item.platform as any} />
          {item.content_type && (
            <ContentTypeBadge type={item.content_type as any} />
          )}
        </View>
        <Text
          className="font-semibold text-slate-800 dark:text-white text-sm leading-tight"
          numberOfLines={2}
        >
          {item.title || "Untitled"}
        </Text>
        {item.ai_summary && (
          <Text
            className="text-xs text-slate-500 dark:text-slate-400 mt-1"
            numberOfLines={1}
          >
            {item.ai_summary}
          </Text>
        )}
        {item.ai_category && (
          <Text className="text-[10px] text-accent-blue font-medium mt-1">
            {item.ai_category}
          </Text>
        )}
      </View>
    </Pressable>
  );

  const EmptyState = (
    <View className="px-6 mt-4">
      {/* Recent Searches */}
      {recentSearches.length > 0 && !query && (
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Recent Searches
            </Text>
            <Pressable onPress={clearRecentSearches}>
              <Text className="text-xs text-accent-blue font-medium">Clear</Text>
            </Pressable>
          </View>
          {recentSearches.map((term, i) => (
            <Pressable
              key={i}
              onPress={() => {
                setQuery(term);
                search(term);
              }}
              className="flex-row items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-800"
            >
              <Icon name="search" size={16} color={isDark ? "#475569" : "#94a3b8"} />
              <Text className="text-sm text-slate-700 dark:text-slate-300">{term}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Popular Tags */}
      {popularTags && popularTags.length > 0 && !query && (
        <View>
          <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Popular Tags
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Pressable
                key={tag.slug}
                onPress={() => handleTagPress(tag.slug)}
                className="bg-slate-100 dark:bg-card-dark px-4 py-2 rounded-full"
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                <Text className="text-sm text-slate-600 dark:text-slate-400">
                  #{tag.name}
                  <Text className="text-xs text-slate-400 dark:text-slate-500">
                    {" "}({tag.count})
                  </Text>
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* No results */}
      {query && results.length === 0 && !isSearching && (
        <View className="items-center py-16">
          <Icon name="search" size={48} color={isDark ? "#334155" : "#cbd5e1"} />
          <Text className="text-lg font-semibold text-slate-400 dark:text-slate-500 mt-4">
            No results found
          </Text>
          <Text className="text-sm text-slate-400 dark:text-slate-600 text-center mt-1">
            Try different keywords or search by tags
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View
      className="flex-1 bg-background-light dark:bg-background-dark"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3">
        <IconButton onPress={() => router.back()}>
          <Icon
            name="arrow_back"
            size={24}
            color={isDark ? "#e2e8f0" : "#1e293b"}
          />
        </IconButton>
        <View className="flex-1">
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search your content..."
            onSubmit={handleSearch}
            onClear={clearSearch}
            className="mx-0"
          />
        </View>
      </View>

      {/* Loading */}
      {isSearching && (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#4D96FF" />
          <Text className="text-xs text-slate-400 mt-2">Searching...</Text>
        </View>
      )}

      {/* Results */}
      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderSearchResult}
          ListHeaderComponent={
            <Text className="px-6 py-2 text-xs text-slate-400 dark:text-slate-500">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        EmptyState
      )}
    </View>
  );
}
```

Register the search screen in root layout:

```tsx
// In app/_layout.tsx:
<Stack.Screen
  name="search"
  options={{
    presentation: "modal",
    animation: "slide_from_bottom",
  }}
/>
```

---

## Step 6: Wire Up Search Navigation

Update the search button in the Home and Feed headers to navigate to the search screen:

```tsx
// In app/(tabs)/index.tsx and app/(tabs)/feed.tsx:
import { useRouter } from "expo-router";

const router = useRouter();

// Update the search action:
{ icon: "search", onPress: () => router.push("/search") }
```

---

## Verification Checklist

- [ ] **Search screen opens**: Tapping search icon from any screen opens the search modal
- [ ] **Search bar works**: Can type queries and submit
- [ ] **Full-text search works**: Searching for known content titles returns results
- [ ] **Semantic search works**: Searching with natural language phrases returns relevant results
- [ ] **Tag search works**: Tapping a tag shows all content with that tag
- [ ] **Search results display**: Each result shows thumbnail, title, summary, platform, and category
- [ ] **Recent searches show**: Previously searched terms appear when search is empty
- [ ] **Recent searches clickable**: Tapping a recent search re-executes it
- [ ] **Clear recent searches**: "Clear" button removes all recent searches
- [ ] **Popular tags display**: Tags with highest usage appear
- [ ] **No results state**: Shows friendly message when no results found
- [ ] **Loading indicator**: Shows spinner while searching
- [ ] **Hybrid scoring**: Results from semantic search are ranked alongside full-text results
- [ ] **Edge Function works**: `generate-embedding` produces embeddings for queries
- [ ] **Dark mode works**: All search UI elements display correctly in dark mode

---

## What's Next

Once this phase is verified, proceed to **Phase 12 — Personalized Feed Engine and Polish** (`PHASE_12_FEED_ENGINE_POLISH.md`).
