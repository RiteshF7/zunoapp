// services/search.service.ts
import { supabase } from "@/lib/supabase";

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
      const updated = [query, ...recent.filter((q: string) => q !== query)].slice(0, 10);
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
