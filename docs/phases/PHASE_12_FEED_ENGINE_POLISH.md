# Phase 12 — Personalized Feed Engine and Polish

## Overview

Build the recommendation engine for the personalized feed, add "Why This?" explainability labels to feed cards, and polish the entire app for production readiness. This phase covers error handling, loading skeletons, offline support, app branding, EAS build configuration, and performance optimization.

## Prerequisites

- Phase 11 completed (search working with hybrid scoring)
- User interest profiles being updated (from Phase 10 AI layer)
- All screens functioning with real data

---

## Step 1: Build the Feed Recommendation Engine

### 1a. Create the `generate-feed` Edge Function

```bash
supabase functions new generate-feed
```

**File:** `supabase/functions/generate-feed/index.ts`

```typescript
// supabase/functions/generate-feed/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client for reading user data (respects RLS)
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service client for writing feed items
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get the current user
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user interest profile
    const { data: interests } = await serviceClient
      .from("user_interests")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!interests || interests.total_saved === 0) {
      // No interests yet — return trending/default feed
      return new Response(
        JSON.stringify({
          items: [],
          message: "Save more content to get personalized recommendations!",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the interest profile
    const topCategories = getTopN(interests.categories, 5);
    const topTags = getTopN(interests.tags, 10);
    const topPlatforms = getTopN(interests.platforms, 3);

    // Generate personalized feed using AI
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    let feedItems: any[] = [];

    if (apiKey) {
      // Use AI to generate feed recommendations
      feedItems = await generateAIFeed(apiKey, topCategories, topTags, topPlatforms, interests);
    } else {
      // Fallback: generate feed based on category matching
      feedItems = generateRuleFeed(topCategories, topTags, topPlatforms, interests);
    }

    // Upsert feed items
    for (const item of feedItems) {
      await serviceClient
        .from("feed_items")
        .upsert(item, { onConflict: "source_url" })
        .select();
    }

    // Return the feed
    const { data: feed } = await serviceClient
      .from("feed_items")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    return new Response(
      JSON.stringify({ items: feed || [], interests: topCategories }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Generate feed error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getTopN(obj: Record<string, number>, n: number): [string, number][] {
  return Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n);
}

async function generateAIFeed(
  apiKey: string,
  topCategories: [string, number][],
  topTags: [string, number][],
  topPlatforms: [string, number][],
  interests: any
): Promise<any[]> {
  const prompt = `Based on a user's content interests, generate 10 feed recommendations.

User Profile:
- Top categories: ${topCategories.map(([c, n]) => `${c} (${n} saved)`).join(", ")}
- Top tags: ${topTags.map(([t, n]) => `${t} (${n})`).join(", ")}
- Preferred platforms: ${topPlatforms.map(([p]) => p).join(", ")}
- Total saved: ${interests.total_saved}

Generate a JSON array of 10 content recommendations. Each item should have:
- "title": An engaging title
- "description": 1-2 sentence description
- "source_url": A plausible URL (use example.com)
- "category": Category that matches user interests
- "content_type": One of: video, reel, article, thread, post, image, podcast
- "platform": One of: youtube, instagram, twitter, facebook, linkedin, tiktok, reddit, pinterest, spotify
- "likes": Random number between 500-10000
- "reason": A "Why this?" explanation referencing the user's interests (e.g., "Because you saved 12 cooking videos")

Make recommendations diverse but strongly related to the user's interests.
Return ONLY a valid JSON array.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You generate content feed recommendations as JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    }),
  });

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  const items = Array.isArray(content) ? content : content.items || content.recommendations || [];

  return items.map((item: any) => ({
    title: item.title,
    description: item.description,
    image_url: `https://picsum.photos/seed/${encodeURIComponent(item.title.slice(0, 10))}/400/250`,
    source_url: item.source_url,
    category: item.category,
    content_type: item.content_type || "article",
    platform: item.platform || "other",
    likes: item.likes || Math.floor(Math.random() * 5000) + 500,
    relevance_score: Math.random() * 0.5 + 0.5,
    reason: item.reason,
  }));
}

function generateRuleFeed(
  topCategories: [string, number][],
  topTags: [string, number][],
  topPlatforms: [string, number][],
  interests: any
): any[] {
  // Simple rule-based fallback
  const items: any[] = [];

  for (const [category, count] of topCategories) {
    items.push({
      title: `Top ${category} Content This Week`,
      description: `Discover trending ${category.toLowerCase()} content picked for you.`,
      image_url: `https://picsum.photos/seed/${category}/400/250`,
      source_url: `https://example.com/${category.toLowerCase()}`,
      category,
      content_type: "article",
      platform: topPlatforms[0]?.[0] || "other",
      likes: Math.floor(Math.random() * 5000) + 500,
      relevance_score: 0.8,
      reason: `Because you saved ${count} ${category.toLowerCase()} items`,
    });
  }

  return items;
}
```

Deploy:

```bash
supabase functions deploy generate-feed
```

---

## Step 2: Add "Why This?" Labels to Feed Cards

Update `FeedCard` to show the "Why this?" reason:

**File:** `components/feed/FeedCard.tsx` — Add a `reason` prop:

```tsx
// Add to the FeedCard interface:
interface FeedCardProps {
  item: FeedItem;
  isBookmarked: boolean;
  reason?: string | null;  // "Why this?" label
  onBookmarkToggle: (id: string) => void;
  onOpenSource: (url: string) => void;
}

// Add inside the card's content section (after description, before actions):
{reason && (
  <View className="flex-row items-center gap-1.5 mb-3">
    <Icon name="auto_awesome" size={12} color="#4D96FF" />
    <Text className="text-xs text-accent-blue font-medium italic">
      {reason}
    </Text>
  </View>
)}
```

---

## Step 3: Error Boundaries

**File:** `components/common/ErrorBoundary.tsx`

```tsx
// components/common/ErrorBoundary.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Icon } from "./Icon";

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-6">
      <View className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 items-center justify-center mb-4">
        <Icon name="close" size={32} color="#ef4444" />
      </View>
      <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 text-center">
        Something went wrong
      </Text>
      <Text className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
        {error?.message || "An unexpected error occurred. Please try again."}
      </Text>
      {resetError && (
        <Pressable
          onPress={resetError}
          className="bg-accent-blue px-6 py-3 rounded-full active:scale-95"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </Pressable>
      )}
    </View>
  );
}
```

---

## Step 4: Loading Skeletons for All Screens

### 4a. Home Screen Skeleton

**File:** `components/home/HomeSkeleton.tsx`

```tsx
// components/home/HomeSkeleton.tsx
import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

function SkeletonPulse({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

export function HomeSkeleton() {
  return (
    <SkeletonPulse>
      {/* Filter chips skeleton */}
      <View className="px-6 py-2 flex-row gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} className="bg-slate-200 dark:bg-slate-700 rounded-full w-20 h-10" />
        ))}
      </View>

      {/* Grid skeleton */}
      <View className="px-6 mt-4 flex-row flex-wrap gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View
            key={i}
            className="bg-slate-200 dark:bg-slate-700 rounded-2xl h-48"
            style={{ width: "47.5%" }}
          />
        ))}
      </View>
    </SkeletonPulse>
  );
}
```

### 4b. Feed Screen Skeleton (already created in Phase 5)

Verify `components/feed/FeedSkeleton.tsx` exists from Phase 5.

---

## Step 5: Offline Support with TanStack Query Persistence

```bash
npm install @tanstack/query-async-storage-persister @tanstack/react-query-persist-client
```

Update `app/_layout.tsx`:

```tsx
// Add offline persistence to TanStack Query
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "zuno-query-cache",
});

// Replace QueryClientProvider with PersistQueryClientProvider:
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{ persister: asyncStoragePersister }}
>
  {/* ...rest of the app... */}
</PersistQueryClientProvider>
```

---

## Step 6: App Branding and Assets

### 6a. Create App Icon

Create or place your app icon files:

- `assets/icon.png` — 1024x1024 main app icon
- `assets/adaptive-icon.png` — 1024x1024 Android adaptive icon (foreground)
- `assets/splash-icon.png` — Splash screen icon
- `assets/favicon.png` — 48x48 web favicon

### 6b. Update `app.json` with Final Branding

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
      "bundleIdentifier": "com.zuno.app",
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "Zuno needs access to save content thumbnails.",
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": ["zunoapp"]
          }
        ]
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#F8FAFC"
      },
      "package": "com.zuno.app",
      "intentFilters": [
        {
          "action": "android.intent.action.SEND",
          "category": ["android.intent.category.DEFAULT"],
          "data": [
            { "mimeType": "text/plain" }
          ]
        }
      ]
    },
    "web": {
      "bundler": "metro",
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-font",
        {
          "fonts": ["./assets/fonts/Inter-Regular.ttf"]
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

---

## Step 7: EAS Build Configuration

### 7a. Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 7b. Create `eas.json`

**File:** `eas.json`

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://YOUR_PROJECT_REF.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://YOUR_PROJECT_REF.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://YOUR_PROJECT_REF.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-services.json"
      },
      "ios": {
        "appleId": "your-apple-id@example.com"
      }
    }
  }
}
```

### 7c. Build Commands

```bash
# Development build (with dev client)
eas build --profile development --platform android
eas build --profile development --platform ios

# Preview build (for internal testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all
```

---

## Step 8: Performance Optimization Checklist

### FlatList Optimizations (already applied in earlier phases)

```tsx
// Every FlatList should have:
<FlatList
  removeClippedSubviews={true}
  maxToRenderPerBatch={5}
  windowSize={5}
  initialNumToRender={3}
  getItemLayout={(_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Image Caching

```bash
npm install expo-image
```

Replace `<Image>` with `<Image>` from `expo-image` for better caching:

```tsx
import { Image } from "expo-image";

<Image
  source={{ uri: item.imageUrl }}
  style={{ width: "100%", height: 192 }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

### Memoization

Ensure all list item components use `React.memo`:

```tsx
export const FeedCard = React.memo(function FeedCard(props: FeedCardProps) {
  // ...component code
});
```

### Bundle Size Analysis

```bash
# Analyze bundle
npx expo export --platform web
npx source-map-explorer dist/bundles/web-*.js
```

---

## Step 9: Final Integration Test Script

Create a manual test script checklist:

### Complete App Flow Test

1. **Fresh Install**
   - [ ] App opens to splash screen
   - [ ] Splash animation plays (logo, divider, name, tagline)
   - [ ] Auto-navigates to Home after ~2.5s

2. **Home Screen (Unauthenticated)**
   - [ ] Mock collections display in 2-col grid
   - [ ] Filter chips work (All, Recent, Ideas, Research, Personal)
   - [ ] Settings dropdown opens and closes
   - [ ] Theme toggle works (Light/Dark/System)
   - [ ] "Add New" button shows

3. **Feed Screen (Unauthenticated)**
   - [ ] Mock feed items display
   - [ ] Feed filter chips work
   - [ ] Search button opens search screen
   - [ ] Cards show thumbnails, titles, badges
   - [ ] Bookmark toggling works (local storage)
   - [ ] "Open" button attempts to open URL

4. **VFeed Screen**
   - [ ] Full-screen reel cards display
   - [ ] Vertical swiping works (snap to each card)
   - [ ] Pagination dots update
   - [ ] Action buttons work
   - [ ] Header overlay visible

5. **Profile Screen**
   - [ ] Avatar and "Zuno User" display
   - [ ] Theme toggle works
   - [ ] "Sign In" button shows
   - [ ] App version displays

6. **Authentication Flow**
   - [ ] Login screen opens from Profile
   - [ ] Phone number input works
   - [ ] OTP screen receives and verifies code
   - [ ] Google Sign-In opens OAuth flow
   - [ ] "Skip for now" returns to Home
   - [ ] Auth session persists across app restarts

7. **Authenticated Features**
   - [ ] Home shows real collections from Supabase
   - [ ] "Add New" opens Add Content modal
   - [ ] Content saves to Supabase
   - [ ] AI processes content (category, summary, tags)
   - [ ] Collections update with new items
   - [ ] Feed shows personalized recommendations
   - [ ] "Why this?" labels appear on feed cards
   - [ ] Search finds saved content
   - [ ] Natural language search returns relevant results
   - [ ] Tag search works
   - [ ] Bookmarks sync to Supabase
   - [ ] Sign out clears session

8. **Dark Mode**
   - [ ] Every screen renders correctly in dark mode
   - [ ] Tab bar colors update
   - [ ] Headers have correct background
   - [ ] Cards have correct dark backgrounds
   - [ ] Text colors are readable

9. **Performance**
   - [ ] App loads within 3 seconds
   - [ ] FlatList scrolling is 60fps
   - [ ] Image loading is smooth (no flicker)
   - [ ] Theme switching is instant
   - [ ] Navigation transitions are smooth

10. **Error Handling**
    - [ ] Network error shows friendly message
    - [ ] API errors don't crash the app
    - [ ] Empty states show helpful messages
    - [ ] Loading skeletons display while data loads

---

## Verification Checklist

- [ ] **Feed engine works**: Personalized feed items generated based on user interests
- [ ] **"Why this?" shows**: Feed cards display reason labels
- [ ] **Error boundary works**: App shows fallback UI on errors
- [ ] **Loading skeletons show**: All screens show skeletons while loading
- [ ] **Offline mode works**: App shows cached data when offline
- [ ] **App icon set**: Custom icon displays on home screen
- [ ] **EAS builds succeed**: Development and preview builds complete
- [ ] **FlatList performance**: No jank when scrolling
- [ ] **Image caching works**: Images don't re-download on revisit
- [ ] **Bundle size reasonable**: Under 10MB for initial JS bundle
- [ ] **All 12 phases verified**: Every feature from Phases 1-12 working

---

## 🎉 Congratulations!

You have completed all 12 phases of the Zuno app implementation. The app now has:

- ✅ **React Native + Expo** with NativeWind styling
- ✅ **Full design system** matching the UI Style Guide
- ✅ **Tab navigation** with Home, Feed, VFeed, and Profile
- ✅ **Animated splash screen**
- ✅ **Collections grid** with filter chips
- ✅ **Personalized feed** with bookmarks and source links
- ✅ **Reels-style VFeed** with snap scrolling
- ✅ **Supabase backend** with complete schema and RLS
- ✅ **Phone OTP + Google authentication**
- ✅ **Full CRUD** for content and collections
- ✅ **AI-powered** categorization, summarization, and tagging
- ✅ **Hybrid search** (full-text + semantic with pgvector)
- ✅ **Personalized feed engine** with "Why This?" explainability
- ✅ **Dark mode** across all screens
- ✅ **Offline support** with TanStack Query persistence
- ✅ **EAS Build** configuration for both platforms

### Next Steps Beyond This Plan

- 🔜 Share sheet integration (Android/iOS receive intent)
- 🔜 Push notifications (content reminders, weekly digest)
- 🔜 Collaborative collections
- 🔜 Browser extension
- 🔜 Voice search
- 🔜 Analytics dashboard
