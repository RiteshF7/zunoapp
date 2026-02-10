// services/userPreferences.service.ts
import { api } from "@/lib/api";
import { UserPreferences, FeedType } from "@/types/supabase";

export const userPreferencesService = {
  /** Get the current user's preferences (auto-created on first call). */
  async getPreferences(): Promise<UserPreferences> {
    return api.get<UserPreferences>("/api/user-preferences");
  },

  /** Update the user's preferences (partial update). */
  async updatePreferences(updates: {
    feed_type?: FeedType;
  }): Promise<UserPreferences> {
    return api.patch<UserPreferences>("/api/user-preferences", updates);
  },
};
