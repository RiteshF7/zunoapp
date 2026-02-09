// stores/themeStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";

type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  initialize: () => Promise<void>;
}

const THEME_STORAGE_KEY = "zuno_theme";

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === "system") {
    return Appearance.getColorScheme() === "dark";
  }
  return mode === "dark";
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "system",
  isDark: Appearance.getColorScheme() === "dark",

  setMode: async (mode: ThemeMode) => {
    const isDark = resolveIsDark(mode);
    set({ mode, isDark });
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      console.warn("Failed to save theme preference:", e);
    }
  },

  initialize: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && (saved === "light" || saved === "dark" || saved === "system")) {
        const isDark = resolveIsDark(saved as ThemeMode);
        set({ mode: saved as ThemeMode, isDark });
      }
    } catch (e) {
      console.warn("Failed to load theme preference:", e);
    }
  },
}));
