// hooks/useContentFeed.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { contentService } from "@/services/content.service";
import { useAuthStore } from "@/stores/authStore";
import { Content } from "@/types/supabase";
import { CONTENT_FEED_PAGE_SIZE } from "@/types/feed";

interface UseContentFeedOptions {
  /** Filter by content_type (e.g. "video", "article") */
  contentType?: string;
  /** Filter by platform (e.g. "youtube", "instagram") */
  platform?: string;
  /** Filter by AI category */
  category?: string;
}

/**
 * Infinite-scroll hook that fetches the current user's saved content
 * ordered by `created_at DESC`, 20 items per page.
 */
export function useContentFeed(options?: UseContentFeedOptions) {
  const { isAuthenticated } = useAuthStore();

  return useInfiniteQuery<Content[], Error>({
    queryKey: ["contentFeed", options],
    queryFn: async ({ pageParam = 0 }) => {
      const items = await contentService.getContent({
        limit: CONTENT_FEED_PAGE_SIZE,
        offset: pageParam as number,
        category: options?.category,
        platform: options?.platform,
        contentType: options?.contentType,
      });
      return items;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If last page returned fewer items than page size, we've reached the end
      if (lastPage.length < CONTENT_FEED_PAGE_SIZE) return undefined;
      // Next offset = total items fetched so far
      return allPages.reduce((total, page) => total + page.length, 0);
    },
    enabled: isAuthenticated,
  });
}
