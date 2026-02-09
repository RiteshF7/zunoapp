// app/collection/[id].tsx
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/common/Icon";
import { IconButton } from "@/components/common/IconButton";
import { FeedCard } from "@/components/feed/FeedCard";
import { collectionsService } from "@/services/collections.service";
import { useThemeStore } from "@/stores/themeStore";
import { COLLECTION_THEMES, CollectionTheme } from "@/lib/constants";
import { FeedItem } from "@/types/feed";
import { Content } from "@/types/supabase";

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeStore();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch collection details
  const {
    data: collection,
    isLoading: collectionLoading,
  } = useQuery({
    queryKey: ["collections", id],
    queryFn: () => collectionsService.getCollection(id!),
    enabled: !!id,
  });

  // Fetch collection items (content)
  const {
    data: items,
    isLoading: itemsLoading,
    refetch,
  } = useQuery({
    queryKey: ["collection-items", id],
    queryFn: () => collectionsService.getCollectionItems(id!),
    enabled: !!id,
  });

  // Map Supabase content to FeedItem for FeedCard reuse
  const feedItems: FeedItem[] = useMemo(() => {
    if (!items) return [];
    return items
      .map((item: any) => {
        const content: Content | null = item.content;
        if (!content) return null;
        return {
          id: content.id,
          title: content.title || "Untitled",
          description: content.ai_summary || content.description || "",
          imageUrl: content.thumbnail_url || "",
          sourceUrl: content.url,
          category: content.ai_category || "",
          likes: 0,
          platform: (content.platform || "other") as any,
          contentType: (content.content_type || "post") as any,
        };
      })
      .filter(Boolean) as FeedItem[];
  }, [items]);

  const isLoading = collectionLoading || itemsLoading;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  }, [refetch]);

  const handleOpenSource = useCallback((url: string) => {
    Linking.openURL(url).catch((err) =>
      console.warn("Failed to open URL:", err)
    );
  }, []);

  const handleContentPress = useCallback(
    (contentId: string) => {
      router.push(`/content/${contentId}`);
    },
    [router]
  );

  // Get theme colors for the header accent and card bg
  const theme = (collection?.theme || "blue") as CollectionTheme;
  const themeColors = COLLECTION_THEMES[theme] || COLLECTION_THEMES.blue;
  const accentBg = isDark ? themeColors.iconBg.dark : themeColors.iconBg.light;
  const accentColor = isDark
    ? themeColors.iconColor.dark
    : themeColors.iconColor.light;
  const cardBgColor = isDark ? themeColors.cardBg.dark : themeColors.cardBg.light;

  const renderItem = useCallback(
    ({ item }: { item: FeedItem }) => (
      <FeedCard
        item={item}
        cardBg={cardBgColor}
        onPress={handleContentPress}
      />
    ),
    [handleContentPress, cardBgColor]
  );

  const ListHeader = (
    <View className="px-6 pb-4">
      {/* Collection icon + title */}
      <View className="flex-row items-center gap-3 mb-2">
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: accentBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name={collection?.icon || "folder"}
            size={22}
            color={accentColor}
          />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-900 dark:text-white">
            {collection?.title || "Collection"}
          </Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            {feedItems.length} {feedItems.length === 1 ? "item" : "items"}
          </Text>
        </View>
      </View>

      {collection?.description ? (
        <Text className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          {collection.description}
        </Text>
      ) : null}
    </View>
  );

  const EmptyState = (
    <View className="items-center justify-center py-16 px-6">
      <Text className="text-lg font-semibold text-slate-400 dark:text-slate-500 mb-2">
        No content yet
      </Text>
      <Text className="text-sm text-slate-400 dark:text-slate-600 text-center">
        Content saved to this category will appear here automatically.
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header bar */}
      <View
        style={{ paddingTop: insets.top }}
        className="px-4 pb-3 flex-row items-center justify-between bg-background-light/80 dark:bg-background-dark/80"
      >
        <IconButton onPress={() => router.back()}>
          <Icon
            name="arrow_back"
            size={22}
            color={isDark ? "#e2e8f0" : "#1e293b"}
          />
        </IconButton>
        <Text
          className="text-base font-semibold text-slate-900 dark:text-slate-100"
          numberOfLines={1}
        >
          {collection?.title || "Collection"}
        </Text>
        {/* Spacer to balance the back button */}
        <View style={{ width: 40 }} />
      </View>

      {/* Loading state */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4D96FF" />
          <Text className="text-sm text-slate-400 dark:text-slate-500 mt-3">
            Loading content...
          </Text>
        </View>
      ) : (
        <FlatList
          data={feedItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={3}
        />
      )}
    </View>
  );
}
