// stores/contentStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ContentState {
  activeFilter: string;
  feedBookmarks: string[];
  setActiveFilter: (filter: string) => void;
  toggleBookmark: (itemId: string) => void;
  initializeBookmarks: () => Promise<void>;
}

const BOOKMARKS_KEY = "zuno_feed_bookmarks";

export const useContentStore = create<ContentState>((set, get) => ({
  activeFilter: "all",
  feedBookmarks: [],

  setActiveFilter: (filter: string) => {
    set({ activeFilter: filter });
  },

  toggleBookmark: async (itemId: string) => {
    const current = get().feedBookmarks;
    const updated = current.includes(itemId)
      ? current.filter((id) => id !== itemId)
      : [...current, itemId];

    set({ feedBookmarks: updated });

    try {
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save bookmarks:", e);
    }
  },

  initializeBookmarks: async () => {
    try {
      const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (stored) {
        set({ feedBookmarks: JSON.parse(stored) });
      }
    } catch (e) {
      console.warn("Failed to load bookmarks:", e);
    }
  },
}));
