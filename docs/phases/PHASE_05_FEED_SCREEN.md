# Phase 5 — Feed Screen

## Overview

Build the personalized discovery feed screen with feed cards showing thumbnails, titles, category badges, engagement stats, bookmark toggling, and source linking. This screen is powered by mock data from `assets/data/feed.json` and uses the FeedCard and FeedList components from Phase 2.

## Prerequisites

- Phases 1–4 completed and verified
- FeedCard and FeedList components built
- Content store with bookmarks implemented
- Tab navigation working with Feed tab

---

## Step 1: Create Feed Filter Types

Add content-type filters specific to the feed (different from the Home screen collection filters).

**File:** `types/feed.ts` (update — add feed filters)

Add the following to the existing `types/feed.ts`:

```typescript
// Add to types/feed.ts

export interface FeedFilter {
  id: string;
  label: string;
  contentTypes?: ContentType[];
}

export const FEED_FILTERS: FeedFilter[] = [
  { id: "all", label: "All" },
  { id: "videos", label: "Videos", contentTypes: ["video", "reel"] },
  { id: "articles", label: "Articles", contentTypes: ["article"] },
  { id: "posts", label: "Posts", contentTypes: ["post", "thread"] },
  { id: "images", label: "Images", contentTypes: ["image"] },
  { id: "audio", label: "Audio", contentTypes: ["podcast", "audio"] },
];
```

---

## Step 2: Create Feed-Specific Components

### 2a. Content Type Badge

**File:** `components/feed/ContentTypeBadge.tsx`

```tsx
// components/feed/ContentTypeBadge.tsx
import React from "react";
import { View, Text } from "react-native";
import { cn } from "@/lib/utils";
import { ContentType } from "@/types/feed";

interface ContentTypeBadgeProps {
  type: ContentType;
  className?: string;
}

const badgeConfig: Record<ContentType, { label: string; color: string; bgColor: string }> = {
  video: { label: "Video", color: "text-red-700 dark:text-red-300", bgColor: "bg-red-100 dark:bg-red-900/40" },
  reel: { label: "Reel", color: "text-pink-700 dark:text-pink-300", bgColor: "bg-pink-100 dark:bg-pink-900/40" },
  article: { label: "Article", color: "text-blue-700 dark:text-blue-300", bgColor: "bg-blue-100 dark:bg-blue-900/40" },
  thread: { label: "Thread", color: "text-purple-700 dark:text-purple-300", bgColor: "bg-purple-100 dark:bg-purple-900/40" },
  post: { label: "Post", color: "text-green-700 dark:text-green-300", bgColor: "bg-green-100 dark:bg-green-900/40" },
  image: { label: "Image", color: "text-amber-700 dark:text-amber-300", bgColor: "bg-amber-100 dark:bg-amber-900/40" },
  podcast: { label: "Podcast", color: "text-indigo-700 dark:text-indigo-300", bgColor: "bg-indigo-100 dark:bg-indigo-900/40" },
  audio: { label: "Audio", color: "text-teal-700 dark:text-teal-300", bgColor: "bg-teal-100 dark:bg-teal-900/40" },
};

export function ContentTypeBadge({ type, className }: ContentTypeBadgeProps) {
  const config = badgeConfig[type] || badgeConfig.post;

  return (
    <View className={cn("px-2.5 py-1 rounded-full", config.bgColor, className)}>
      <Text className={cn("text-xs font-semibold", config.color)}>
        {config.label}
      </Text>
    </View>
  );
}
```

### 2b. Platform Icon Badge

**File:** `components/feed/PlatformBadge.tsx`

```tsx
// components/feed/PlatformBadge.tsx
import React from "react";
import { View, Text } from "react-native";
import { cn } from "@/lib/utils";
import { Platform as PlatformType } from "@/types/feed";

interface PlatformBadgeProps {
  platform: PlatformType;
  className?: string;
}

const platformConfig: Record<PlatformType, { label: string; color: string }> = {
  youtube: { label: "YT", color: "bg-red-500" },
  instagram: { label: "IG", color: "bg-pink-500" },
  twitter: { label: "X", color: "bg-slate-800 dark:bg-slate-200" },
  facebook: { label: "FB", color: "bg-blue-600" },
  linkedin: { label: "LI", color: "bg-blue-700" },
  tiktok: { label: "TT", color: "bg-slate-900" },
  reddit: { label: "RD", color: "bg-orange-500" },
  pinterest: { label: "PI", color: "bg-red-600" },
  spotify: { label: "SP", color: "bg-green-500" },
  medium: { label: "MD", color: "bg-slate-700" },
  other: { label: "WB", color: "bg-slate-500" },
};

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const config = platformConfig[platform] || platformConfig.other;

  return (
    <View
      className={cn(
        "w-6 h-6 rounded-full items-center justify-center",
        config.color,
        className
      )}
    >
      <Text className="text-white text-[8px] font-bold">
        {config.label}
      </Text>
    </View>
  );
}
```

### 2c. Enhanced FeedCard with Platform and Content Type

**File:** `components/feed/FeedCard.tsx` (update)

Replace the FeedCard from Phase 2 with this enhanced version:

```tsx
// components/feed/FeedCard.tsx
import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/common/Icon";
import { ContentTypeBadge } from "./ContentTypeBadge";
import { PlatformBadge } from "./PlatformBadge";
import { FeedItem } from "@/types/feed";
import { useThemeStore } from "@/stores/themeStore";

interface FeedCardProps {
  item: FeedItem;
  isBookmarked: boolean;
  onBookmarkToggle: (id: string) => void;
  onOpenSource: (url: string) => void;
}

export function FeedCard({
  item,
  isBookmarked,
  onBookmarkToggle,
  onOpenSource,
}: FeedCardProps) {
  const { isDark } = useThemeStore();

  const formatLikes = (likes: number): string => {
    if (likes >= 1000) {
      return `${(likes / 1000).toFixed(1)}k`;
    }
    return likes.toString();
  };

  return (
    <Pressable
      className="bg-white dark:bg-card-dark rounded-2xl overflow-hidden mb-4 mx-6"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {/* Thumbnail */}
      <View className="relative">
        <Image
          source={{ uri: item.imageUrl }}
          className="w-full h-48"
          resizeMode="cover"
        />

        {/* Badges overlay */}
        <View className="absolute top-3 left-3 flex-row gap-2 items-center">
          <PlatformBadge platform={item.platform} />
          <ContentTypeBadge type={item.contentType} />
        </View>

        {/* Category badge */}
        <View className="absolute top-3 right-3">
          <View className="bg-black/50 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">
              {item.category}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        <Text className="font-bold text-slate-800 dark:text-white text-base leading-tight mb-1">
          {item.title}
        </Text>
        <Text
          className="text-sm text-slate-500 dark:text-slate-400 mb-3"
          numberOfLines={2}
        >
          {item.description}
        </Text>

        {/* Actions Row */}
        <View className="flex-row items-center justify-between">
          {/* Likes */}
          <View className="flex-row items-center gap-1.5">
            <Icon
              name="favorite"
              size={16}
              color={isDark ? "#94a3b8" : "#94a3b8"}
            />
            <Text className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {formatLikes(item.likes)}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => onOpenSource(item.sourceUrl)}
              className="flex-row items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-full"
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <Icon
                name="open_in_new"
                size={14}
                color={isDark ? "#94a3b8" : "#64748b"}
              />
              <Text className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Open
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onBookmarkToggle(item.id)}
              className={cn(
                "p-2 rounded-full",
                isBookmarked
                  ? "bg-accent-blue/20"
                  : "bg-slate-100 dark:bg-slate-800"
              )}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <Icon
                name="bookmark"
                size={16}
                color={isBookmarked ? "#4D96FF" : (isDark ? "#94a3b8" : "#64748b")}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
```

---

## Step 3: Build the Complete Feed Screen

**File:** `app/(tabs)/feed.tsx`

```tsx
// app/(tabs)/feed.tsx
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, FlatList, RefreshControl, Linking, Text } from "react-native";
import { Header } from "@/components/common/Header";
import { FilterChips } from "@/components/common/FilterChips";
import { SearchBar } from "@/components/common/SearchBar";
import { FeedCard } from "@/components/feed/FeedCard";
import { SettingsDropdown } from "@/components/common/SettingsDropdown";
import { useContentStore } from "@/stores/contentStore";
import feedData from "@/assets/data/feed.json";
import { FeedItem, FEED_FILTERS } from "@/types/feed";

export default function FeedScreen() {
  const { feedBookmarks, toggleBookmark, initializeBookmarks } = useContentStore();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeFeedFilter, setActiveFeedFilter] = useState("all");
  const [searchActive, setSearchActive] = useState(false);

  useEffect(() => {
    initializeBookmarks();
  }, []);

  // Filter feed items based on active filter and search text
  const filteredItems = useMemo((): FeedItem[] => {
    let items = feedData.items as FeedItem[];

    // Apply content type filter
    if (activeFeedFilter !== "all") {
      const filterConfig = FEED_FILTERS.find((f) => f.id === activeFeedFilter);
      if (filterConfig?.contentTypes) {
        items = items.filter((item) =>
          filterConfig.contentTypes!.includes(item.contentType)
        );
      }
    }

    // Apply search filter
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    return items;
  }, [activeFeedFilter, searchText]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleOpenSource = useCallback((url: string) => {
    Linking.openURL(url).catch((err) =>
      console.warn("Failed to open URL:", err)
    );
  }, []);

  const renderFeedItem = useCallback(
    ({ item }: { item: FeedItem }) => (
      <FeedCard
        item={item}
        isBookmarked={feedBookmarks.includes(item.id)}
        onBookmarkToggle={toggleBookmark}
        onOpenSource={handleOpenSource}
      />
    ),
    [feedBookmarks, toggleBookmark, handleOpenSource]
  );

  const ListHeader = (
    <View>
      {/* Search Bar */}
      {searchActive && (
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search feed content..."
          onClear={() => setSearchText("")}
          className="mb-2"
        />
      )}

      {/* Feed Filters */}
      <FilterChips
        filters={FEED_FILTERS}
        activeFilter={activeFeedFilter}
        onFilterChange={setActiveFeedFilter}
      />

      {/* Results summary */}
      <View className="px-6 py-2">
        <Text className="text-xs text-slate-400 dark:text-slate-500">
          {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
          {searchText ? ` matching "${searchText}"` : ""}
        </Text>
      </View>
    </View>
  );

  const EmptyState = (
    <View className="items-center justify-center py-16 px-6">
      <Text className="text-lg font-semibold text-slate-400 dark:text-slate-500 mb-2">
        No content found
      </Text>
      <Text className="text-sm text-slate-400 dark:text-slate-600 text-center">
        {searchText
          ? "Try a different search term or filter."
          : "Your personalized feed will appear here once you start saving content."}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <Header
        title="Feed"
        subtitle="Discover"
        actions={[
          {
            icon: "search",
            onPress: () => setSearchActive(!searchActive),
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

      {/* Feed List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={3}
      />
    </View>
  );
}
```

---

## Step 4: Add Loading Skeleton for Feed

**File:** `components/feed/FeedSkeleton.tsx`

```tsx
// components/feed/FeedSkeleton.tsx
import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

function SkeletonBox({ width, height, className }: { width: string | number; height: number; className?: string }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      className={`bg-slate-200 dark:bg-slate-700 rounded-xl ${className || ""}`}
      style={{ width, height, opacity }}
    />
  );
}

export function FeedSkeleton() {
  return (
    <View className="mx-6 mb-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <View
          key={index}
          className="bg-white dark:bg-card-dark rounded-2xl overflow-hidden mb-4"
        >
          {/* Image skeleton */}
          <SkeletonBox width="100%" height={192} className="rounded-none" />

          {/* Content skeleton */}
          <View className="p-4">
            <SkeletonBox width="80%" height={18} className="mb-2" />
            <SkeletonBox width="100%" height={14} className="mb-1" />
            <SkeletonBox width="60%" height={14} className="mb-3" />

            {/* Actions skeleton */}
            <View className="flex-row items-center justify-between">
              <SkeletonBox width={60} height={16} />
              <View className="flex-row gap-2">
                <SkeletonBox width={70} height={32} className="rounded-full" />
                <SkeletonBox width={32} height={32} className="rounded-full" />
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
```

---

## Verification Checklist

After completing all steps, verify each of the following:

- [ ] **Feed screen loads**: Tab navigation shows Feed screen with header
- [ ] **Feed cards display**: All 6 mock feed items render with thumbnails
- [ ] **Thumbnails load**: Images from picsum.photos render correctly
- [ ] **Platform badges show**: Each card shows the platform badge (YT, IG, X, etc.)
- [ ] **Content type badges show**: Each card shows Video, Reel, Article, etc.
- [ ] **Category badge shows**: Black overlay badge with category text
- [ ] **Likes display**: Heart icon with formatted like count
- [ ] **Filter chips work**: Tapping "Videos" shows only video/reel items
- [ ] **Search toggle works**: Tapping search icon shows/hides the search bar
- [ ] **Search filters work**: Typing in search bar filters items by title/description
- [ ] **Bookmark toggle works**: Tapping bookmark icon toggles blue highlight
- [ ] **Bookmarks persist**: Close and reopen the app — bookmarks are still set
- [ ] **Open source works**: Tapping "Open" attempts to open the URL
- [ ] **Pull to refresh works**: Pulling down shows refresh indicator
- [ ] **Empty state shows**: Filtering to show no results displays the empty message
- [ ] **Results count updates**: Summary text shows correct item count
- [ ] **Dark mode works**: All elements display correctly in dark mode
- [ ] **FlatList performance**: Scrolling is smooth with no jank

---

## What's Next

Once this phase is verified, proceed to **Phase 6 — VFeed Screen (Reels-Style)** (`PHASE_06_VFEED_SCREEN.md`).
