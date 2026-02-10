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
              if (!isAuthenticated) {
                router.push("/(auth)/login");
              } else {
                router.replace("/(tabs)/profile");
              }
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
            onPress={() => router.replace("/(tabs)/feed")}
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
