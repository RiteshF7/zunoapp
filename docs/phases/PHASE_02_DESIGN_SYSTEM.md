# Phase 2 — Design System and Reusable Components

## Overview

Build all shared UI components that follow the Zuno UI Style Guide. Each component is a small, isolated, reusable unit with full dark mode support. These components will be assembled into screens in later phases.

## Prerequisites

- Phase 1 completed and verified
- NativeWind v4 working with custom design tokens
- Dark mode toggle functional

---

## Step 1: Install Additional Dependencies

```bash
# expo-blur for header backdrop blur effect
npx expo install expo-blur

# expo-font + Inter font for typography
npx expo install expo-font @expo-google-fonts/inter

# expo-linear-gradient for avatar gradient
npx expo install expo-linear-gradient
```

---

## Step 2: Load Inter Font in Root Layout

Update `app/_layout.tsx` to load the Inter font family:

```tsx
// app/_layout.tsx
import "../global.css";
import { useEffect } from "react";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useThemeStore } from "@/stores/themeStore";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const { isDark, initialize } = useThemeStore();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    initialize();
  }, []);

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-background-light items-center justify-center">
        <ActivityIndicator size="large" color="#4D96FF" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View
            className={`flex-1 ${isDark ? "dark" : ""}`}
            style={{ flex: 1 }}
          >
            <View className="flex-1 bg-background-light dark:bg-background-dark">
              <Slot />
              <StatusBar style={isDark ? "light" : "dark"} />
            </View>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
```

---

## Step 3: Build the `cn` Utility (already created in Phase 1)

Verify `lib/utils.ts` exists:

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Step 4: Build Components

### Component 1: `Avatar`

**File:** `components/common/Avatar.tsx`

```tsx
// components/common/Avatar.tsx
import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "@/lib/utils";

interface AvatarProps {
  letter?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { container: "w-8 h-8", text: "text-sm" },
  md: { container: "w-10 h-10", text: "text-lg" },
  lg: { container: "w-14 h-14", text: "text-xl" },
};

export function Avatar({ letter = "Z", size = "md", className }: AvatarProps) {
  const sizeStyles = sizeMap[size];

  return (
    <View className={cn("rounded-full overflow-hidden shadow-lg", sizeStyles.container, className)}>
      <LinearGradient
        colors={["#4D96FF", "#A855F7"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Text className={cn("text-white font-bold", sizeStyles.text)}>
          {letter}
        </Text>
      </LinearGradient>
    </View>
  );
}
```

---

### Component 2: `IconButton`

**File:** `components/common/IconButton.tsx`

```tsx
// components/common/IconButton.tsx
import React from "react";
import { Pressable, PressableProps } from "react-native";
import { cn } from "@/lib/utils";

interface IconButtonProps extends Omit<PressableProps, "className"> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "ghost";
}

export function IconButton({
  children,
  className,
  variant = "default",
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      className={cn(
        "p-2 rounded-full items-center justify-center active:scale-95",
        variant === "default" && "hover:bg-slate-200 dark:hover:bg-slate-800",
        variant === "ghost" && "opacity-80 active:opacity-60",
        className
      )}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.95 : 1 }],
        transitionDuration: "200ms",
      })}
      {...props}
    >
      {children}
    </Pressable>
  );
}
```

---

### Component 3: `Icon` (Material Icons Wrapper)

Since we cannot use web-based Material Icons in React Native, we use `lucide-react-native` as our icon system. Create a unified Icon component:

**File:** `components/common/Icon.tsx`

```tsx
// components/common/Icon.tsx
import React from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";
import {
  Search,
  Settings,
  Bell,
  Home,
  Plus,
  User,
  Heart,
  Bookmark,
  ExternalLink,
  Sun,
  Moon,
  Monitor,
  ChevronRight,
  ArrowLeft,
  X,
  Palette,
  FileText,
  Wrench,
  Lightbulb,
  GraduationCap,
  Gavel,
  Sparkles,
  Play,
  type LucideIcon,
} from "lucide-react-native";

const iconMap: Record<string, LucideIcon> = {
  search: Search,
  settings: Settings,
  notifications: Bell,
  home: Home,
  add: Plus,
  person: User,
  favorite: Heart,
  bookmark: Bookmark,
  open_in_new: ExternalLink,
  light_mode: Sun,
  dark_mode: Moon,
  monitor: Monitor,
  chevron_right: ChevronRight,
  arrow_back: ArrowLeft,
  close: X,
  palette: Palette,
  gavel: Gavel,
  description: FileText,
  handyman: Wrench,
  wb_sunny: Lightbulb,
  school: GraduationCap,
  auto_awesome: Sparkles,
  play_arrow: Play,
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export function Icon({ name, size = 24, color, className }: IconProps) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    // Fallback: render nothing for unknown icons
    return <View style={{ width: size, height: size }} />;
  }

  return (
    <View className={className}>
      <IconComponent size={size} color={color || "#64748b"} />
    </View>
  );
}

export { iconMap };
```

---

### Component 4: `Header`

**File:** `components/common/Header.tsx`

```tsx
// components/common/Header.tsx
import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { cn } from "@/lib/utils";
import { Avatar } from "./Avatar";
import { IconButton } from "./IconButton";
import { Icon } from "./Icon";
import { useThemeStore } from "@/stores/themeStore";

interface HeaderAction {
  icon: string;
  onPress: () => void;
  badge?: number;
}

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showAvatar?: boolean;
  actions?: HeaderAction[];
  className?: string;
}

export function Header({
  title = "Zuno",
  subtitle,
  showAvatar = true,
  actions = [],
  className,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeStore();

  return (
    <View
      className={cn(
        "px-6 py-4 flex-row items-center justify-between z-20",
        className
      )}
      style={{ paddingTop: insets.top + 16 }}
    >
      {/* Left side: Avatar + Title */}
      <View className="flex-row items-center gap-3">
        {showAvatar && <Avatar />}
        <View>
          {subtitle && (
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </Text>
          )}
          <Text className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </Text>
        </View>
      </View>

      {/* Right side: Action buttons */}
      <View className="flex-row gap-2">
        {actions.map((action, index) => (
          <IconButton key={index} onPress={action.onPress}>
            <Icon
              name={action.icon}
              size={22}
              color={isDark ? "#e2e8f0" : "#1e293b"}
            />
          </IconButton>
        ))}
      </View>
    </View>
  );
}
```

---

### Component 5: `FilterChips`

**File:** `components/common/FilterChips.tsx`

```tsx
// components/common/FilterChips.tsx
import React from "react";
import { ScrollView, Pressable, Text } from "react-native";
import { cn } from "@/lib/utils";
import { Filter } from "@/types/content";

interface FilterChipsProps {
  filters: Filter[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  className?: string;
}

export function FilterChips({
  filters,
  activeFilter,
  onFilterChange,
  className,
}: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={cn("px-6 py-2", className)}
      contentContainerStyle={{ gap: 8 }}
    >
      {filters.map((filter) => {
        const isActive = filter.id === activeFilter;
        return (
          <Pressable
            key={filter.id}
            onPress={() => onFilterChange(filter.id)}
            className={cn(
              "px-5 py-2.5 rounded-full",
              isActive
                ? "bg-slate-900 dark:bg-slate-200 shadow-md"
                : "bg-slate-200 dark:bg-card-dark"
            )}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <Text
              className={cn(
                "text-sm whitespace-nowrap",
                isActive
                  ? "text-white dark:text-slate-900 font-semibold"
                  : "text-slate-600 dark:text-slate-400 font-medium"
              )}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
```

---

### Component 6: `CollectionCard`

**File:** `components/home/CollectionCard.tsx`

```tsx
// components/home/CollectionCard.tsx
import React from "react";
import { Pressable, View, Text } from "react-native";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/common/Icon";
import { COLLECTION_THEMES, CollectionTheme } from "@/lib/constants";
import { useThemeStore } from "@/stores/themeStore";

interface CollectionCardProps {
  title: string;
  count: number;
  icon: string;
  theme: CollectionTheme;
  onPress?: () => void;
}

export function CollectionCard({
  title,
  count,
  icon,
  theme,
  onPress,
}: CollectionCardProps) {
  const themeColors = COLLECTION_THEMES[theme] || COLLECTION_THEMES.blue;
  const { isDark } = useThemeStore();

  // Map theme to actual colors for the icon
  const iconColorMap: Record<string, { light: string; dark: string }> = {
    blue: { light: "#2563eb", dark: "#60a5fa" },
    green: { light: "#16a34a", dark: "#4ade80" },
    purple: { light: "#9333ea", dark: "#c084fc" },
    amber: { light: "#d97706", dark: "#fbbf24" },
    rose: { light: "#e11d48", dark: "#fb7185" },
    indigo: { light: "#4f46e5", dark: "#818cf8" },
  };

  const colors = iconColorMap[theme] || iconColorMap.blue;

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "p-5 rounded-2xl flex-col justify-between h-48",
        themeColors.bgLight,
        themeColors.bgDark
      )}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      {/* Icon */}
      <View
        className={cn(
          "w-12 h-12 rounded-xl items-center justify-center mb-4",
          themeColors.iconBgLight,
          themeColors.iconBgDark
        )}
      >
        <Icon
          name={icon}
          size={24}
          color={isDark ? colors.dark : colors.light}
        />
      </View>

      {/* Content */}
      <View>
        <Text className="font-bold text-slate-800 dark:text-white text-lg leading-tight mb-1">
          {title}
        </Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400">
          {count} items
        </Text>
      </View>
    </Pressable>
  );
}
```

---

### Component 7: `CollectionsGrid`

**File:** `components/home/CollectionsGrid.tsx`

```tsx
// components/home/CollectionsGrid.tsx
import React from "react";
import { View, FlatList } from "react-native";
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
    <View className="px-6 flex-row flex-wrap gap-4">
      {collections.map((collection) => (
        <View key={collection.id} style={{ width: "47.5%" }}>
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

### Component 8: `PrimaryButton`

**File:** `components/common/PrimaryButton.tsx`

```tsx
// components/common/PrimaryButton.tsx
import React from "react";
import { Pressable, Text, View } from "react-native";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

interface PrimaryButtonProps {
  label: string;
  icon?: string;
  onPress?: () => void;
  className?: string;
  variant?: "default" | "outline";
}

export function PrimaryButton({
  label,
  icon,
  onPress,
  className,
  variant = "default",
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "w-full py-4 px-8 rounded-full flex-row items-center justify-center gap-2",
        variant === "default" &&
          "bg-white dark:bg-slate-100 shadow-lg",
        variant === "outline" &&
          "bg-transparent border-2 border-slate-300 dark:border-slate-600",
        className
      )}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.95 : 1 }],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
      })}
    >
      {icon && <Icon name={icon} size={24} color="#1e293b" />}
      <Text
        className={cn(
          "font-bold tracking-tight",
          variant === "default" && "text-slate-900",
          variant === "outline" && "text-slate-900 dark:text-slate-100"
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
```

---

### Component 9: `ThemeToggle`

**File:** `components/common/ThemeToggle.tsx`

```tsx
// components/common/ThemeToggle.tsx
import React from "react";
import { View, Pressable, Text } from "react-native";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { useThemeStore } from "@/stores/themeStore";

export function ThemeToggle() {
  const { mode, setMode, isDark } = useThemeStore();

  const options = [
    { key: "light" as const, icon: "light_mode", label: "Light" },
    { key: "dark" as const, icon: "dark_mode", label: "Dark" },
    { key: "system" as const, icon: "monitor", label: "System" },
  ];

  return (
    <View className="flex-row gap-2">
      {options.map((option) => {
        const isActive = mode === option.key;
        return (
          <Pressable
            key={option.key}
            onPress={() => setMode(option.key)}
            className={cn(
              "flex-row items-center gap-2 px-4 py-2.5 rounded-full",
              isActive
                ? "bg-slate-900 dark:bg-slate-200"
                : "bg-slate-100 dark:bg-slate-800"
            )}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <Icon
              name={option.icon}
              size={16}
              color={isActive ? (isDark ? "#1e293b" : "#ffffff") : (isDark ? "#94a3b8" : "#64748b")}
            />
            <Text
              className={cn(
                "text-xs font-medium",
                isActive
                  ? "text-white dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
```

---

### Component 10: `SettingsDropdown`

**File:** `components/common/SettingsDropdown.tsx`

```tsx
// components/common/SettingsDropdown.tsx
import React, { useState } from "react";
import { View, Pressable, Text, Modal } from "react-native";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { ThemeToggle } from "./ThemeToggle";
import { useThemeStore } from "@/stores/themeStore";

interface SettingsDropdownProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsDropdown({ visible, onClose }: SettingsDropdownProps) {
  const { isDark } = useThemeStore();

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable
        className="flex-1"
        onPress={onClose}
      >
        <View className="absolute right-4 top-24 w-64 bg-white dark:bg-card-dark rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-3 z-30">
          {/* Theme Section */}
          <View className="px-4 pb-3">
            <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Theme
            </Text>
            <ThemeToggle />
          </View>

          {/* Divider */}
          <View className="h-px bg-slate-200 dark:bg-slate-700 mx-4 my-1" />

          {/* Menu Items */}
          <Pressable
            className="w-full px-4 py-3 flex-row items-center gap-3 active:bg-slate-100 dark:active:bg-slate-700"
            style={({ pressed }) => ({
              backgroundColor: pressed
                ? isDark ? "#334155" : "#f1f5f9"
                : "transparent",
            })}
          >
            <Icon name="person" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
            <Text className="text-sm text-slate-700 dark:text-slate-300">
              Account
            </Text>
          </Pressable>

          <Pressable
            className="w-full px-4 py-3 flex-row items-center gap-3"
            style={({ pressed }) => ({
              backgroundColor: pressed
                ? isDark ? "#334155" : "#f1f5f9"
                : "transparent",
            })}
          >
            <Icon name="notifications" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
            <Text className="text-sm text-slate-700 dark:text-slate-300">
              Notifications
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
```

---

### Component 11: `FeedCard`

**File:** `components/feed/FeedCard.tsx`

```tsx
// components/feed/FeedCard.tsx
import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/common/Icon";
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
    <View className="bg-white dark:bg-card-dark rounded-2xl overflow-hidden mb-4 mx-6">
      {/* Thumbnail */}
      <Image
        source={{ uri: item.imageUrl }}
        className="w-full h-48"
        resizeMode="cover"
      />

      {/* Category Badge */}
      <View className="absolute top-3 left-3">
        <View className="bg-black/60 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-semibold">
            {item.category}
          </Text>
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
          <View className="flex-row items-center gap-1">
            <Icon
              name="favorite"
              size={16}
              color={isDark ? "#94a3b8" : "#94a3b8"}
            />
            <Text className="text-xs text-slate-400 dark:text-slate-500">
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
    </View>
  );
}
```

---

### Component 12: `FeedList`

**File:** `components/feed/FeedList.tsx`

```tsx
// components/feed/FeedList.tsx
import React from "react";
import { FlatList, View, Text, RefreshControl } from "react-native";
import { FeedCard } from "./FeedCard";
import { FeedItem } from "@/types/feed";

interface FeedListProps {
  items: FeedItem[];
  bookmarks: string[];
  onBookmarkToggle: (id: string) => void;
  onOpenSource: (url: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  ListHeaderComponent?: React.ReactElement;
}

export function FeedList({
  items,
  bookmarks,
  onBookmarkToggle,
  onOpenSource,
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
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FeedCard
          item={item}
          isBookmarked={bookmarks.includes(item.id)}
          onBookmarkToggle={onBookmarkToggle}
          onOpenSource={onOpenSource}
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
```

---

### Component 13: `SearchBar`

**File:** `components/common/SearchBar.tsx`

```tsx
// components/common/SearchBar.tsx
import React from "react";
import { View, TextInput, Pressable } from "react-native";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { useThemeStore } from "@/stores/themeStore";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onClear?: () => void;
  className?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search your content...",
  onSubmit,
  onClear,
  className,
}: SearchBarProps) {
  const { isDark } = useThemeStore();

  return (
    <View
      className={cn(
        "flex-row items-center bg-slate-100 dark:bg-card-dark rounded-full px-4 py-3 mx-6",
        className
      )}
    >
      <Icon
        name="search"
        size={20}
        color={isDark ? "#64748b" : "#94a3b8"}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        className="flex-1 ml-3 text-sm text-slate-900 dark:text-slate-100"
        style={{ fontFamily: "Inter_400Regular" }}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => {
            onChangeText("");
            onClear?.();
          }}
          className="p-1"
        >
          <Icon
            name="close"
            size={18}
            color={isDark ? "#94a3b8" : "#64748b"}
          />
        </Pressable>
      )}
    </View>
  );
}
```

---

### Component 14: `ReelCard`

**File:** `components/vfeed/ReelCard.tsx`

```tsx
// components/vfeed/ReelCard.tsx
import React from "react";
import { View, Text, Pressable, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/common/Icon";
import { FeedItem } from "@/types/feed";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ReelCardProps {
  item: FeedItem;
  onOpenSource: (url: string) => void;
}

export function ReelCard({ item, onOpenSource }: ReelCardProps) {
  return (
    <View
      className="relative overflow-hidden"
      style={{ height: SCREEN_HEIGHT }}
    >
      {/* Background Image */}
      <Image
        source={{ uri: item.imageUrl }}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
        locations={[0, 0.5, 1]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "60%",
        }}
      />

      {/* Category Badge */}
      <View className="absolute top-16 left-6">
        <View className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full">
          <Text className="text-white text-xs font-semibold">
            {item.category}
          </Text>
        </View>
      </View>

      {/* Content Overlay */}
      <View className="absolute bottom-32 left-6 right-20">
        <Text className="text-white text-2xl font-bold mb-2 leading-tight">
          {item.title}
        </Text>
        <Text className="text-white/70 text-sm" numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      {/* Action Buttons (right side) */}
      <View className="absolute bottom-36 right-4 gap-6 items-center">
        <Pressable
          className="items-center"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.9 : 1 }],
          })}
        >
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
            <Icon name="favorite" size={22} color="#ffffff" />
          </View>
          <Text className="text-white text-xs mt-1">
            {item.likes >= 1000 ? `${(item.likes / 1000).toFixed(1)}k` : item.likes}
          </Text>
        </Pressable>

        <Pressable
          className="items-center"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.9 : 1 }],
          })}
        >
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
            <Icon name="bookmark" size={22} color="#ffffff" />
          </View>
          <Text className="text-white text-xs mt-1">Save</Text>
        </Pressable>

        <Pressable
          onPress={() => onOpenSource(item.sourceUrl)}
          className="items-center"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.9 : 1 }],
          })}
        >
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
            <Icon name="open_in_new" size={22} color="#ffffff" />
          </View>
          <Text className="text-white text-xs mt-1">Open</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

---

## Step 5: Create a Component Preview Screen

Replace `app/index.tsx` with a preview that showcases all components:

```tsx
// app/index.tsx
import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Header } from "@/components/common/Header";
import { FilterChips } from "@/components/common/FilterChips";
import { CollectionCard } from "@/components/home/CollectionCard";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { SearchBar } from "@/components/common/SearchBar";
import { FeedCard } from "@/components/feed/FeedCard";
import contentData from "@/assets/data/content.json";
import feedData from "@/assets/data/feed.json";
import { FeedItem } from "@/types/feed";

export default function PreviewScreen() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Header
          title="Zuno"
          subtitle="Pick your"
          actions={[
            { icon: "search", onPress: () => {} },
            { icon: "settings", onPress: () => {} },
          ]}
        />

        {/* Theme Toggle */}
        <View className="px-6 mb-4">
          <ThemeToggle />
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          className="mb-4"
        />

        {/* Filter Chips */}
        <FilterChips
          filters={contentData.filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Collection Cards (2-col sample) */}
        <Text className="px-6 mt-4 mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Collections
        </Text>
        <View className="px-6 flex-row flex-wrap gap-4 mb-6">
          {contentData.collections.slice(0, 4).map((col) => (
            <View key={col.id} style={{ width: "47%" }}>
              <CollectionCard
                title={col.title}
                count={col.count}
                icon={col.icon}
                theme={col.theme as any}
                onPress={() => console.log("Pressed:", col.id)}
              />
            </View>
          ))}
        </View>

        {/* Feed Card Sample */}
        <Text className="px-6 mt-2 mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Feed Cards
        </Text>
        {feedData.items.slice(0, 2).map((item) => (
          <FeedCard
            key={item.id}
            item={item as FeedItem}
            isBookmarked={bookmarks.includes(item.id)}
            onBookmarkToggle={toggleBookmark}
            onOpenSource={(url) => console.log("Open:", url)}
          />
        ))}

        {/* Primary Button */}
        <View className="px-6 mt-4 mb-8">
          <PrimaryButton label="Add New" icon="add" />
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}
```

---

## Verification Checklist

After completing all steps, verify each of the following:

- [ ] **Inter font loads**: Text renders with Inter font family (no system font fallback)
- [ ] **Avatar renders**: Gradient avatar shows "Z" with blue-to-purple gradient
- [ ] **Header renders**: Shows avatar, title "Zuno", and action buttons
- [ ] **Filter chips work**: Tapping a chip changes the active state (dark filled vs light)
- [ ] **Collection cards render**: 4 cards show in 2-column layout with different color themes
- [ ] **Theme toggle works**: Light/Dark/System buttons toggle and UI updates everywhere
- [ ] **Search bar works**: Can type text, clear button appears, placeholder shows
- [ ] **Feed card renders**: Shows thumbnail image, title, category badge, likes, actions
- [ ] **Bookmark toggle works**: Tapping bookmark changes its color
- [ ] **Primary button renders**: Full-width white button with shadow and press animation
- [ ] **Dark mode works on ALL components**: Every component has correct dark mode colors
- [ ] **Press animations work**: Buttons and cards scale down on press (`active:scale-95`)
- [ ] **No TypeScript errors**: `npx tsc --noEmit` passes

---

## What's Next

Once this phase is verified, proceed to **Phase 3 — Navigation Shell and Splash Screen** (`PHASE_03_NAVIGATION.md`).
