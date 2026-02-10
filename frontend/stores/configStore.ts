// stores/configStore.ts
// Global app configuration fetched from the backend at startup.
// Falls back to sensible defaults if the backend is unreachable.

import { create } from "zustand";
import {
  AppConfig,
  FeatureFlags,
  ContentLimits,
  FeedSettings,
  AppLinks,
  configService,
} from "@/services/config.service";

// ── Defaults (used when backend is unreachable) ──────────────────────────

const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  feed_enabled: true,
  vfeed_enabled: false,
  ai_processing_enabled: true,
  search_enabled: true,
  collections_enabled: true,
  share_enabled: true,
};

const DEFAULT_CONTENT_LIMITS: ContentLimits = {
  max_saves: 500,
  max_collections: 50,
  max_tags_per_content: 10,
};

const DEFAULT_FEED_SETTINGS: FeedSettings = {
  page_size: 20,
  refresh_interval_seconds: 300,
  max_feed_items: 200,
};

const DEFAULT_APP_LINKS: AppLinks = {
  terms_url: "https://zuno.app/terms",
  privacy_url: "https://zuno.app/privacy",
  support_url: "https://zuno.app/support",
  app_store_url: "",
  play_store_url: "",
};

const DEFAULT_CONFIG: AppConfig = {
  app_version: "1.0.0",
  min_supported_version: "1.0.0",
  maintenance_mode: false,
  maintenance_message: null,
  feature_flags: DEFAULT_FEATURE_FLAGS,
  content_limits: DEFAULT_CONTENT_LIMITS,
  feed_settings: DEFAULT_FEED_SETTINGS,
  app_links: DEFAULT_APP_LINKS,
  supported_platforms: [
    "youtube", "instagram", "x", "reddit",
    "tiktok", "spotify", "web",
  ],
};

// ── Store ────────────────────────────────────────────────────────────────

interface ConfigState {
  config: AppConfig;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;

  /** Fetch config from backend; safe to call multiple times. */
  initialize: () => Promise<void>;

  /** Force-refresh config (e.g. after app comes back to foreground). */
  refresh: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: DEFAULT_CONFIG,
  isLoaded: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    // Skip if already loaded or currently loading
    if (get().isLoaded || get().isLoading) return;

    set({ isLoading: true, error: null });

    const remote = await configService.getConfig();

    if (remote) {
      set({ config: remote, isLoaded: true, isLoading: false });
    } else {
      // Keep defaults but mark as loaded so the app doesn't block
      set({ isLoaded: true, isLoading: false, error: "Using default config" });
    }
  },

  refresh: async () => {
    set({ isLoading: true, error: null });

    const remote = await configService.getConfig();

    if (remote) {
      set({ config: remote, isLoading: false, error: null });
    } else {
      set({ isLoading: false, error: "Config refresh failed" });
    }
  },
}));
