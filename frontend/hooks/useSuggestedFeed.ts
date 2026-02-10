// hooks/useSuggestedFeed.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { suggestedFeedService } from "@/services/suggestedFeed.service";
import { useAuthStore } from "@/stores/authStore";
import { SuggestedContent } from "@/types/supabase";
import { CONTENT_FEED_PAGE_SIZE } from "@/types/feed";

interface UseSuggestedFeedOptions {
  /** Filter by content_type (e.g. "video", "article") */
  contentType?: string;
  /** Filter by platform (e.g. "youtube", "instagram") */
  platform?: string;
  /** Filter by AI category */
  category?: string;
  /** Whether the query should run */
  enabled?: boolean;
}

/**
 * Infinite-scroll hook for the suggested feed (content from other
 * users' shared collections ranked by relevance).
 */
export function useSuggestedFeed(options?: UseSuggestedFeedOptions) {
  const { isAuthenticated } = useAuthStore();

  return useInfiniteQuery<SuggestedContent[], Error>({
    queryKey: ["suggestedFeed", options],
    queryFn: async ({ pageParam = 0 }) => {
      const items = await suggestedFeedService.getSuggestedFeed({
        limit: CONTENT_FEED_PAGE_SIZE,
        offset: pageParam as number,
        category: options?.category,
        contentType: options?.contentType,
      });
      return items;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < CONTENT_FEED_PAGE_SIZE) return undefined;
      return allPages.reduce((total, page) => total + page.length, 0);
    },
    enabled: isAuthenticated && (options?.enabled !== false),
  });
}
