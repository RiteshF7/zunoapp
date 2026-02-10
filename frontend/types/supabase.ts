// types/supabase.ts
// These types match the Supabase database schema.
// In production, generate these with: npx supabase gen types typescript

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  is_ai_generated: boolean;
  created_by: string | null;
  usage_count: number;
  created_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  icon: string;
  theme: string;
  is_smart: boolean;
  smart_rules: Record<string, any> | null;
  item_count: number;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiStructuredContent {
  tldr: string;
  key_points: string[];
  action_items: string[];
  save_motive: string;
}

export interface Content {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  platform: string;
  content_type: string;
  ai_category: string | null;
  ai_summary: string | null;
  ai_structured_content: AiStructuredContent | null;
  ai_processed: boolean;
  source_metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface ContentTag {
  content_id: string;
  tag_id: string;
  is_ai_assigned: boolean;
  created_at: string;
}

export interface CollectionItem {
  collection_id: string;
  content_id: string;
  added_at: string;
}

export interface FeedItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  source_url: string;
  category: string | null;
  content_type: string;
  platform: string;
  likes: number;
  relevance_score: number | null;
  reason: string | null;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  feed_item_id: string;
  created_at: string;
}

export interface UserInterests {
  id: string;
  user_id: string;
  categories: Record<string, number>;
  tags: Record<string, number>;
  platforms: Record<string, number>;
  content_types: Record<string, number>;
  total_saved: number;
  last_updated: string;
}

export type FeedType = "usersaved" | "suggestedcontent";

export interface UserPreferences {
  id: string;
  user_id: string;
  feed_type: FeedType;
  created_at: string;
  updated_at: string;
}

/** A suggested content item (from another user's shared collection). */
export interface SuggestedContent {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  platform: string;
  content_type: string;
  ai_category: string | null;
  ai_summary: string | null;
  ai_structured_content: Record<string, any> | null;
  ai_processed: boolean;
  source_metadata: Record<string, any> | null;
  relevance_score: number;
  created_at: string;
  updated_at: string;
}

// Database type map
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> };
      tags: { Row: Tag; Insert: Omit<Tag, "id" | "created_at" | "usage_count">; Update: Partial<Tag> };
      collections: { Row: Collection; Insert: Omit<Collection, "id" | "created_at" | "updated_at" | "item_count">; Update: Partial<Collection> };
      content: { Row: Content; Insert: Omit<Content, "id" | "created_at" | "updated_at">; Update: Partial<Content> };
      content_tags: { Row: ContentTag; Insert: Omit<ContentTag, "created_at">; Update: Partial<ContentTag> };
      collection_items: { Row: CollectionItem; Insert: Omit<CollectionItem, "added_at">; Update: Partial<CollectionItem> };
      feed_items: { Row: FeedItem; Insert: Omit<FeedItem, "id" | "created_at">; Update: Partial<FeedItem> };
      bookmarks: { Row: Bookmark; Insert: Omit<Bookmark, "id" | "created_at">; Update: Partial<Bookmark> };
      user_interests: { Row: UserInterests; Insert: Omit<UserInterests, "id" | "last_updated">; Update: Partial<UserInterests> };
      user_preferences: { Row: UserPreferences; Insert: Omit<UserPreferences, "id" | "created_at" | "updated_at">; Update: Partial<UserPreferences> };
    };
  };
}
