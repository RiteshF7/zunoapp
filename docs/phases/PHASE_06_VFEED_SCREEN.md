# Phase 6 — VFeed Screen (Reels-Style)

## Overview

Build the vertical, full-screen, swipeable reels-style feed. Each item takes up the full screen with an image/video background, gradient overlay, content info, and action buttons. Users swipe up/down to navigate between items. This screen uses `react-native-reanimated` for smooth gesture-driven animations.

## Prerequisites

- Phases 1–5 completed and verified
- ReelCard component built (Phase 2)
- Feed mock data available
- `react-native-reanimated` and `react-native-gesture-handler` installed

---

## Step 1: Install Additional Dependencies (if not already)

```bash
# These should already be installed from Phase 1, but verify:
npx expo install react-native-reanimated react-native-gesture-handler
```

Ensure `react-native-reanimated` is in the Babel config (should be from Phase 1):

```javascript
// babel.config.js — reanimated plugin should be last
plugins: ["react-native-reanimated/plugin"]
```

Update `babel.config.js` if needed:

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: ["react-native-reanimated/plugin"],
  };
};
```

---

## Step 2: Create the ReelViewer Component

This is the core component — a vertical paginated list where each item takes the full screen height.

**File:** `components/vfeed/ReelViewer.tsx`

```tsx
// components/vfeed/ReelViewer.tsx
import React, { useCallback, useRef, useState } from "react";
import {
  View,
  FlatList,
  Dimensions,
  ViewToken,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { ReelCard } from "./ReelCard";
import { FeedItem } from "@/types/feed";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ReelViewerProps {
  items: FeedItem[];
  onOpenSource: (url: string) => void;
}

export function ReelViewer({ items, onOpenSource }: ReelViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => (
      <ReelCard
        item={item}
        onOpenSource={onOpenSource}
        isActive={index === activeIndex}
      />
    ),
    [activeIndex, onOpenSource]
  );

  return (
    <View className="flex-1 bg-black">
      <FlatList
        ref={flatListRef}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        // Performance
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={3}
        initialNumToRender={2}
      />

      {/* Pagination Indicator */}
      <View className="absolute right-3 top-1/2 -translate-y-1/2 gap-1.5">
        {items.map((_, index) => (
          <View
            key={index}
            className={`w-1.5 rounded-full ${
              index === activeIndex
                ? "h-6 bg-white"
                : "h-1.5 bg-white/40"
            }`}
          />
        ))}
      </View>
    </View>
  );
}
```

---

## Step 3: Update the ReelCard Component

Update the ReelCard to accept an `isActive` prop and add more polish:

**File:** `components/vfeed/ReelCard.tsx` (update)

```tsx
// components/vfeed/ReelCard.tsx
import React from "react";
import { View, Text, Pressable, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "@/components/common/Icon";
import { PlatformBadge } from "@/components/feed/PlatformBadge";
import { FeedItem } from "@/types/feed";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface ReelCardProps {
  item: FeedItem;
  onOpenSource: (url: string) => void;
  isActive?: boolean;
}

export function ReelCard({ item, onOpenSource, isActive = true }: ReelCardProps) {
  const formatLikes = (likes: number): string => {
    if (likes >= 1000) {
      return `${(likes / 1000).toFixed(1)}k`;
    }
    return likes.toString();
  };

  return (
    <View
      className="relative bg-black"
      style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH }}
    >
      {/* Background Image */}
      <Image
        source={{ uri: item.imageUrl }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
        }}
        resizeMode="cover"
      />

      {/* Top Gradient */}
      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "transparent"]}
        locations={[0, 1]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 120,
        }}
      />

      {/* Bottom Gradient */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.85)"]}
        locations={[0, 0.4, 1]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: SCREEN_HEIGHT * 0.5,
        }}
      />

      {/* Top Info Bar */}
      <View className="absolute top-16 left-6 right-6 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <PlatformBadge platform={item.platform} />
          <View className="bg-white/20 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">
              {item.category}
            </Text>
          </View>
        </View>
      </View>

      {/* Content (bottom-left) */}
      <View className="absolute bottom-36 left-6 right-20">
        <Text className="text-white text-2xl font-bold mb-2 leading-tight">
          {item.title}
        </Text>
        <Text className="text-white/70 text-sm leading-relaxed" numberOfLines={3}>
          {item.description}
        </Text>
      </View>

      {/* Action Buttons (right side) */}
      <View className="absolute bottom-40 right-4 gap-5 items-center">
        {/* Like */}
        <Pressable
          className="items-center"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.85 : 1 }],
          })}
        >
          <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center backdrop-blur-sm">
            <Icon name="favorite" size={24} color="#ffffff" />
          </View>
          <Text className="text-white text-[10px] mt-1 font-medium">
            {formatLikes(item.likes)}
          </Text>
        </Pressable>

        {/* Bookmark */}
        <Pressable
          className="items-center"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.85 : 1 }],
          })}
        >
          <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center">
            <Icon name="bookmark" size={24} color="#ffffff" />
          </View>
          <Text className="text-white text-[10px] mt-1 font-medium">Save</Text>
        </Pressable>

        {/* Open Source */}
        <Pressable
          onPress={() => onOpenSource(item.sourceUrl)}
          className="items-center"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.85 : 1 }],
          })}
        >
          <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center">
            <Icon name="open_in_new" size={24} color="#ffffff" />
          </View>
          <Text className="text-white text-[10px] mt-1 font-medium">Open</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

---

## Step 4: Build the Complete VFeed Screen

**File:** `app/(tabs)/vfeed.tsx`

```tsx
// app/(tabs)/vfeed.tsx
import React, { useCallback, useMemo } from "react";
import { View, Text, Linking, StatusBar } from "react-native";
import { ReelViewer } from "@/components/vfeed/ReelViewer";
import feedData from "@/assets/data/feed.json";
import { FeedItem } from "@/types/feed";

export default function VFeedScreen() {
  // Use feed items that are video/reel type (best for reels view)
  // But also include all items for demo purposes
  const items = useMemo(() => {
    return feedData.items as FeedItem[];
  }, []);

  const handleOpenSource = useCallback((url: string) => {
    Linking.openURL(url).catch((err) =>
      console.warn("Failed to open URL:", err)
    );
  }, []);

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-background-dark items-center justify-center px-6">
        <Text className="text-lg font-semibold text-slate-400 mb-2">
          No content available
        </Text>
        <Text className="text-sm text-slate-500 text-center">
          Save some content to see it here in reels format.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ReelViewer items={items} onOpenSource={handleOpenSource} />
    </View>
  );
}
```

---

## Step 5: Update Tab Layout for VFeed

The VFeed tab should hide the tab bar for a more immersive experience. Update the tab layout:

**File:** `app/(tabs)/_layout.tsx` (update)

Add the following option to the VFeed screen:

```tsx
<Tabs.Screen
  name="vfeed"
  options={{
    title: "Reels",
    tabBarIcon: ({ color, size }) => (
      <Icon name="play_arrow" size={size} color={color} />
    ),
    // Optional: hide tab bar in VFeed for immersive experience
    // tabBarStyle: { display: "none" },
  }}
/>
```

---

## Step 6: Add VFeed Header Overlay

Add a transparent header overlay on the VFeed screen for navigation back and profile:

**File:** `components/vfeed/VFeedHeader.tsx`

```tsx
// components/vfeed/VFeedHeader.tsx
import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/common/Avatar";
import { IconButton } from "@/components/common/IconButton";
import { Icon } from "@/components/common/Icon";

interface VFeedHeaderProps {
  onNotificationPress?: () => void;
}

export function VFeedHeader({ onNotificationPress }: VFeedHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute top-0 left-0 right-0 z-10 px-6 flex-row items-center justify-between"
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="flex-row items-center gap-3">
        <Avatar size="sm" />
        <View>
          <Text className="text-white/60 text-xs">Pick your</Text>
          <Text className="text-white font-bold text-sm">future.</Text>
        </View>
      </View>

      <IconButton onPress={onNotificationPress}>
        <Icon name="notifications" size={22} color="#ffffff" />
      </IconButton>
    </View>
  );
}
```

Then update `app/(tabs)/vfeed.tsx` to include the header:

```tsx
// Add to app/(tabs)/vfeed.tsx, inside the return:
import { VFeedHeader } from "@/components/vfeed/VFeedHeader";

// Inside the View wrapper:
<View className="flex-1 bg-black">
  <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
  <ReelViewer items={items} onOpenSource={handleOpenSource} />
  <VFeedHeader onNotificationPress={() => console.log("Notifications")} />
</View>
```

---

## Verification Checklist

After completing all steps, verify each of the following:

- [ ] **VFeed tab loads**: Tapping the "Reels" tab shows the full-screen reel view
- [ ] **Full-screen cards**: Each reel takes up the entire screen height
- [ ] **Image backgrounds**: Images load and cover the full screen
- [ ] **Gradient overlays**: Top and bottom gradients render for readability
- [ ] **Content overlay**: Title and description visible at the bottom
- [ ] **Platform badge shows**: Small platform badge (YT, IG, etc.) in top-left
- [ ] **Category badge shows**: Category label visible in top area
- [ ] **Vertical swipe works**: Swiping up/down snaps to the next/previous item
- [ ] **Pagination dots**: Right-side dots indicate current position
- [ ] **Active dot is larger**: Current item's dot is taller than others
- [ ] **Action buttons work**: Like, Save, and Open buttons on the right side
- [ ] **Open source works**: Tapping Open attempts to open the URL
- [ ] **Press animations**: Action buttons scale down on press
- [ ] **VFeed header shows**: Avatar and notification bell overlay at the top
- [ ] **Performance is smooth**: No jank when swiping between reels
- [ ] **Status bar is light**: White status bar text on dark background
- [ ] **Empty state**: If no items, shows a friendly message

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Swiping doesn't snap | Ensure `pagingEnabled` is true and `snapToInterval` matches `SCREEN_HEIGHT` |
| Images don't cover full screen | Use `resizeMode="cover"` and set explicit width/height |
| Reanimated errors | Run `npx expo start --clear` and ensure reanimated plugin is in babel config |
| Tab bar overlaps content | Adjust bottom positioning of content or hide tab bar in VFeed |
| Pagination dots not aligned | Adjust `top-1/2 -translate-y-1/2` positioning |

---

## What's Next

Once this phase is verified, proceed to **Phase 7 — Supabase Backend Setup** (`PHASE_07_SUPABASE.md`).
