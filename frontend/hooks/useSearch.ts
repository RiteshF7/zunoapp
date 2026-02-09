// hooks/useSearch.ts
import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
