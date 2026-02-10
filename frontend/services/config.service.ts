// services/config.service.ts
// Fetches app config from the backend.  This is a PUBLIC endpoint
// (no JWT required) so it can run before the user has signed in.

import { Platform } from "react-native";

function getBackendUrl(): string {
  const url = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:8000";
  if (Platform.OS === "android") {
    return url.replace("://localhost", "://10.0.2.2");
  }
  return url;
}

const BACKEND_URL = getBackendUrl();

// ── Types ────────────────────────────────────────────────────────────────

export interface FeatureFlags {
  feed_enabled: boolean;
  vfeed_enabled: boolean;
  ai_processing_enabled: boolean;
  search_enabled: boolean;
  collections_enabled: boolean;
  share_enabled: boolean;
}

export interface ContentLimits {
  max_saves: number;
  max_collections: number;
  max_tags_per_content: number;
}

export interface FeedSettings {
  page_size: number;
  refresh_interval_seconds: number;
  max_feed_items: number;
}

export interface AppLinks {
  terms_url: string;
  privacy_url: string;
  support_url: string;
  app_store_url: string;
  play_store_url: string;
}

export interface AppConfig {
  app_version: string;
  min_supported_version: string;
  maintenance_mode: boolean;
  maintenance_message: string | null;
  feature_flags: FeatureFlags;
  content_limits: ContentLimits;
  feed_settings: FeedSettings;
  app_links: AppLinks;
  supported_platforms: string[];
}

// ── Service ──────────────────────────────────────────────────────────────

export const configService = {
  /**
   * Fetch app config (public, no auth).
   * Returns `null` if the request fails so the app can fall back to defaults.
   */
  async getConfig(): Promise<AppConfig | null> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/config`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        console.warn(`Config fetch failed: ${res.status}`);
        return null;
      }
      return (await res.json()) as AppConfig;
    } catch (error) {
      console.warn("Config fetch error:", error);
      return null;
    }
  },
};
