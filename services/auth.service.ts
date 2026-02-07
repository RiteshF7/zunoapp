// services/auth.service.ts
import { supabase } from "@/lib/supabase";

export const authService = {
  // Phone OTP: Send verification code
  async sendOTP(phone: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    return { error: error as Error | null };
  },

  // Phone OTP: Verify the code
  async verifyOTP(phone: string, token: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });
    return { error: error as Error | null };
  },

  // Google Sign-In (via OAuth)
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

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },

  // Get current user
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  },

  // Update user profile
  async updateProfile(id: string, updates: { display_name?: string; avatar_url?: string }) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  // Get user profile
  async getProfile(id: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },
};
