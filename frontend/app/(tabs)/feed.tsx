// app/(tabs)/feed.tsx
import React, { useState, useCallback, useMemo } from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Header } from "@/components/common/Header";
import { FilterChips } from "@/components/common/FilterChips";
import { ContentFeedList } from "@/components/feed/ContentFeedList";
import { SettingsDropdown } from "@/components/common/SettingsDropdown";
import { useContentFeed } from "@/hooks/useContentFeed";
import { useSuggestedFeed } from "@/hooks/useSuggestedFeed";
import { useUserPreferencesStore } from "@/stores/userPreferencesStore";
import { CONTENT_FEED_FILTERS, ContentFeedFilter } from "@/types/feed";
import { Content, SuggestedContent } from "@/types/supabase";

export default function FeedScreen() {
  const router = useRouter();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // ── Feed type toggle (per-user preference) ─────────────────────────
  const { feedType, setFeedType } = useUserPreferencesStore();
  const isSuggested = feedType === "suggestedcontent";

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

  // ── Saved content feed ─────────────────────────────────────────────
  const savedFeed = useContentFeed(
    !isSuggested ? filterParams : undefined
  );

  // ── Suggested content feed ─────────────────────────────────────────
  const suggestedFeed = useSuggestedFeed({
    ...filterParams,
    enabled: isSuggested,
  });

  // Pick the active feed
  const activeFeed = isSuggested ? suggestedFeed : savedFeed;
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = activeFeed;

  // Flatten pages — both Content[] and SuggestedContent[] share the
  // same shape so ContentFeedList can render either.
  const items: Content[] = useMemo(
    () =>
      (data?.pages.flatMap((page) => page) ?? []) as Content[],
    [data]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleItemPress = useCallback(
    (id: string) => {
      if (isSuggested) {
        // For suggested content, open the source URL in-app browser
        const item = items.find((i) => i.id === id);
        if (item?.url) {
          Linking.openURL(item.url);
        }
      } else {
        router.push(`/content/${id}`);
      }
    },
    [router, isSuggested, items]
  );

  // ── Feed-type toggle pills ────────────────────────────────────────
  const FeedToggle = useMemo(
    () => (
      <View className="flex-row items-center gap-2 px-6 pt-2 pb-1">
        <Pressable
          onPress={() => setFeedType("usersaved")}
          className={`px-4 py-1.5 rounded-full ${
            !isSuggested
              ? "bg-slate-900 dark:bg-white"
              : "bg-slate-200 dark:bg-slate-800"
          }`}
          style={{ transform: [{ scale: 1 }] }}
        >
          <Text
            className={`text-xs font-semibold ${
              !isSuggested
                ? "text-white dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Your Saves
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFeedType("suggestedcontent")}
          className={`px-4 py-1.5 rounded-full ${
            isSuggested
              ? "bg-slate-900 dark:bg-white"
              : "bg-slate-200 dark:bg-slate-800"
          }`}
          style={{ transform: [{ scale: 1 }] }}
        >
          <Text
            className={`text-xs font-semibold ${
              isSuggested
                ? "text-white dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            For You
          </Text>
        </Pressable>
      </View>
    ),
    [isSuggested, setFeedType]
  );

  // List header: toggle + filter chips + result count
  const ListHeader = useMemo(
    () => (
      <View>
        {/* Feed-type toggle */}
        {FeedToggle}

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
            {isSuggested
              ? items.length === 1
                ? "suggestion"
                : "suggestions"
              : items.length === 1
              ? "item saved"
              : "items saved"}
          </Text>
        </View>
      </View>
    ),
    [activeFilter, items.length, hasNextPage, FeedToggle, isSuggested]
  );

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <Header
        title="Feed"
        subtitle={isSuggested ? "For you" : "Your saves"}
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
