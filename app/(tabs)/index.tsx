// app/(tabs)/index.tsx
import React, { useState, useCallback } from "react";
import { View, ScrollView, RefreshControl, Text } from "react-native";
import { Header } from "@/components/common/Header";
import { FilterChips } from "@/components/common/FilterChips";
import { CollectionsGrid } from "@/components/home/CollectionsGrid";
import { CollectionSummary } from "@/components/home/CollectionSummary";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SettingsDropdown } from "@/components/common/SettingsDropdown";
import { useContentStore } from "@/stores/contentStore";
import contentData from "@/assets/data/content.json";
import { Collection } from "@/types/content";

export default function HomeScreen() {
  const { activeFilter, setActiveFilter } = useContentStore();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter collections based on active filter
  // For mock data, "all" shows everything; other filters show a subset
  const filteredCollections = useCallback((): Collection[] => {
    const allCollections = contentData.collections as Collection[];
    if (activeFilter === "all") return allCollections;
    if (activeFilter === "recent") return allCollections.slice(0, 3);
    if (activeFilter === "ideas") {
      return allCollections.filter((c) =>
        ["creative-projects", "learning-discovery"].includes(c.id)
      );
    }
    if (activeFilter === "research") {
      return allCollections.filter((c) =>
        ["important-documents", "learning-discovery"].includes(c.id)
      );
    }
    if (activeFilter === "personal") {
      return allCollections.filter((c) =>
        ["personal-notes", "home-diy", "daily-helpers"].includes(c.id)
      );
    }
    return allCollections;
  }, [activeFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate a refresh (in production, this would re-fetch from Supabase)
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

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
          onPress={() => console.log("Add new content")}
        />
      </View>
    </View>
  );
}
