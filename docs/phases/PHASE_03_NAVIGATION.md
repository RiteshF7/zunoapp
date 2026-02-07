# Phase 3 — Navigation Shell and Splash Screen

## Overview

Set up the complete navigation structure using Expo Router with file-based routing. Build the splash/onboarding screen, bottom tab navigation, auth route group, and screen transitions. After this phase, the app has a working navigation skeleton with placeholder screens.

## Prerequisites

- Phase 1 and Phase 2 completed and verified
- All shared components built and rendering correctly
- Dark mode toggle functional

---

## Step 1: Create the Splash Screen

**File:** `app/index.tsx`

Replace the preview screen from Phase 2 with the real splash screen. This is the entry point (`index.tsx` at root = first screen shown).

```tsx
// app/index.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeStore } from "@/stores/themeStore";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const { isDark, initialize } = useThemeStore();

  // Animations
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initialize();

    // Staggered entrance animation
    Animated.sequence([
      // Logo fades in and scales up
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // App name fades in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Tagline fades in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
      {/* Decorative grid dots (subtle background) */}
      <View className="absolute inset-0 opacity-5">
        {Array.from({ length: 20 }).map((_, row) =>
          Array.from({ length: 10 }).map((_, col) => (
            <View
              key={`${row}-${col}`}
              className="absolute w-1 h-1 rounded-full bg-slate-400"
              style={{
                left: col * (width / 10) + width / 20,
                top: row * (height / 20) + height / 40,
              }}
            />
          ))
        )}
      </View>

      {/* Logo */}
      <Animated.View
        style={{
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
        }}
      >
        <LinearGradient
          colors={["#4D96FF", "#A855F7"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#4D96FF",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Text style={{ color: "white", fontSize: 36, fontWeight: "bold" }}>
            Z
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Divider line */}
      <Animated.View
        style={{ opacity: textOpacity }}
        className="w-8 h-0.5 bg-slate-300 dark:bg-slate-600 my-6"
      />

      {/* App Name */}
      <Animated.Text
        style={{ opacity: textOpacity }}
        className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
      >
        Zuno
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text
        style={{ opacity: taglineOpacity }}
        className="text-sm text-slate-500 dark:text-slate-400 mt-2"
      >
        Your unified content hub
      </Animated.Text>
    </View>
  );
}
```

---

## Step 2: Create the Tab Layout

**File:** `app/(tabs)/_layout.tsx`

This defines the bottom tab navigation with 4 tabs: Home, Feed, VFeed, and Profile.

```tsx
// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { View, Platform } from "react-native";
import { Icon } from "@/components/common/Icon";
import { useThemeStore } from "@/stores/themeStore";

export default function TabLayout() {
  const { isDark } = useThemeStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#1A1C1E" : "#F8FAFC",
          borderTopColor: isDark ? "#2D2F31" : "#e2e8f0",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 85 : 65,
          paddingBottom: Platform.OS === "ios" ? 25 : 10,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: "#4D96FF",
        tabBarInactiveTintColor: isDark ? "#64748b" : "#94a3b8",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          fontFamily: "Inter_600SemiBold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, size }) => (
            <Icon name="auto_awesome" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vfeed"
        options={{
          title: "Reels",
          tabBarIcon: ({ color, size }) => (
            <Icon name="play_arrow" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

---

## Step 3: Create Tab Screen Placeholders

Each tab screen gets a placeholder that will be built out in later phases.

### 3a. Home Tab

**File:** `app/(tabs)/index.tsx`

```tsx
// app/(tabs)/index.tsx
import React from "react";
import { View, Text } from "react-native";
import { Header } from "@/components/common/Header";

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <Header
        title="Zuno"
        subtitle="Pick your"
        actions={[
          { icon: "search", onPress: () => {} },
          { icon: "notifications", onPress: () => {} },
          { icon: "settings", onPress: () => {} },
        ]}
      />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
          Home Screen
        </Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400 text-center">
          Collections grid will be built in Phase 4.
        </Text>
      </View>
    </View>
  );
}
```

### 3b. Feed Tab

**File:** `app/(tabs)/feed.tsx`

```tsx
// app/(tabs)/feed.tsx
import React from "react";
import { View, Text } from "react-native";
import { Header } from "@/components/common/Header";

export default function FeedScreen() {
  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <Header
        title="Feed"
        actions={[
          { icon: "search", onPress: () => {} },
          { icon: "settings", onPress: () => {} },
        ]}
      />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
          Feed Screen
        </Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400 text-center">
          Personalized discovery feed will be built in Phase 5.
        </Text>
      </View>
    </View>
  );
}
```

### 3c. VFeed Tab

**File:** `app/(tabs)/vfeed.tsx`

```tsx
// app/(tabs)/vfeed.tsx
import React from "react";
import { View, Text } from "react-native";

export default function VFeedScreen() {
  return (
    <View className="flex-1 bg-background-dark items-center justify-center px-6">
      <Text className="text-lg font-bold text-white mb-2">
        VFeed Screen
      </Text>
      <Text className="text-sm text-slate-400 text-center">
        Reels-style vertical feed will be built in Phase 6.
      </Text>
    </View>
  );
}
```

### 3d. Profile Tab

**File:** `app/(tabs)/profile.tsx`

```tsx
// app/(tabs)/profile.tsx
import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Header } from "@/components/common/Header";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Avatar } from "@/components/common/Avatar";

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <Header title="Profile" showAvatar={false} />
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View className="items-center mt-4 mb-8">
          <Avatar size="lg" />
          <Text className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-4">
            Zuno User
          </Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sign in to sync your content
          </Text>
        </View>

        {/* Theme Section */}
        <View className="mb-6">
          <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            Appearance
          </Text>
          <ThemeToggle />
        </View>

        {/* Placeholder sections */}
        <View className="bg-white dark:bg-card-dark rounded-2xl p-5 mb-4">
          <Text className="font-semibold text-slate-800 dark:text-white mb-1">
            Account
          </Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            Sign in with Phone or Google (Phase 8)
          </Text>
        </View>

        <View className="bg-white dark:bg-card-dark rounded-2xl p-5 mb-4">
          <Text className="font-semibold text-slate-800 dark:text-white mb-1">
            Notifications
          </Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            Configure notification preferences
          </Text>
        </View>

        <View className="bg-white dark:bg-card-dark rounded-2xl p-5 mb-4">
          <Text className="font-semibold text-slate-800 dark:text-white mb-1">
            About Zuno
          </Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            Version 1.0.0
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
```

---

## Step 4: Create the Auth Route Group

These screens will be fully implemented in Phase 8, but we create the structure now.

### 4a. Auth Layout

**File:** `app/(auth)/_layout.tsx`

```tsx
// app/(auth)/_layout.tsx
import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
```

### 4b. Login Screen (Placeholder)

**File:** `app/(auth)/login.tsx`

```tsx
// app/(auth)/login.tsx
import React from "react";
import { View, Text } from "react-native";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-6">
      <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        Welcome to Zuno
      </Text>
      <Text className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8">
        Sign in to sync your content across devices.
      </Text>

      <PrimaryButton
        label="Continue with Phone"
        onPress={() => router.push("/(auth)/verify")}
      />

      <View className="mt-4 w-full">
        <PrimaryButton
          label="Skip for now"
          variant="outline"
          onPress={() => router.replace("/(tabs)")}
        />
      </View>
    </View>
  );
}
```

### 4c. Verify OTP Screen (Placeholder)

**File:** `app/(auth)/verify.tsx`

```tsx
// app/(auth)/verify.tsx
import React from "react";
import { View, Text } from "react-native";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { useRouter } from "expo-router";

export default function VerifyScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-6">
      <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        Enter OTP
      </Text>
      <Text className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8">
        OTP verification will be implemented in Phase 8.
      </Text>

      <PrimaryButton
        label="Verify (Placeholder)"
        onPress={() => router.replace("/(tabs)")}
      />
    </View>
  );
}
```

---

## Step 5: Update Root Layout for Navigation

Update `app/_layout.tsx` to use a `Stack` navigator at the root level:

```tsx
// app/_layout.tsx
import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useThemeStore } from "@/stores/themeStore";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const { isDark, initialize } = useThemeStore();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    initialize();
  }, []);

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-background-light items-center justify-center">
        <ActivityIndicator size="large" color="#4D96FF" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View
            className={`flex-1 ${isDark ? "dark" : ""}`}
            style={{ flex: 1 }}
          >
            <View className="flex-1 bg-background-light dark:bg-background-dark">
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "fade",
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
              </Stack>
              <StatusBar style={isDark ? "light" : "dark"} />
            </View>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
```

---

## Navigation Flow

```
app/
├── index.tsx              ← Splash screen (entry point)
│                            Auto-navigates to (tabs) after 2.5s
├── (auth)/
│   ├── _layout.tsx        ← Stack navigator for auth
│   ├── login.tsx          ← Phone/Google login
│   └── verify.tsx         ← OTP verification
│
└── (tabs)/
    ├── _layout.tsx        ← Bottom tab navigator
    ├── index.tsx          ← Home (Collections)
    ├── feed.tsx           ← Personalized Feed
    ├── vfeed.tsx          ← Reels-style VFeed
    └── profile.tsx        ← Profile & Settings

Flow:
  Splash → (tabs)/index (Home)
  Profile → "Sign In" → (auth)/login → (auth)/verify → (tabs)
```

---

## Verification Checklist

After completing all steps, verify each of the following:

- [ ] **Splash screen shows**: App opens with animated Zuno logo, divider, name, and tagline
- [ ] **Auto-navigation works**: After ~2.5 seconds, splash screen transitions to the Home tab
- [ ] **Bottom tabs render**: 4 tabs visible — Home, Feed, Reels, Profile
- [ ] **Tab icons render**: Each tab shows its correct icon
- [ ] **Active tab highlighting**: Active tab shows blue icon, inactive shows gray
- [ ] **Tab switching works**: Tapping each tab navigates to its screen
- [ ] **Home tab shows**: Header with "Zuno" title and placeholder content
- [ ] **Feed tab shows**: Header with "Feed" title and placeholder content
- [ ] **VFeed tab shows**: Dark background with placeholder text
- [ ] **Profile tab shows**: Avatar, theme toggle, and settings cards
- [ ] **Theme toggle works from Profile**: Changing theme in Profile affects all screens
- [ ] **Auth flow works**: From Profile, navigating to login and verify screens works
- [ ] **Back navigation works**: Can navigate back from auth screens
- [ ] **Dark mode works across all screens**: Tab bar, headers, and content update correctly
- [ ] **No flickering on navigation**: Transitions are smooth

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Tabs not showing | Ensure `(tabs)/_layout.tsx` uses `<Tabs>` from `expo-router` |
| Splash redirects instantly | Check that `setTimeout` has correct delay (2500ms) |
| Tab bar colors wrong in dark mode | The tab bar style must use `isDark` from the theme store |
| Icons not showing | Verify `Icon` component has all needed icons in `iconMap` |
| White flash between splash and tabs | Ensure root layout background matches splash background |

---

## What's Next

Once this phase is verified, proceed to **Phase 4 — Home Screen (Zuno Collections)** (`PHASE_04_HOME_SCREEN.md`).
