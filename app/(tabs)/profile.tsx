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
