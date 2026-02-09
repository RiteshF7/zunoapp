// app/(tabs)/_layout.tsx
import React from "react";
import { View, Pressable, Platform, StyleSheet } from "react-native";
import { Tabs, useRouter, usePathname } from "expo-router";
import { BlurView } from "expo-blur";
import { Home, Sparkles, Plus, User } from "lucide-react-native";
import { useThemeStore } from "@/stores/themeStore";
import { useProtectedRoute } from "@/hooks/useAuth";

function FloatingTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useThemeStore();

  const activeColor = "#ffffff";
  const inactiveColor = isDark ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.45)";

  const isActive = (route: string) => {
    if (route === "/") return pathname === "/" || pathname === "/index";
    return pathname === route || pathname.startsWith(route + "/");
  };

  return (
    <View style={styles.outer} pointerEvents="box-none">
      <View style={styles.pill}>
        {/* Blur background */}
        <BlurView
          intensity={isDark ? 50 : 70}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        {/* Dark tint overlay */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? "rgba(22, 24, 28, 0.72)"
                : "rgba(15, 23, 42, 0.62)",
            },
          ]}
        />
        {/* Subtle border */}
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.border,
            {
              borderColor: isDark
                ? "rgba(255,255,255,0.07)"
                : "rgba(255,255,255,0.10)",
            },
          ]}
        />

        {/* Icons row */}
        <View style={styles.row}>
          {/* Home */}
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={({ pressed }) => ([
              styles.iconBtn,
              isActive("/") && styles.iconBtnActive,
              { transform: [{ scale: pressed ? 0.88 : 1 }] },
            ])}
          >
            <Home
              size={22}
              color={isActive("/") ? activeColor : inactiveColor}
              strokeWidth={2}
              fill={isActive("/") ? activeColor : "transparent"}
            />
          </Pressable>

          {/* Feed */}
          <Pressable
            onPress={() => router.replace("/(tabs)/feed")}
            style={({ pressed }) => ([
              styles.iconBtn,
              isActive("/feed") && styles.iconBtnActive,
              { transform: [{ scale: pressed ? 0.88 : 1 }] },
            ])}
          >
            <Sparkles
              size={22}
              color={isActive("/feed") ? activeColor : inactiveColor}
              strokeWidth={2}
              fill={isActive("/feed") ? activeColor : "transparent"}
            />
          </Pressable>

          {/* Add */}
          <Pressable
            onPress={() => router.push("/add-content")}
            style={({ pressed }) => ([
              styles.iconBtn,
              { transform: [{ scale: pressed ? 0.88 : 1 }] },
            ])}
          >
            <Plus
              size={26}
              color={inactiveColor}
              strokeWidth={2}
            />
          </Pressable>

          {/* Profile */}
          <Pressable
            onPress={() => router.replace("/(tabs)/profile")}
            style={({ pressed }) => ([
              styles.iconBtn,
              isActive("/profile") && styles.iconBtnActive,
              { transform: [{ scale: pressed ? 0.88 : 1 }] },
            ])}
          >
            <User
              size={22}
              color={isActive("/profile") ? activeColor : inactiveColor}
              strokeWidth={2}
              fill={isActive("/profile") ? activeColor : "transparent"}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 28 : 18,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  pill: {
    borderRadius: 36,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 18,
  },
  border: {
    borderRadius: 36,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 6,
  },
  iconBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnActive: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});

export default function TabLayout() {
  useProtectedRoute();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="feed" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="vfeed" options={{ href: null }} />
      </Tabs>
      <FloatingTabBar />
    </View>
  );
}
