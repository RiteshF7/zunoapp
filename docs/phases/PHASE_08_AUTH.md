# Phase 8 — Authentication

## Overview

Implement Phone OTP and Google Sign-In authentication using Supabase Auth. Build the login flow, OTP verification, auth state management with Zustand, protected routes, and the profile screen with sign-out functionality.

## Prerequisites

- Phase 7 completed (Supabase project running, schema created, client configured)
- Supabase Auth enabled (Phone and Google providers)
- `.env` file with Supabase credentials

---

## Step 1: Enable Auth Providers in Supabase

### Phone OTP

1. Go to **Supabase Dashboard > Authentication > Providers**
2. Enable **Phone** provider
3. For development, use Supabase's built-in SMS (no Twilio needed)
4. Set OTP expiry to 300 seconds (5 minutes)

### Google OAuth

1. Go to **Supabase Dashboard > Authentication > Providers**
2. Enable **Google** provider
3. Set up Google OAuth credentials:
   - Go to https://console.cloud.google.com/apis/credentials
   - Create an **OAuth 2.0 Client ID** for **Android** and **iOS** (or Web for testing)
   - Add the redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret** into the Supabase Google provider config
4. Add environment variable:

```env
# Add to .env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## Step 2: Install Auth Dependencies

```bash
# Google Sign-In
npx expo install expo-auth-session expo-crypto expo-web-browser

# For phone input formatting
npm install react-native-phone-number-input
# OR use a simpler approach with TextInput (shown below)
```

---

## Step 3: Create Auth Service

**File:** `services/auth.service.ts`

```typescript
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
    return { error: error as Error | null, url: data?.url };
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
```

---

## Step 4: Create Auth Store

**File:** `stores/authStore.ts`

```typescript
// stores/authStore.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { Profile } from "@/types/supabase";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session,
    });
  },

  setProfile: (profile) => {
    set({ profile });
  },

  initialize: async () => {
    try {
      set({ isLoading: true });

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        set({
          session,
          user: session.user,
          profile,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.warn("Auth initialization error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      session: null,
      user: null,
      profile: null,
      isAuthenticated: false,
    });
  },
}));
```

---

## Step 5: Set Up Auth Listener in Root Layout

Update `app/_layout.tsx` to listen for auth state changes:

```tsx
// app/_layout.tsx — add auth listener
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";

// Inside RootLayout component, add:
const { setSession, initialize: initAuth } = useAuthStore();

useEffect(() => {
  // Initialize auth
  initAuth();

  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session);
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## Step 6: Build the Login Screen

**File:** `app/(auth)/login.tsx`

```tsx
// app/(auth)/login.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { authService } from "@/services/auth.service";
import { useThemeStore } from "@/stores/themeStore";

export default function LoginScreen() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone.trim() || phone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number with country code.");
      return;
    }

    setLoading(true);
    const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
    const { error } = await authService.sendOTP(formattedPhone);
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      router.push({ pathname: "/(auth)/verify", params: { phone: formattedPhone } });
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error, url } = await authService.signInWithGoogle();
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else if (url) {
      // Open Google OAuth URL in browser
      const WebBrowser = require("expo-web-browser");
      await WebBrowser.openAuthSessionAsync(url, "zunoapp://auth/callback");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background-light dark:bg-background-dark"
    >
      <View className="flex-1 justify-center px-6">
        {/* Logo */}
        <View className="items-center mb-10">
          <LinearGradient
            colors={["#4D96FF", "#A855F7"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ color: "white", fontSize: 28, fontWeight: "bold" }}>Z</Text>
          </LinearGradient>
          <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            Welcome to Zuno
          </Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Sign in to sync your content across devices
          </Text>
        </View>

        {/* Phone Input */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Phone Number
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 (555) 000-0000"
            placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
            keyboardType="phone-pad"
            autoComplete="tel"
            className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-base text-slate-900 dark:text-slate-100"
            style={{ fontFamily: "Inter_400Regular" }}
          />
        </View>

        {/* Send OTP Button */}
        <View className="mb-4">
          <PrimaryButton
            label={loading ? "Sending..." : "Continue with Phone"}
            onPress={handleSendOTP}
          />
        </View>

        {/* Divider */}
        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <Text className="px-4 text-xs text-slate-400 dark:text-slate-500">OR</Text>
          <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </View>

        {/* Google Sign-In */}
        <View className="mb-4">
          <PrimaryButton
            label="Continue with Google"
            variant="outline"
            onPress={handleGoogleSignIn}
          />
        </View>

        {/* Skip */}
        <View className="items-center mt-4">
          <Text
            onPress={() => router.replace("/(tabs)")}
            className="text-sm text-accent-blue font-medium"
          >
            Skip for now
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
```

---

## Step 7: Build the OTP Verification Screen

**File:** `app/(auth)/verify.tsx`

```tsx
// app/(auth)/verify.tsx
import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, Alert, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { IconButton } from "@/components/common/IconButton";
import { Icon } from "@/components/common/Icon";
import { authService } from "@/services/auth.service";
import { useThemeStore } from "@/stores/themeStore";

const OTP_LENGTH = 6;

export default function VerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { isDark } = useThemeStore();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newOtp.every((d) => d) && newOtp.join("").length === OTP_LENGTH) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const token = code || otp.join("");
    if (token.length !== OTP_LENGTH) {
      Alert.alert("Invalid Code", "Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    const { error } = await authService.verifyOTP(phone!, token);
    setLoading(false);

    if (error) {
      Alert.alert("Verification Failed", error.message);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } else {
      // Auth state listener in root layout will handle navigation
      router.replace("/(tabs)");
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    const { error } = await authService.sendOTP(phone!);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setResendTimer(30);
      Alert.alert("Code Sent", "A new verification code has been sent.");
    }
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark px-6">
      {/* Back Button */}
      <View className="mt-16 mb-8">
        <IconButton onPress={() => router.back()}>
          <Icon
            name="arrow_back"
            size={24}
            color={isDark ? "#e2e8f0" : "#1e293b"}
          />
        </IconButton>
      </View>

      {/* Header */}
      <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        Enter verification code
      </Text>
      <Text className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        We sent a 6-digit code to {phone}
      </Text>

      {/* OTP Input Boxes */}
      <View className="flex-row gap-3 mb-8 justify-center">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            value={digit}
            onChangeText={(value) => handleOtpChange(value.slice(-1), index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="number-pad"
            maxLength={1}
            className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 ${
              digit
                ? "border-accent-blue bg-accent-blue/10"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark"
            } text-slate-900 dark:text-slate-100`}
            style={{ fontFamily: "Inter_700Bold" }}
          />
        ))}
      </View>

      {/* Verify Button */}
      <PrimaryButton
        label={loading ? "Verifying..." : "Verify"}
        onPress={() => handleVerify()}
      />

      {/* Resend */}
      <View className="items-center mt-6">
        <Pressable onPress={handleResend} disabled={resendTimer > 0}>
          <Text
            className={`text-sm font-medium ${
              resendTimer > 0
                ? "text-slate-400 dark:text-slate-500"
                : "text-accent-blue"
            }`}
          >
            {resendTimer > 0
              ? `Resend code in ${resendTimer}s`
              : "Resend code"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
```

---

## Step 8: Update Profile Screen with Auth

**File:** `app/(tabs)/profile.tsx`

```tsx
// app/(tabs)/profile.tsx
import React from "react";
import { View, Text, ScrollView, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Header } from "@/components/common/Header";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Avatar } from "@/components/common/Avatar";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { Icon } from "@/components/common/Icon";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";

export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, profile, user, signOut } = useAuthStore();
  const { isDark } = useThemeStore();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const displayName = profile?.display_name || "Zuno User";
  const contactInfo = user?.phone || user?.email || "Not signed in";

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <Header title="Profile" showAvatar={false} />
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View className="items-center mt-4 mb-8">
          <Avatar size="lg" letter={displayName[0]?.toUpperCase() || "Z"} />
          <Text className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-4">
            {displayName}
          </Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {contactInfo}
          </Text>
        </View>

        {/* Sign In / Out */}
        {!isAuthenticated ? (
          <View className="mb-6">
            <PrimaryButton
              label="Sign In"
              onPress={() => router.push("/(auth)/login")}
            />
          </View>
        ) : null}

        {/* Theme Section */}
        <View className="mb-6">
          <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            Appearance
          </Text>
          <ThemeToggle />
        </View>

        {/* Menu Items */}
        <View className="gap-3">
          <MenuItem
            icon="person"
            title="Account Settings"
            subtitle={isAuthenticated ? "Manage your account" : "Sign in to access"}
            isDark={isDark}
            onPress={() => {
              if (!isAuthenticated) router.push("/(auth)/login");
            }}
          />

          <MenuItem
            icon="notifications"
            title="Notifications"
            subtitle="Configure notification preferences"
            isDark={isDark}
          />

          <MenuItem
            icon="bookmark"
            title="Saved Items"
            subtitle="View your bookmarked content"
            isDark={isDark}
          />

          {isAuthenticated && (
            <Pressable
              onPress={handleSignOut}
              className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 flex-row items-center gap-4"
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Icon name="close" size={22} color="#ef4444" />
              <View className="flex-1">
                <Text className="font-semibold text-red-600 dark:text-red-400">
                  Sign Out
                </Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* App Info */}
        <View className="items-center mt-8 mb-6">
          <Text className="text-xs text-slate-400 dark:text-slate-500">
            Zuno v1.0.0
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// Menu Item sub-component
function MenuItem({
  icon,
  title,
  subtitle,
  isDark,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  isDark: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-card-dark rounded-2xl p-5 flex-row items-center gap-4"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <Icon name={icon} size={22} color={isDark ? "#94a3b8" : "#64748b"} />
      <View className="flex-1">
        <Text className="font-semibold text-slate-800 dark:text-white">
          {title}
        </Text>
        <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {subtitle}
        </Text>
      </View>
      <Icon name="chevron_right" size={20} color={isDark ? "#475569" : "#94a3b8"} />
    </Pressable>
  );
}
```

---

## Step 9: Create Custom Auth Hook

**File:** `hooks/useAuth.ts`

```typescript
// hooks/useAuth.ts
import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuthStore } from "@/stores/authStore";

/**
 * Hook to protect routes based on authentication state.
 * Redirects to login if not authenticated and trying to access protected routes.
 * Redirects to home if authenticated and trying to access auth routes.
 */
export function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // User is not signed in and not on auth screen
      // For now, we allow unauthenticated access (skip for now)
      // Uncomment to enforce auth:
      // router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // User is signed in but on auth screen — redirect to home
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);
}
```

---

## Verification Checklist

- [ ] **Login screen renders**: Phone input, Google button, and Skip link visible
- [ ] **Phone input works**: Can enter phone number with country code
- [ ] **OTP screen navigates**: After entering phone, navigates to verify screen
- [ ] **OTP boxes work**: Can enter 6 digits, auto-advances between boxes
- [ ] **Backspace works**: Pressing backspace moves to previous box
- [ ] **Resend timer**: Shows countdown, enables resend button after 30s
- [ ] **Google Sign-In**: Button opens OAuth flow (may not complete without proper Google setup)
- [ ] **Auth state persists**: After signing in, closing/reopening app maintains session
- [ ] **Profile shows auth state**: Displays "Sign In" button when not authenticated
- [ ] **Profile shows user info**: When authenticated, shows display name and phone/email
- [ ] **Sign out works**: Sign out button clears session and shows Sign In button
- [ ] **Skip works**: "Skip for now" navigates to home without authentication
- [ ] **Dark mode works**: All auth screens render correctly in dark mode
- [ ] **Keyboard handling**: Phone input doesn't get hidden by keyboard

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| OTP not sending | Check Supabase Auth settings; ensure Phone provider is enabled |
| Google OAuth not working | Verify Client ID and redirect URI in Supabase and Google Console |
| Session not persisting | Ensure SecureStore adapter is configured in `lib/supabase.ts` |
| Profile not created on signup | Check the database trigger `on_auth_user_created` exists |
| Error: "URL polyfill" | Ensure `react-native-url-polyfill` is imported in `lib/supabase.ts` |

---

## What's Next

Once this phase is verified, proceed to **Phase 9 — Content Management (CRUD)** (`PHASE_09_CONTENT_CRUD.md`).
