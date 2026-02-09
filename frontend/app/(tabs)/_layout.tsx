// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Icon } from "@/components/common/Icon";
import { useThemeStore } from "@/stores/themeStore";
import { useProtectedRoute } from "@/hooks/useAuth";

export default function TabLayout() {
  const { isDark } = useThemeStore();
  useProtectedRoute();

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
