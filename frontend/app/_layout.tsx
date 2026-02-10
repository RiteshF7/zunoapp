// app/_layout.tsx
import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { useUserPreferencesStore } from "@/stores/userPreferencesStore";
import { supabase } from "@/lib/supabase";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

// Manrope variable font – loaded as multiple weight aliases
const ManropeFont = require("@/assets/fonts/Manrope-VariableFont.ttf");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours for persistence
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "zuno-query-cache",
});

export default function RootLayout() {
  const { isDark, initialize } = useThemeStore();
  const { setSession, initialize: initAuth } = useAuthStore();
  const { initialize: initConfig } = useConfigStore();
  const { initialize: initUserPrefs } = useUserPreferencesStore();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Manrope_400Regular: ManropeFont,
    Manrope_500Medium: ManropeFont,
    Manrope_600SemiBold: ManropeFont,
    Manrope_700Bold: ManropeFont,
    Manrope_800ExtraBold: ManropeFont,
  });

  useEffect(() => {
    initialize();

    // Fetch remote app config (public, no auth needed)
    initConfig();

    // Initialize auth
    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        // Fetch per-user preferences once authenticated
        if (session) {
          initUserPrefs();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <View className="flex-1 bg-background-light items-center justify-center">
        <ActivityIndicator size="large" color="#4D96FF" />
      </View>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
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
                <Stack.Screen
                  name="add-content"
                  options={{
                    animation: "slide_from_right",
                  }}
                />
                <Stack.Screen
                  name="search"
                  options={{
                    presentation: "modal",
                    animation: "slide_from_bottom",
                  }}
                />
                <Stack.Screen
                  name="collection/[id]"
                  options={{
                    animation: "slide_from_right",
                  }}
                />
                <Stack.Screen
                  name="content/[id]"
                  options={{
                    animation: "slide_from_right",
                  }}
                />
              </Stack>
              <StatusBar style={isDark ? "light" : "dark"} />
            </View>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </PersistQueryClientProvider>
  );
}
