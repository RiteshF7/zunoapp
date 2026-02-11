// components/feed/FeedList.tsx
import React from "react";
import { FlatList, View, Text, RefreshControl } from "react-native";
import { FeedCard } from "./FeedCard";
import { FeedItem } from "@/types/feed";

interface FeedListProps {
  items: FeedItem[];
  favorites?: string[];
  onFavoriteToggle?: (id: string) => void;
  onItemPress?: (id: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  ListHeaderComponent?: React.ReactElement;
}

export function FeedList({
  items,
  favorites = [],
  onFavoriteToggle,
  onItemPress,
  onRefresh,
  refreshing = false,
  ListHeaderComponent,
}: FeedListProps) {
  if (items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-lg font-semibold text-slate-400 dark:text-slate-500 mb-2">
          No content yet
        </Text>
        <Text className="text-sm text-slate-400 dark:text-slate-600 text-center">
          Your personalized feed will appear here once you start saving content.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item, index) => item.id ?? `feed-${index}`}
      renderItem={({ item }) => (
        <FeedCard
          item={item}
          isFavorited={favorites.includes(item.id)}
          onFavoriteToggle={onFavoriteToggle}
          onPress={onItemPress}
        />
      )}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    />
  );
}
