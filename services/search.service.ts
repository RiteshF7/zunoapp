// services/search.service.ts
import { api } from "@/lib/api";

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
    return api.get<SearchResult[]>(
      `/api/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  },

  // Hybrid search (full-text + semantic)
  async hybridSearch(query: string, limit = 20): Promise<SearchResult[]> {
    return api.get<SearchResult[]>(
      `/api/search/hybrid?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  },

  // Tag-based search
  async searchByTag(tagSlug: string, limit = 50): Promise<SearchResult[]> {
    return api.get<SearchResult[]>(
      `/api/search/tag/${encodeURIComponent(tagSlug)}?limit=${limit}`
    );
  },

  // Get popular tags for the current user
  async getPopularTags(limit = 20): Promise<{ name: string; slug: string; count: number }[]> {
    return api.get<{ name: string; slug: string; count: number }[]>(
      `/api/tags/popular?limit=${limit}`
    );
  },

  // Get recent searches (stored locally — no backend call needed)
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
