// services/suggestedFeed.service.ts
import { api } from "@/lib/api";
import { SuggestedContent } from "@/types/supabase";

export const suggestedFeedService = {
  /**
   * Fetch suggested content based on the user's interests.
   * Content comes from other users' shared collections.
   */
  async getSuggestedFeed(options?: {
    limit?: number;
    offset?: number;
    category?: string;
    contentType?: string;
  }): Promise<SuggestedContent[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.offset) params.set("offset", String(options.offset));
    if (options?.category) params.set("category", options.category);
    if (options?.contentType) params.set("content_type", options.contentType);

    const qs = params.toString();
    return api.get<SuggestedContent[]>(
      `/api/suggested-feed${qs ? `?${qs}` : ""}`
    );
  },
};
