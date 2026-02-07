# Phase 1 — Project Setup and Foundation

## Overview

Initialize the Expo project, install and configure all core dependencies (NativeWind v4, react-native-reusables, Expo Router, Zustand, TanStack Query), establish the folder structure, and set up the theme system with light/dark mode toggle.

## Prerequisites

- Node.js >= 18 installed
- npm or yarn installed
- Expo CLI: `npm install -g expo-cli` (or use `npx expo`)
- Android Studio (for Android emulator) and/or Xcode (for iOS simulator)
- Git initialized in the project root

---

## Step 1: Create the Expo Project

Run from the parent directory of where you want the project (if starting fresh) or from the existing `zunoapp/` root:

```bash
npx create-expo-app@latest . --template blank-typescript
```

If the directory already has files (like `docs/`), you may need to init in a subfolder and move files, or use `--yes` to overwrite. Alternatively, if the project root already exists:

```bash
npx create-expo-app@latest zunoapp --template blank-typescript
```

Then move the `docs/` folder into the new project.

After creation, verify it runs:

```bash
cd zunoapp
npx expo start
```

Press `a` for Android or `i` for iOS to confirm the blank app loads.

---

## Step 2: Install Core Dependencies

Run all installs from the project root:

```bash
# NativeWind v4 (Tailwind CSS for React Native)
npx expo install nativewind tailwindcss react-native-reanimated react-native-safe-area-context

# Expo Router (file-based navigation)
npx expo install expo-router expo-linking expo-constants expo-status-bar

# Gesture handling (required for navigation + VFeed)
npx expo install react-native-gesture-handler

# Screens (required for navigation)
npx expo install react-native-screens

# Async Storage (for persisting theme, bookmarks, etc.)
npx expo install @react-native-async-storage/async-storage

# Zustand (client state management)
npm install zustand

# TanStack Query v5 (server state management)
npm install @tanstack/react-query

# react-native-reusables peer dependencies
npx expo install react-native-svg

# Class variance authority + clsx + tailwind-merge (for component variants)
npm install class-variance-authority clsx tailwind-merge

# Lucide icons (used by react-native-reusables)
npm install lucide-react-native
```

---

## Step 3: Configure NativeWind v4

### 3a. Create `tailwind.config.js`

Create this file in the project root:

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#E2E8F0",
        "background-light": "#F8FAFC",
        "background-dark": "#1A1C1E",
        "card-dark": "#2D2F31",
        "accent-blue": "#4D96FF",
      },
      fontFamily: {
        display: ["Inter"],
      },
      borderRadius: {
        DEFAULT: "20px",
        xl: "24px",
        "2xl": "32px",
      },
    },
  },
  plugins: [],
};
```

### 3b. Create `global.css`

Create the file at the project root:

```css
/* global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3c. Update `babel.config.js`

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

### 3d. Create `metro.config.js`

```javascript
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

### 3e. Create `nativewind-env.d.ts`

Create this file in the project root for TypeScript support:

```typescript
/// <reference types="nativewind/types" />
```

---

## Step 4: Configure Expo Router

### 4a. Update `package.json`

Add the `main` entry point for Expo Router:

```json
{
  "main": "expo-router/entry"
}
```

### 4b. Update `app.json`

Add the required Expo Router config:

```json
{
  "expo": {
    "name": "Zuno",
    "slug": "zunoapp",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#F8FAFC"
    },
    "scheme": "zunoapp",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.zuno.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#F8FAFC"
      },
      "package": "com.zuno.app"
    },
    "web": {
      "bundler": "metro",
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

---

## Step 5: Create Folder Structure

Create all the directories the project will use. Run from the project root:

```bash
# App screens (Expo Router)
mkdir -p app/(auth)
mkdir -p app/(tabs)

# Components
mkdir -p components/ui
mkdir -p components/common
mkdir -p components/home
mkdir -p components/feed
mkdir -p components/vfeed

# Library / utilities
mkdir -p lib/ai

# State management
mkdir -p stores

# Custom hooks
mkdir -p hooks

# Services (API layer)
mkdir -p services

# TypeScript types
mkdir -p types

# Assets (mock data)
mkdir -p assets/data
mkdir -p assets/fonts
mkdir -p assets/images

# Supabase (for later phases)
mkdir -p supabase/migrations
```

---

## Step 6: Create Utility Files

### 6a. `lib/constants.ts` — Design Tokens

```typescript
// lib/constants.ts

export const COLORS = {
  primary: "#E2E8F0",
  backgroundLight: "#F8FAFC",
  backgroundDark: "#1A1C1E",
  cardDark: "#2D2F31",
  accentBlue: "#4D96FF",
} as const;

export const COLLECTION_THEMES = {
  blue: {
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-[#2A303C]",
    iconBgLight: "bg-blue-100",
    iconBgDark: "dark:bg-blue-900/40",
    iconLight: "text-blue-600",
    iconDark: "dark:text-blue-400",
  },
  green: {
    bgLight: "bg-green-50",
    bgDark: "dark:bg-[#2A3430]",
    iconBgLight: "bg-green-100",
    iconBgDark: "dark:bg-green-900/40",
    iconLight: "text-green-600",
    iconDark: "dark:text-green-400",
  },
  purple: {
    bgLight: "bg-purple-50",
    bgDark: "dark:bg-[#342A38]",
    iconBgLight: "bg-purple-100",
    iconBgDark: "dark:bg-purple-900/40",
    iconLight: "text-purple-600",
    iconDark: "dark:text-purple-400",
  },
  amber: {
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-[#38332A]",
    iconBgLight: "bg-amber-100",
    iconBgDark: "dark:bg-amber-900/40",
    iconLight: "text-amber-600",
    iconDark: "dark:text-amber-400",
  },
  rose: {
    bgLight: "bg-rose-50",
    bgDark: "dark:bg-[#382A2A]",
    iconBgLight: "bg-rose-100",
    iconBgDark: "dark:bg-rose-900/40",
    iconLight: "text-rose-600",
    iconDark: "dark:text-rose-400",
  },
  indigo: {
    bgLight: "bg-indigo-50",
    bgDark: "dark:bg-[#2A2E38]",
    iconBgLight: "bg-indigo-100",
    iconBgDark: "dark:bg-indigo-900/40",
    iconLight: "text-indigo-600",
    iconDark: "dark:text-indigo-400",
  },
} as const;

export type CollectionTheme = keyof typeof COLLECTION_THEMES;

export const APP = {
  name: "Zuno",
  avatar: "Z",
  tagline: "Your unified content hub",
} as const;
```

### 6b. `lib/utils.ts` — Shared Utilities

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Step 7: Set Up Theme Store (Zustand)

### 7a. `stores/themeStore.ts`

```typescript
// stores/themeStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";

type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  initialize: () => Promise<void>;
}

const THEME_STORAGE_KEY = "zuno_theme";

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === "system") {
    return Appearance.getColorScheme() === "dark";
  }
  return mode === "dark";
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "system",
  isDark: Appearance.getColorScheme() === "dark",

  setMode: async (mode: ThemeMode) => {
    const isDark = resolveIsDark(mode);
    set({ mode, isDark });
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.warn("Failed to save theme preference:", e);
    }
  },

  initialize: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && (saved === "light" || saved === "dark" || saved === "system")) {
        const isDark = resolveIsDark(saved as ThemeMode);
        set({ mode: saved as ThemeMode, isDark });
      }
    } catch (e) {
      console.warn("Failed to load theme preference:", e);
    }
  },
}));
```

---

## Step 8: Create Root Layout with Theme Provider

### 8a. `app/_layout.tsx`

```tsx
// app/_layout.tsx
import "../global.css";
import { useEffect } from "react";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useThemeStore } from "@/stores/themeStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const { isDark, initialize } = useThemeStore();

  useEffect(() => {
    initialize();
  }, []);

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

### 8b. `app/index.tsx` — Temporary Test Screen

```tsx
// app/index.tsx
import { View, Text, Pressable } from "react-native";
import { useThemeStore } from "@/stores/themeStore";

export default function HomeScreen() {
  const { isDark, mode, setMode } = useThemeStore();

  const toggleTheme = () => {
    if (mode === "light") setMode("dark");
    else if (mode === "dark") setMode("system");
    else setMode("light");
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-6">
      <Text className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        Zuno
      </Text>
      <Text className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        Your unified content hub
      </Text>

      <View className="bg-blue-50 dark:bg-[#2A303C] p-5 rounded-2xl w-full mb-4">
        <Text className="font-bold text-slate-800 dark:text-white text-lg">
          NativeWind is working!
        </Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Theme: {mode} (isDark: {isDark ? "yes" : "no"})
        </Text>
      </View>

      <Pressable
        onPress={toggleTheme}
        className="bg-slate-900 dark:bg-slate-200 px-8 py-4 rounded-full active:scale-95"
        style={{ transitionDuration: "200ms" }}
      >
        <Text className="text-white dark:text-slate-900 font-bold">
          Toggle Theme ({mode})
        </Text>
      </Pressable>
    </View>
  );
}
```

---

## Step 9: Configure Path Aliases

### 9a. Update `tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts"
  ]
}
```

---

## Step 10: Create Mock Data Files

### 10a. `assets/data/content.json`

```json
{
  "app": {
    "name": "Zuno",
    "avatar": "Z",
    "title": "Pick your"
  },
  "filters": [
    { "id": "all", "label": "All" },
    { "id": "recent", "label": "Recent" },
    { "id": "ideas", "label": "Ideas" },
    { "id": "research", "label": "Research" },
    { "id": "personal", "label": "Personal" }
  ],
  "collections": [
    {
      "id": "important-documents",
      "title": "Important Documents",
      "count": 12,
      "icon": "gavel",
      "theme": "blue"
    },
    {
      "id": "daily-helpers",
      "title": "Daily Helpers",
      "count": 37,
      "icon": "wb_sunny",
      "theme": "green"
    },
    {
      "id": "creative-projects",
      "title": "Creative Projects",
      "count": 24,
      "icon": "palette",
      "theme": "purple"
    },
    {
      "id": "home-diy",
      "title": "Home & DIY",
      "count": 18,
      "icon": "handyman",
      "theme": "amber"
    },
    {
      "id": "personal-notes",
      "title": "Personal Notes",
      "count": 45,
      "icon": "favorite",
      "theme": "rose"
    },
    {
      "id": "learning-discovery",
      "title": "Learning & Discovery",
      "count": 31,
      "icon": "school",
      "theme": "indigo"
    }
  ]
}
```

### 10b. `assets/data/feed.json`

```json
{
  "items": [
    {
      "id": "feed-1",
      "title": "10 Must-Know TypeScript Tips for 2025",
      "description": "Boost your TypeScript skills with these essential tips and best practices for modern development.",
      "imageUrl": "https://picsum.photos/seed/ts-tips/400/250",
      "sourceUrl": "https://example.com/typescript-tips",
      "category": "Tutorial",
      "likes": 2340,
      "platform": "youtube",
      "contentType": "video"
    },
    {
      "id": "feed-2",
      "title": "The Ultimate Guide to Meal Prep",
      "description": "Save time and eat healthy with this comprehensive meal prep guide covering 20 recipes.",
      "imageUrl": "https://picsum.photos/seed/meal-prep/400/250",
      "sourceUrl": "https://example.com/meal-prep",
      "category": "Article",
      "likes": 1567,
      "platform": "instagram",
      "contentType": "reel"
    },
    {
      "id": "feed-3",
      "title": "Minimalist Home Office Setup 2025",
      "description": "Transform your workspace with these minimalist design ideas and productivity hacks.",
      "imageUrl": "https://picsum.photos/seed/office/400/250",
      "sourceUrl": "https://example.com/home-office",
      "category": "Resource",
      "likes": 892,
      "platform": "pinterest",
      "contentType": "image"
    },
    {
      "id": "feed-4",
      "title": "React Native Performance Deep Dive",
      "description": "Learn advanced techniques to optimize your React Native app performance.",
      "imageUrl": "https://picsum.photos/seed/rn-perf/400/250",
      "sourceUrl": "https://example.com/rn-performance",
      "category": "Tutorial",
      "likes": 3105,
      "platform": "youtube",
      "contentType": "video"
    },
    {
      "id": "feed-5",
      "title": "5-Minute Morning Yoga Routine",
      "description": "Start your day right with this quick and effective morning yoga flow for all levels.",
      "imageUrl": "https://picsum.photos/seed/yoga/400/250",
      "sourceUrl": "https://example.com/morning-yoga",
      "category": "Health",
      "likes": 4521,
      "platform": "instagram",
      "contentType": "reel"
    },
    {
      "id": "feed-6",
      "title": "Building a Second Brain with AI",
      "description": "How to use AI tools to organize your knowledge and boost creativity.",
      "imageUrl": "https://picsum.photos/seed/second-brain/400/250",
      "sourceUrl": "https://example.com/second-brain",
      "category": "Article",
      "likes": 1890,
      "platform": "twitter",
      "contentType": "thread"
    }
  ]
}
```

---

## Step 11: Create TypeScript Types

### 11a. `types/content.ts`

```typescript
// types/content.ts
import { CollectionTheme } from "@/lib/constants";

export interface Filter {
  id: string;
  label: string;
}

export interface Collection {
  id: string;
  title: string;
  count: number;
  icon: string;
  theme: CollectionTheme;
}

export interface AppContent {
  app: {
    name: string;
    avatar: string;
    title: string;
  };
  filters: Filter[];
  collections: Collection[];
}
```

### 11b. `types/feed.ts`

```typescript
// types/feed.ts

export type ContentType = "video" | "reel" | "article" | "thread" | "post" | "image" | "podcast" | "audio";

export type Platform = "youtube" | "instagram" | "twitter" | "facebook" | "linkedin" | "tiktok" | "reddit" | "pinterest" | "spotify" | "medium" | "other";

export interface FeedItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  sourceUrl: string;
  category: string;
  likes: number;
  platform: Platform;
  contentType: ContentType;
}

export interface FeedData {
  items: FeedItem[];
}
```

### 11c. `types/collection.ts`

```typescript
// types/collection.ts

export interface CollectionDetail {
  id: string;
  title: string;
  description?: string;
  count: number;
  icon: string;
  theme: string;
  isSmartCollection: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## Verification Checklist

After completing all steps, verify each of the following:

- [ ] **Project runs**: `npx expo start` launches without errors
- [ ] **App loads on device/emulator**: Press `a` (Android) or `i` (iOS) and the test screen appears
- [ ] **NativeWind works**: The blue card (`bg-blue-50`) renders with correct background color
- [ ] **Dark mode toggle**: Tapping the button cycles through light → dark → system, and the UI updates accordingly
- [ ] **Theme persists**: Close and reopen the app — the last selected theme is restored
- [ ] **Text styling works**: Title is bold and large, subtitle is small and gray
- [ ] **Path aliases work**: Imports like `@/stores/themeStore` resolve without errors
- [ ] **No TypeScript errors**: Run `npx tsc --noEmit` and confirm no errors
- [ ] **Folder structure exists**: All directories from Step 5 are created
- [ ] **Mock data loads**: Verify JSON files are valid by importing them in the test screen

### Quick Smoke Test

Add this temporarily to `app/index.tsx` to verify mock data loads:

```tsx
import contentData from "@/assets/data/content.json";
import feedData from "@/assets/data/feed.json";

// Inside the component:
console.log("Collections:", contentData.collections.length);
console.log("Feed items:", feedData.items.length);
```

If you see `Collections: 6` and `Feed items: 6` in the console, mock data is working.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| NativeWind styles not applying | Clear Metro cache: `npx expo start --clear` |
| Module not found `@/...` | Ensure `tsconfig.json` has the `paths` config and restart Metro |
| Dark mode not toggling visually | Ensure the root `View` in `_layout.tsx` applies the `dark` class |
| AsyncStorage error on web | AsyncStorage is mobile-only; for web testing, wrap in try-catch (already done) |

---

## What's Next

Once this phase is verified, proceed to **Phase 2 — Design System and Reusable Components** (`PHASE_02_DESIGN_SYSTEM.md`).
