// app/(tabs)/feed.tsx
import React, { useState, useCallback, useMemo } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Header } from "@/components/common/Header";
import { FilterChips } from "@/components/common/FilterChips";
import { ContentFeedList } from "@/components/feed/ContentFeedList";
import { SettingsDropdown } from "@/components/common/SettingsDropdown";
import { useContentFeed } from "@/hooks/useContentFeed";
import { CONTENT_FEED_FILTERS, ContentFeedFilter } from "@/types/feed";
import { Content } from "@/types/supabase";

export default function FeedScreen() {
  const router = useRouter();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Derive backend query params from the active filter chip
  const filterParams = useMemo(() => {
    if (activeFilter === "all") return {};
    const config = CONTENT_FEED_FILTERS.find(
      (f: ContentFeedFilter) => f.id === activeFilter
    );
    if (!config) return {};
    return {
      contentType: config.contentType,
      platform: config.platform,
    };
  }, [activeFilter]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useContentFeed(filterParams);

  // Flatten all pages into a single array
  const items: Content[] = useMemo(
    () => data?.pages.flatMap((page) => page) ?? [],
    [data]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleItemPress = useCallback(
    (id: string) => {
      router.push(`/content/${id}`);
    },
    [router]
  );

  // List header: filter chips + result count
  const ListHeader = useMemo(
    () => (
      <View>
        {/* Filter chips */}
        <FilterChips
          filters={CONTENT_FEED_FILTERS}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Results summary */}
        <View className="px-6 py-2">
          <Text className="text-xs text-slate-400 dark:text-slate-500">
            {items.length}
            {hasNextPage ? "+" : ""}{" "}
            {items.length === 1 ? "item" : "items"} saved
          </Text>
        </View>
      </View>
    ),
    [activeFilter, items.length, hasNextPage]
  );

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <Header
        title="Feed"
        subtitle="Your saves"
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

      {/* Content Feed — infinite scroll */}
      <ContentFeedList
        items={items}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={!!hasNextPage}
        onLoadMore={fetchNextPage}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListHeaderComponent={ListHeader}
        onItemPress={handleItemPress}
      />
    </View>
  );
}
