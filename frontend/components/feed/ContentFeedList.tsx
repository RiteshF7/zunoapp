// components/feed/ContentFeedList.tsx
import React, { useCallback, useMemo } from "react";
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Content } from "@/types/supabase";
import { ContentFeedCard } from "./ContentFeedCard";

interface ContentFeedListProps {
  /** Flat array of all loaded pages merged together */
  items: Content[];
  /** Whether the initial load is in progress */
  isLoading: boolean;
  /** Whether a subsequent page is being fetched */
  isFetchingNextPage: boolean;
  /** True when there are more pages to load */
  hasNextPage: boolean;
  /** Trigger loading the next page */
  onLoadMore: () => void;
  /** Pull-to-refresh handler */
  onRefresh: () => void;
  /** Whether pull-to-refresh is in progress */
  refreshing: boolean;
  /** Optional header component (filter chips, etc.) */
  ListHeaderComponent?: React.ReactElement;
  /** Navigate to content detail */
  onItemPress?: (id: string) => void;
}

export function ContentFeedList({
  items,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onRefresh,
  refreshing,
  ListHeaderComponent,
  onItemPress,
}: ContentFeedListProps) {
  const renderItem = useCallback(
    ({ item }: { item: Content }) => (
      <ContentFeedCard item={item} onPress={onItemPress} />
    ),
    [onItemPress]
  );

  const keyExtractor = useCallback(
    (item: Content, index: number) => item.id ?? `content-${index}`,
    []
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      onLoadMore();
    }
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  // Footer: loading spinner when fetching next page
  const ListFooter = useMemo(() => {
    if (isFetchingNextPage) {
      return (
        <View style={{ paddingVertical: 20, alignItems: "center" }}>
          <ActivityIndicator size="small" color="#4D96FF" />
        </View>
      );
    }
    if (!hasNextPage && items.length > 0) {
      return (
        <View style={{ paddingVertical: 20, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 12,
              color: "#94a3b8",
            }}
          >
            You're all caught up
          </Text>
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage, hasNextPage, items.length]);

  // Empty state
  const EmptyComponent = useMemo(() => {
    if (isLoading) {
      return (
        <View style={{ paddingVertical: 80, alignItems: "center" }}>
          <ActivityIndicator size="large" color="#4D96FF" />
          <Text
            style={{
              fontSize: 14,
              color: "#94a3b8",
              marginTop: 12,
            }}
          >
            Loading your content...
          </Text>
        </View>
      );
    }
    return (
      <View style={{ paddingVertical: 64, paddingHorizontal: 24, alignItems: "center" }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#94a3b8",
            marginBottom: 8,
          }}
        >
          No content yet
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#94a3b8",
            textAlign: "center",
          }}
        >
          Save content from any platform and it will show up here, sorted by
          most recent.
        </Text>
      </View>
    );
  }, [isLoading]);

  return (
    <FlatList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={EmptyComponent}
      ListFooterComponent={ListFooter}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={6}
      windowSize={7}
      initialNumToRender={5}
    />
  );
}
