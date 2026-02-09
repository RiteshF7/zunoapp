// app/(tabs)/index.tsx
import React, { useState, useCallback } from "react";
import { View, ScrollView, RefreshControl, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Header } from "@/components/common/Header";
import { FilterChips } from "@/components/common/FilterChips";
import { CollectionsGrid } from "@/components/home/CollectionsGrid";
import { CollectionSummary } from "@/components/home/CollectionSummary";
import { SettingsDropdown } from "@/components/common/SettingsDropdown";
import { useContentStore } from "@/stores/contentStore";
import { useCollections } from "@/hooks/useCollections";
import { Collection } from "@/types/content";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "recent", label: "Recent" },
  { id: "ideas", label: "Ideas" },
  { id: "research", label: "Research" },
  { id: "personal", label: "Personal" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { activeFilter, setActiveFilter } = useContentStore();
  const { data: supabaseCollections, isLoading, refetch } = useCollections();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Map Supabase data to Collection type
  const collections: Collection[] = (supabaseCollections || []).map((c) => ({
    id: c.id,
    title: c.title,
    count: c.item_count,
    icon: c.icon,
    theme: c.theme as any,
  }));

  // Filter collections based on active filter
  const filteredCollections = useCallback((): Collection[] => {
    if (activeFilter === "all") return collections;
    if (activeFilter === "recent") return collections.slice(0, 3);
    if (activeFilter === "ideas") {
      return collections.filter((c) =>
        c.title.toLowerCase().includes("creative") ||
        c.title.toLowerCase().includes("learning") ||
        c.title.toLowerCase().includes("idea")
      );
    }
    if (activeFilter === "research") {
      return collections.filter((c) =>
        c.title.toLowerCase().includes("document") ||
        c.title.toLowerCase().includes("learning") ||
        c.title.toLowerCase().includes("research")
      );
    }
    if (activeFilter === "personal") {
      return collections.filter((c) =>
        c.title.toLowerCase().includes("personal") ||
        c.title.toLowerCase().includes("home") ||
        c.title.toLowerCase().includes("daily")
      );
    }
    return collections;
  }, [activeFilter, collections]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  }, [refetch]);

  const handleCollectionPress = (id: string) => {
    console.log("Collection pressed:", id);
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
        {/* Filter Chips */}
        <FilterChips
          filters={FILTERS}
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
                  No collections found
                </Text>
                <Text className="text-sm text-slate-400 dark:text-slate-600 text-center">
                  Try a different filter or add new content to create collections.
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
