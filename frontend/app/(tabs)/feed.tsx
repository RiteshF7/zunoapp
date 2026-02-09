// app/(tabs)/feed.tsx
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, FlatList, RefreshControl, Linking, Text } from "react-native";
import { useRouter } from "expo-router";
import { Header } from "@/components/common/Header";
import { FilterChips } from "@/components/common/FilterChips";
import { SearchBar } from "@/components/common/SearchBar";
import { FeedCard } from "@/components/feed/FeedCard";
import { SettingsDropdown } from "@/components/common/SettingsDropdown";
import { useContentStore } from "@/stores/contentStore";
import feedData from "@/assets/data/feed.json";
import { FeedItem, FEED_FILTERS } from "@/types/feed";

export default function FeedScreen() {
  const router = useRouter();
  const { feedBookmarks, toggleBookmark, initializeBookmarks } = useContentStore();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeFeedFilter, setActiveFeedFilter] = useState("all");
  const [searchActive, setSearchActive] = useState(false);

  useEffect(() => {
    initializeBookmarks();
  }, []);

  // Filter feed items based on active filter and search text
  const filteredItems = useMemo((): FeedItem[] => {
    let items = feedData.items as FeedItem[];

    // Apply content type filter
    if (activeFeedFilter !== "all") {
      const filterConfig = FEED_FILTERS.find((f) => f.id === activeFeedFilter);
      if (filterConfig?.contentTypes) {
        items = items.filter((item) =>
          filterConfig.contentTypes!.includes(item.contentType)
        );
      }
    }

    // Apply search filter
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    return items;
  }, [activeFeedFilter, searchText]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleOpenSource = useCallback((url: string) => {
    Linking.openURL(url).catch((err) =>
      console.warn("Failed to open URL:", err)
    );
  }, []);

  const handleFeedItemPress = useCallback(
    (id: string) => {
      // Feed items are external — open their source URL
      const item = feedData.items.find((i) => i.id === id);
      if (item) handleOpenSource(item.sourceUrl);
    },
    [handleOpenSource]
  );

  const renderFeedItem = useCallback(
    ({ item }: { item: FeedItem }) => (
      <FeedCard
        item={item}
        isBookmarked={feedBookmarks.includes(item.id)}
        onBookmarkToggle={toggleBookmark}
        onPress={handleFeedItemPress}
      />
    ),
    [feedBookmarks, toggleBookmark, handleFeedItemPress]
  );

  const ListHeader = (
    <View>
      {/* Search Bar */}
      {searchActive && (
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search feed content..."
          onClear={() => setSearchText("")}
          className="mb-2"
        />
      )}

      {/* Feed Filters */}
      <FilterChips
        filters={FEED_FILTERS}
        activeFilter={activeFeedFilter}
        onFilterChange={setActiveFeedFilter}
      />

      {/* Results summary */}
      <View className="px-6 py-2">
        <Text className="text-xs text-slate-400 dark:text-slate-500">
          {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
          {searchText ? ` matching "${searchText}"` : ""}
        </Text>
      </View>
    </View>
  );

  const EmptyState = (
    <View className="items-center justify-center py-16 px-6">
      <Text className="text-lg font-semibold text-slate-400 dark:text-slate-500 mb-2">
        No content found
      </Text>
      <Text className="text-sm text-slate-400 dark:text-slate-600 text-center">
        {searchText
          ? "Try a different search term or filter."
          : "Your personalized feed will appear here once you start saving content."}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <Header
        title="Feed"
        subtitle="Discover"
        actions={[
          {
            icon: "search",
            onPress: () => router.push("/search"),
          },
          {
            icon: "settings",
            onPress: () => setSettingsVisible(true),
          },
        ]}
      />

      {/* Settings Dropdown */}
      <SettingsDropdown
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />

      {/* Feed List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={3}
      />
    </View>
  );
}
