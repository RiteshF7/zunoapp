// services/feed.service.ts
import { api } from "@/lib/api";
import { FeedItem } from "@/types/supabase";

export const feedService = {
  // Get feed items
  async getFeedItems(options?: {
    limit?: number;
    offset?: number;
    category?: string;
    contentType?: string;
  }): Promise<FeedItem[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.offset) params.set("offset", String(options.offset));
    if (options?.category) params.set("category", options.category);
    if (options?.contentType) params.set("content_type", options.contentType);

    const qs = params.toString();
    return api.get<FeedItem[]>(`/api/feed${qs ? `?${qs}` : ""}`);
  },

  // Get user's bookmarks
  async getBookmarks(): Promise<string[]> {
    return api.get<string[]>("/api/bookmarks");
  },

  // Toggle bookmark
  async toggleBookmark(feedItemId: string): Promise<boolean> {
    const result = await api.post<{ bookmarked: boolean }>(
      `/api/bookmarks/${feedItemId}/toggle`
    );
    return result.bookmarked;
  },
};
