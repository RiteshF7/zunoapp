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
