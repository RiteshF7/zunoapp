// app/(tabs)/index.tsx
import React, { useState, useCallback, useMemo } from "react";
import { View, ScrollView, RefreshControl, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Header } from "@/components/common/Header";
import { FilterChips } from "@/components/common/FilterChips";
import { CollectionsGrid } from "@/components/home/CollectionsGrid";
import { CollectionSummary } from "@/components/home/CollectionSummary";
import { SettingsDropdown } from "@/components/common/SettingsDropdown";
import { useContentStore } from "@/stores/contentStore";
import { useCollections, useCategories } from "@/hooks/useCollections";
import { Collection } from "@/types/content";

export default function HomeScreen() {
  const router = useRouter();
  const { activeFilter, setActiveFilter } = useContentStore();
  const { data: supabaseCollections, isLoading, refetch } = useCollections();
  const { data: categories, refetch: refetchCategories } = useCategories();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Build dynamic filter chips from real AI categories
  const filters = useMemo(() => {
    const base = [{ id: "all", label: "All" }];
    if (categories && categories.length > 0) {
      for (const cat of categories) {
        base.push({ id: cat, label: cat });
      }
    }
    return base;
  }, [categories]);

  // Map Supabase data to Collection type
  const collections: Collection[] = (supabaseCollections || []).map((c) => ({
    id: c.id,
    title: c.title,
    count: c.item_count,
    icon: c.icon,
    theme: c.theme as any,
  }));

  // Filter collections based on active filter (category match)
  const filteredCollections = useCallback((): Collection[] => {
    if (activeFilter === "all") return collections;
    // Match collection title to the selected category
    return collections.filter(
      (c) => c.title.toLowerCase() === activeFilter.toLowerCase()
    );
  }, [activeFilter, collections]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchCategories()]);
    setTimeout(() => setRefreshing(false), 500);
  }, [refetch, refetchCategories]);

  const handleCollectionPress = (id: string) => {
    router.push(`/collection/${id}`);
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <Header
        title="Zuno"
        subtitle="Pick your"
        actions={[
          { icon: "search", onPress: () => router.push("/search") },
          { icon: "notifications", onPress: () => console.log("Notifications") },
          { icon: "settings", onPress: () => setSettingsVisible(true) },
        ]}
      />

      {/* Settings Dropdown */}
      <SettingsDropdown
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filter Chips — dynamic from AI categories */}
        <FilterChips
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Loading state */}
        {isLoading && collections.length === 0 ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#4D96FF" />
            <Text className="text-sm text-slate-400 dark:text-slate-500 mt-3">
              Loading collections...
            </Text>
          </View>
        ) : (
          <>
            {/* Collection Summary */}
            <CollectionSummary collections={filteredCollections()} />

            {/* Collections Grid */}
            <View className="mt-2 mb-6">
              <CollectionsGrid
                collections={filteredCollections()}
                onCollectionPress={handleCollectionPress}
              />
            </View>

            {/* Empty state when no collections */}
            {filteredCollections().length === 0 && (
              <View className="items-center justify-center py-16 px-6">
                <Text className="text-lg font-semibold text-slate-400 dark:text-slate-500 mb-2">
                  No collections yet
                </Text>
                <Text className="text-sm text-slate-400 dark:text-slate-600 text-center">
                  Save content and AI will automatically create collections for you.
                </Text>
              </View>
            )}
          </>
        )}

        {/* Bottom padding for floating tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
