// app/(tabs)/index.tsx
import React, { useState, useCallback } from "react";
import { View, ScrollView, RefreshControl, Text } from "react-native";
import { useRouter } from "expo-router";
import { Header } from "@/components/common/Header";
import { FilterChips } from "@/components/common/FilterChips";
import { CollectionsGrid } from "@/components/home/CollectionsGrid";
import { CollectionSummary } from "@/components/home/CollectionSummary";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SettingsDropdown } from "@/components/common/SettingsDropdown";
import { useContentStore } from "@/stores/contentStore";
import { useAuthStore } from "@/stores/authStore";
import { useCollections } from "@/hooks/useCollections";
import contentData from "@/assets/data/content.json";
import { Collection } from "@/types/content";

export default function HomeScreen() {
  const router = useRouter();
  const { activeFilter, setActiveFilter } = useContentStore();
  const { isAuthenticated } = useAuthStore();
  const { data: supabaseCollections, isLoading, refetch } = useCollections();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Use Supabase data if authenticated, otherwise fallback to mock data
  const collections: Collection[] =
    isAuthenticated && supabaseCollections
      ? supabaseCollections.map((c) => ({
          id: c.id,
          title: c.title,
          count: c.item_count,
          icon: c.icon,
          theme: c.theme as any,
        }))
      : (contentData.collections as Collection[]);

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
    if (isAuthenticated) {
      await refetch();
    }
    // Simulate a delay for visual feedback
    setTimeout(() => setRefreshing(false), 500);
  }, [isAuthenticated, refetch]);

  const handleCollectionPress = (id: string) => {
    // In future phases, this will navigate to the collection detail screen
    console.log("Collection pressed:", id);
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <Header
        title={contentData.app.name}
        subtitle={contentData.app.title}
        actions={[
          { icon: "search", onPress: () => console.log("Search") },
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
          filters={contentData.filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Collection Summary */}
        <CollectionSummary collections={filteredCollections()} />

        {/* Collections Grid */}
        <View className="mt-2 mb-6">
          <CollectionsGrid
            collections={filteredCollections()}
            onCollectionPress={handleCollectionPress}
          />
        </View>

        {/* Empty state when filter returns nothing */}
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

        {/* Bottom padding for fixed button */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="absolute bottom-24 left-0 right-0 px-6">
        <PrimaryButton
          label="Add New"
          icon="add"
          onPress={() => router.push("/add-content")}
        />
      </View>
    </View>
  );
}
