# Phase 4 — Home Screen (Zuno Collections)

## Overview

Build the complete Home screen — the main hub where users see their collections, filter content, toggle settings, and add new items. This screen is powered by mock JSON data and uses the components built in Phase 2.

## Prerequisites

- Phases 1–3 completed and verified
- All shared components built (Header, FilterChips, CollectionCard, CollectionsGrid, PrimaryButton, SettingsDropdown)
- Tab navigation working with Home tab active

---

## Step 1: Create the Bookmarks Store

We need a local store for managing bookmarks and filter state across the app.

**File:** `stores/contentStore.ts`

```typescript
// stores/contentStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ContentState {
  activeFilter: string;
  feedBookmarks: string[];
  setActiveFilter: (filter: string) => void;
  toggleBookmark: (itemId: string) => void;
  initializeBookmarks: () => Promise<void>;
}

const BOOKMARKS_KEY = "zuno_feed_bookmarks";

export const useContentStore = create<ContentState>((set, get) => ({
  activeFilter: "all",
  feedBookmarks: [],

  setActiveFilter: (filter: string) => {
    set({ activeFilter: filter });
  },

  toggleBookmark: async (itemId: string) => {
    const current = get().feedBookmarks;
    const updated = current.includes(itemId)
      ? current.filter((id) => id !== itemId)
      : [...current, itemId];

    set({ feedBookmarks: updated });

    try {
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save bookmarks:", e);
    }
  },

  initializeBookmarks: async () => {
    try {
      const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (stored) {
        set({ feedBookmarks: JSON.parse(stored) });
      }
    } catch (e) {
      console.warn("Failed to load bookmarks:", e);
    }
  },
}));
```

---

## Step 2: Build the Complete Home Screen

**File:** `app/(tabs)/index.tsx`

Replace the placeholder with the full implementation:

```tsx
// app/(tabs)/index.tsx
import React, { useState, useCallback } from "react";
import { View, ScrollView, RefreshControl, Pressable, Text } from "react-native";
import { Header } from "@/components/common/Header";
import { FilterChips } from "@/components/common/FilterChips";
import { CollectionsGrid } from "@/components/home/CollectionsGrid";
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
```

---

## Step 3: Enhanced CollectionsGrid with Animation

Update the `CollectionsGrid` to support entry animations when filter changes:

**File:** `components/home/CollectionsGrid.tsx` (update)

```tsx
// components/home/CollectionsGrid.tsx
import React from "react";
import { View } from "react-native";
import { CollectionCard } from "./CollectionCard";
import { Collection } from "@/types/content";

interface CollectionsGridProps {
  collections: Collection[];
  onCollectionPress?: (id: string) => void;
}

export function CollectionsGrid({
  collections,
  onCollectionPress,
}: CollectionsGridProps) {
  return (
    <View className="px-6 flex-row flex-wrap" style={{ gap: 16 }}>
      {collections.map((collection, index) => (
        <View
          key={collection.id}
          style={{
            width: "47.5%",
            // Stagger animation on mount
            opacity: 1,
          }}
        >
          <CollectionCard
            title={collection.title}
            count={collection.count}
            icon={collection.icon}
            theme={collection.theme}
            onPress={() => onCollectionPress?.(collection.id)}
          />
        </View>
      ))}
    </View>
  );
}
```

---

## Step 4: Add Collection Count Summary

Add a small summary bar showing total collections and items.

**File:** `components/home/CollectionSummary.tsx`

```tsx
// components/home/CollectionSummary.tsx
import React from "react";
import { View, Text } from "react-native";
import { Collection } from "@/types/content";

interface CollectionSummaryProps {
  collections: Collection[];
}

export function CollectionSummary({ collections }: CollectionSummaryProps) {
  const totalItems = collections.reduce((sum, c) => sum + c.count, 0);

  return (
    <View className="px-6 py-3 flex-row items-center justify-between">
      <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {collections.length} collections
      </Text>
      <Text className="text-sm text-slate-400 dark:text-slate-500">
        {totalItems} total items
      </Text>
    </View>
  );
}
```

Then add it to the Home screen between the filter chips and the grid:

```tsx
// In app/(tabs)/index.tsx, add after FilterChips:
import { CollectionSummary } from "@/components/home/CollectionSummary";

// Inside the ScrollView, after FilterChips:
<CollectionSummary collections={filteredCollections()} />
```

---

## Verification Checklist

After completing all steps, verify each of the following:

- [ ] **Header renders correctly**: Avatar, "Pick your" subtitle, "Zuno" title, 3 action buttons
- [ ] **Filter chips display**: All 5 filters shown in horizontal scroll (All, Recent, Ideas, Research, Personal)
- [ ] **"All" filter active by default**: First chip has dark filled style
- [ ] **Filter switching works**: Tapping a filter changes the active chip and filters the collections
- [ ] **Collections grid renders**: 6 cards in a 2-column grid with correct color themes
- [ ] **Each card has**: Icon, title, item count, correct background color
- [ ] **Card press animation**: Cards scale down on press
- [ ] **Settings dropdown opens**: Tapping settings icon shows the dropdown
- [ ] **Theme toggle in dropdown**: Can switch themes from the settings dropdown
- [ ] **"Add New" button visible**: Fixed at the bottom with shadow
- [ ] **Pull to refresh works**: Pulling down shows refresh indicator
- [ ] **Collection summary shows**: Total collections and items count displayed
- [ ] **Empty state**: Filtering to a category with no results shows empty message
- [ ] **Dark mode works**: All elements have correct dark mode colors
- [ ] **Scroll behavior**: Content scrolls smoothly with bottom padding for the fixed button

---

## What's Next

Once this phase is verified, proceed to **Phase 5 — Feed Screen** (`PHASE_05_FEED_SCREEN.md`).
