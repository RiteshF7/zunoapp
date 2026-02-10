// app/search.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchBar } from "@/components/common/SearchBar";
import { IconButton } from "@/components/common/IconButton";
import { Icon } from "@/components/common/Icon";
import { ContentTypeBadge } from "@/components/feed/ContentTypeBadge";
import { PlatformBadge } from "@/components/feed/PlatformBadge";
import { useSearch, usePopularTags } from "@/hooks/useSearch";
import { useThemeStore } from "@/stores/themeStore";
import { SearchResult } from "@/services/search.service";
import { ContentType, Platform as PlatformType } from "@/types/feed";

export default function SearchScreen() {
  const router = useRouter();
  const { tag } = useLocalSearchParams<{ tag?: string }>();
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

  // If opened with a tag query param, trigger search by tag on mount
  useEffect(() => {
    if (tag) {
      setQuery(`#${tag}`);
      searchByTag(tag);
    }
  }, [tag]);

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
      onPress={() => router.push(`/content/${item.id}`)}
    >
      {/* Thumbnail */}
      {item.thumbnail_url ? (
        <Image
          source={{ uri: item.thumbnail_url }}
          style={{ width: 80, height: 80, borderRadius: 12 }}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
      ) : (
        <View className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center">
          <Icon name="description" size={24} color={isDark ? "#475569" : "#94a3b8"} />
        </View>
      )}

      {/* Content */}
      <View className="flex-1 justify-center">
        <View className="flex-row items-center gap-2 mb-1">
          <PlatformBadge platform={item.platform as PlatformType} />
          {item.content_type && (
            <ContentTypeBadge type={item.content_type as ContentType} />
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
