// stores/contentStore.ts
import { create } from "zustand";

interface ContentState {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export const useContentStore = create<ContentState>((set) => ({
  activeFilter: "all",

  setActiveFilter: (filter: string) => {
    set({ activeFilter: filter });
  },
}));
