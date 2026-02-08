// services/auth.service.ts
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { Profile } from "@/types/supabase";

export const authService = {
  // Google Sign-In (via OAuth) — only supported auth method
  async signInWithGoogle(): Promise<{ error: Error | null; url?: string }> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "zunoapp://auth/callback",
        skipBrowserRedirect: true,
      },
    });
    return { error: error as Error | null, url: data?.url ?? undefined };
  },

  // Sign out
  async signOut(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signOut();
    return { error: error as Error | null };
  },

  // Get current session (still via Supabase Auth)
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },

  // Get current user (still via Supabase Auth)
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  },

  // Update user profile via Python backend
  async updateProfile(id: string, updates: { display_name?: string; avatar_url?: string }) {
    try {
      const data = await api.patch<Profile>("/api/profile", updates);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get user profile via Python backend
  async getProfile(id: string) {
    try {
      const data = await api.get<Profile>("/api/profile");
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};
