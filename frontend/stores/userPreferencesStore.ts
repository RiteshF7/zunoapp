// stores/userPreferencesStore.ts
// Per-user preferences fetched from the backend (feed_type, etc.).

import { create } from "zustand";
import { FeedType } from "@/types/supabase";
import { userPreferencesService } from "@/services/userPreferences.service";

interface UserPreferencesState {
  feedType: FeedType;
  isLoaded: boolean;
  isLoading: boolean;

  /** Fetch preferences from backend (requires auth). */
  initialize: () => Promise<void>;

  /** Toggle feed type and persist to backend. */
  setFeedType: (type: FeedType) => Promise<void>;
}

export const useUserPreferencesStore = create<UserPreferencesState>(
  (set, get) => ({
    feedType: "usersaved",
    isLoaded: false,
    isLoading: false,

    initialize: async () => {
      if (get().isLoaded || get().isLoading) return;

      set({ isLoading: true });
      try {
        const prefs = await userPreferencesService.getPreferences();
        set({
          feedType: (prefs.feed_type as FeedType) || "usersaved",
          isLoaded: true,
        });
      } catch (error) {
        console.warn("Failed to fetch user preferences:", error);
        // Keep defaults
        set({ isLoaded: true });
      } finally {
        set({ isLoading: false });
      }
    },

    setFeedType: async (type: FeedType) => {
      const prev = get().feedType;
      // Optimistic update
      set({ feedType: type });

      try {
        await userPreferencesService.updatePreferences({ feed_type: type });
      } catch (error) {
        console.warn("Failed to update feed type:", error);
        // Rollback on error
        set({ feedType: prev });
      }
    },
  })
);
