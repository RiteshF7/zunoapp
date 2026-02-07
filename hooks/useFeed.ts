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
