// app/(tabs)/_layout.tsx
import React from "react";
import { View, Pressable, Platform, StyleSheet } from "react-native";
import { Tabs, useRouter, usePathname } from "expo-router";
import { BlurView } from "expo-blur";
import { Home, Plus, User } from "lucide-react-native";
import { useThemeStore } from "@/stores/themeStore";
import { useProtectedRoute } from "@/hooks/useAuth";

function FloatingTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useThemeStore();

  const activeColor = "#ffffff";
  const inactiveColor = "rgba(255,255,255,0.40)";

  const isActive = (route: string) => {
    if (route === "/") return pathname === "/" || pathname === "/index";
    return pathname === route || pathname.startsWith(route + "/");
  };

  return (
    <View style={styles.outer} pointerEvents="box-none">
      <View style={styles.pill}>
        {/* Blur background */}
        <BlurView
          intensity={isDark ? 40 : 60}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        {/* Dark tint overlay */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? "rgba(20, 22, 26, 0.78)"
                : "rgba(30, 41, 59, 0.70)",
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
                ? "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.12)",
            },
          ]}
        />

        {/* Icons row — 3 items: Home, +, Profile */}
        <View style={styles.row}>
          {/* Home */}
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={[
              styles.iconBtn,
              isActive("/") && styles.iconBtnActive,
            ]}
          >
            <Home
              size={20}
              color={isActive("/") ? activeColor : inactiveColor}
              strokeWidth={2}
              fill={isActive("/") ? activeColor : "transparent"}
            />
          </Pressable>

          {/* Add — plain icon, no circle bg */}
          <Pressable
            onPress={() => router.push("/add-content")}
            style={styles.addBtn}
          >
            <Plus
              size={22}
              color={inactiveColor}
              strokeWidth={2.5}
            />
          </Pressable>

          {/* Profile */}
          <Pressable
            onPress={() => router.replace("/(tabs)/profile")}
            style={[
              styles.iconBtn,
              isActive("/profile") && styles.iconBtnActive,
            ]}
          >
            <User
              size={20}
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
    borderRadius: 40,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
  },
  border: {
    borderRadius: 40,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 4,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnActive: {
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  addBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
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
