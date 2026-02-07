# Phase 9 — Content Management (CRUD)

## Overview

Replace mock JSON data with real Supabase data. Implement full CRUD operations for content and collections using TanStack Query for caching, mutations, and optimistic updates. Build the "Add Content" screen, content detail screen, and update the Home and Feed screens to use real data.

## Prerequisites

- Phase 8 completed (authentication working)
- Supabase schema created and seeded
- TanStack Query installed and configured in root layout

---

## Step 1: Create Service Layer

### 1a. Collections Service

**File:** `services/collections.service.ts`

```typescript
// services/collections.service.ts
import { supabase } from "@/lib/supabase";
import { Collection } from "@/types/supabase";

export const collectionsService = {
  // Get all collections for the current user
  async getCollections(): Promise<Collection[]> {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get a single collection
  async getCollection(id: string): Promise<Collection | null> {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new collection
  async createCollection(collection: {
    title: string;
    description?: string;
    icon?: string;
    theme?: string;
    is_smart?: boolean;
    smart_rules?: Record<string, any>;
  }): Promise<Collection> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("collections")
      .insert({
        user_id: user.id,
        title: collection.title,
        description: collection.description,
        icon: collection.icon || "folder",
        theme: collection.theme || "blue",
        is_smart: collection.is_smart || false,
        smart_rules: collection.smart_rules,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a collection
  async updateCollection(id: string, updates: Partial<Collection>): Promise<Collection> {
    const { data, error } = await supabase
      .from("collections")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a collection
  async deleteCollection(id: string): Promise<void> {
    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Get items in a collection
  async getCollectionItems(collectionId: string) {
    const { data, error } = await supabase
      .from("collection_items")
      .select(`
        added_at,
        content:content_id (*)
      `)
      .eq("collection_id", collectionId)
      .order("added_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Add item to collection
  async addItemToCollection(collectionId: string, contentId: string): Promise<void> {
    const { error } = await supabase
      .from("collection_items")
      .insert({ collection_id: collectionId, content_id: contentId });

    if (error) throw error;

    // Update item count
    await supabase.rpc("increment_collection_count", { collection_id: collectionId });
  },

  // Remove item from collection
  async removeItemFromCollection(collectionId: string, contentId: string): Promise<void> {
    const { error } = await supabase
      .from("collection_items")
      .delete()
      .eq("collection_id", collectionId)
      .eq("content_id", contentId);

    if (error) throw error;

    // Decrement item count
    await supabase.rpc("decrement_collection_count", { collection_id: collectionId });
  },
};
```

### 1b. Content Service

**File:** `services/content.service.ts`

```typescript
// services/content.service.ts
import { supabase } from "@/lib/supabase";
import { Content } from "@/types/supabase";

export const contentService = {
  // Get all content for the current user
  async getContent(options?: {
    limit?: number;
    offset?: number;
    category?: string;
    platform?: string;
    contentType?: string;
  }): Promise<Content[]> {
    let query = supabase
      .from("content")
      .select("*")
      .order("created_at", { ascending: false });

    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    if (options?.category) query = query.eq("ai_category", options.category);
    if (options?.platform) query = query.eq("platform", options.platform);
    if (options?.contentType) query = query.eq("content_type", options.contentType);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get a single content item
  async getContentItem(id: string): Promise<Content | null> {
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create (save) new content
  async saveContent(content: {
    url: string;
    title?: string;
    description?: string;
    thumbnail_url?: string;
    platform?: string;
    content_type?: string;
  }): Promise<Content> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("content")
      .insert({
        user_id: user.id,
        url: content.url,
        title: content.title,
        description: content.description,
        thumbnail_url: content.thumbnail_url,
        platform: content.platform || "other",
        content_type: content.content_type || "post",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update content
  async updateContent(id: string, updates: Partial<Content>): Promise<Content> {
    const { data, error } = await supabase
      .from("content")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete content
  async deleteContent(id: string): Promise<void> {
    const { error } = await supabase
      .from("content")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Get content with tags
  async getContentWithTags(id: string) {
    const { data, error } = await supabase
      .from("content")
      .select(`
        *,
        content_tags (
          tag:tag_id (id, name, slug, is_ai_generated)
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },
};
```

### 1c. Feed Service

**File:** `services/feed.service.ts`

```typescript
// services/feed.service.ts
import { supabase } from "@/lib/supabase";
import { FeedItem, Bookmark } from "@/types/supabase";

export const feedService = {
  // Get feed items
  async getFeedItems(options?: {
    limit?: number;
    offset?: number;
    category?: string;
    contentType?: string;
  }): Promise<FeedItem[]> {
    let query = supabase
      .from("feed_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    if (options?.category) query = query.eq("category", options.category);
    if (options?.contentType) query = query.eq("content_type", options.contentType);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get user's bookmarks
  async getBookmarks(): Promise<string[]> {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("feed_item_id");

    if (error) throw error;
    return (data || []).map((b) => b.feed_item_id);
  },

  // Toggle bookmark
  async toggleBookmark(feedItemId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Check if already bookmarked
    const { data: existing } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("feed_item_id", feedItemId)
      .single();

    if (existing) {
      // Remove bookmark
      await supabase
        .from("bookmarks")
        .delete()
        .eq("id", existing.id);
      return false;
    } else {
      // Add bookmark
      await supabase
        .from("bookmarks")
        .insert({ user_id: user.id, feed_item_id: feedItemId });
      return true;
    }
  },
};
```

---

## Step 2: Create TanStack Query Hooks

### 2a. Collections Hook

**File:** `hooks/useCollections.ts`

```typescript
// hooks/useCollections.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionsService } from "@/services/collections.service";
import { useAuthStore } from "@/stores/authStore";

export function useCollections() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["collections"],
    queryFn: () => collectionsService.getCollections(),
    enabled: isAuthenticated,
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: ["collections", id],
    queryFn: () => collectionsService.getCollection(id),
    enabled: !!id,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: collectionsService.createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      collectionsService.updateCollection(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["collections", id] });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: collectionsService.deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}
```

### 2b. Feed Hook

**File:** `hooks/useFeed.ts`

```typescript
// hooks/useFeed.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feedService } from "@/services/feed.service";
import { useAuthStore } from "@/stores/authStore";

export function useFeedItems(options?: {
  category?: string;
  contentType?: string;
}) {
  return useQuery({
    queryKey: ["feed", options],
    queryFn: () => feedService.getFeedItems(options),
  });
}

export function useBookmarks() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => feedService.getBookmarks(),
    enabled: isAuthenticated,
    initialData: [],
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: feedService.toggleBookmark,
    // Optimistic update
    onMutate: async (feedItemId) => {
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });
      const previous = queryClient.getQueryData<string[]>(["bookmarks"]) || [];

      const updated = previous.includes(feedItemId)
        ? previous.filter((id) => id !== feedItemId)
        : [...previous, feedItemId];

      queryClient.setQueryData(["bookmarks"], updated);
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["bookmarks"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}
```

---

## Step 3: Build the "Add Content" Screen

**File:** `app/(tabs)/add.tsx` (or use a modal)

Create a new file for adding content. Since this is triggered from the "Add New" button, we can use a modal approach. First, add a new route:

**File:** `app/add-content.tsx`

```tsx
// app/add-content.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { IconButton } from "@/components/common/IconButton";
import { Icon } from "@/components/common/Icon";
import { contentService } from "@/services/content.service";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";

const PLATFORM_OPTIONS = [
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "twitter", label: "Twitter/X" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "tiktok", label: "TikTok" },
  { id: "reddit", label: "Reddit" },
  { id: "other", label: "Other" },
];

const TYPE_OPTIONS = [
  { id: "video", label: "Video" },
  { id: "reel", label: "Reel/Short" },
  { id: "article", label: "Article" },
  { id: "post", label: "Post" },
  { id: "thread", label: "Thread" },
  { id: "image", label: "Image" },
];

export default function AddContentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("other");
  const [contentType, setContentType] = useState("post");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!url.trim()) {
      Alert.alert("Error", "Please enter a URL.");
      return;
    }

    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Please sign in to save content.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/(auth)/login") },
      ]);
      return;
    }

    setLoading(true);
    try {
      await contentService.saveContent({
        url: url.trim(),
        title: title.trim() || undefined,
        platform,
        content_type: contentType,
      });
      Alert.alert("Saved!", "Content has been added to your library.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background-light dark:bg-background-dark"
    >
      <ScrollView className="flex-1" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between">
          <IconButton onPress={() => router.back()}>
            <Icon name="close" size={24} color={isDark ? "#e2e8f0" : "#1e293b"} />
          </IconButton>
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Add Content
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View className="px-6">
          {/* URL Input */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              URL *
            </Text>
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder="https://..."
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-base text-slate-900 dark:text-slate-100"
            />
          </View>

          {/* Title Input (Optional) */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Title (optional — AI will auto-detect)
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Content title..."
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-base text-slate-900 dark:text-slate-100"
            />
          </View>

          {/* Platform Selection */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Platform
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.id}
                  onPress={() => setPlatform(opt.id)}
                  className={`px-4 py-2.5 rounded-full ${
                    platform === opt.id
                      ? "bg-slate-900 dark:bg-slate-200"
                      : "bg-slate-100 dark:bg-card-dark"
                  }`}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  <Text
                    className={`text-sm font-medium ${
                      platform === opt.id
                        ? "text-white dark:text-slate-900"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Content Type Selection */}
          <View className="mb-8">
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Content Type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.id}
                  onPress={() => setContentType(opt.id)}
                  className={`px-4 py-2.5 rounded-full ${
                    contentType === opt.id
                      ? "bg-accent-blue"
                      : "bg-slate-100 dark:bg-card-dark"
                  }`}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  <Text
                    className={`text-sm font-medium ${
                      contentType === opt.id
                        ? "text-white"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <PrimaryButton
            label={loading ? "Saving..." : "Save to Zuno"}
            icon="add"
            onPress={handleSave}
          />

          {/* AI Note */}
          <View className="mt-4 bg-accent-blue/10 rounded-2xl p-4">
            <Text className="text-xs text-accent-blue font-medium">
              AI will automatically categorize, tag, and summarize this content after saving.
            </Text>
          </View>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

Register this as a modal in the root layout:

```tsx
// In app/_layout.tsx, add to Stack:
<Stack.Screen
  name="add-content"
  options={{
    presentation: "modal",
    animation: "slide_from_bottom",
  }}
/>
```

---

## Step 4: Update Home Screen to Use Real Data (with Fallback)

Update `app/(tabs)/index.tsx` to use TanStack Query with a fallback to mock data when not authenticated:

```tsx
// Key changes to app/(tabs)/index.tsx:
import { useCollections } from "@/hooks/useCollections";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import contentData from "@/assets/data/content.json";

// Inside the component:
const router = useRouter();
const { isAuthenticated } = useAuthStore();
const { data: supabaseCollections, isLoading, refetch } = useCollections();

// Use Supabase data if authenticated, otherwise fallback to mock data
const collections = isAuthenticated && supabaseCollections
  ? supabaseCollections.map((c) => ({
      id: c.id,
      title: c.title,
      count: c.item_count,
      icon: c.icon,
      theme: c.theme as any,
    }))
  : (contentData.collections as any[]);

// Update the "Add New" button to navigate:
<PrimaryButton
  label="Add New"
  icon="add"
  onPress={() => router.push("/add-content")}
/>
```

---

## Step 5: Create RPC Functions for Collection Counts

Run in Supabase SQL Editor:

```sql
-- Increment collection item count
CREATE OR REPLACE FUNCTION increment_collection_count(collection_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.collections
  SET item_count = item_count + 1
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement collection item count
CREATE OR REPLACE FUNCTION decrement_collection_count(collection_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.collections
  SET item_count = GREATEST(item_count - 1, 0)
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Verification Checklist

- [ ] **Collections load from Supabase**: When authenticated, collections come from the database
- [ ] **Fallback to mock data**: When not authenticated, mock JSON data is used
- [ ] **Add Content screen opens**: Tapping "Add New" opens the modal
- [ ] **URL input works**: Can enter a URL
- [ ] **Platform selection works**: Can tap to select a platform
- [ ] **Content type selection works**: Can tap to select a content type
- [ ] **Save to Supabase works**: Content is saved to the `content` table
- [ ] **Collections CRUD works**: Can create, update, and delete collections
- [ ] **Feed loads from Supabase**: Seeded feed items appear in the Feed tab
- [ ] **Bookmarks sync**: Bookmarks are saved to Supabase (when authenticated)
- [ ] **Optimistic updates**: Bookmark toggle feels instant (no loading delay)
- [ ] **Pull to refresh**: Refreshes data from Supabase
- [ ] **Error handling**: Shows alerts on save failures
- [ ] **Not authenticated flow**: "Add New" prompts to sign in

---

## What's Next

Once this phase is verified, proceed to **Phase 10 — AI Service Layer** (`PHASE_10_AI_LAYER.md`).
