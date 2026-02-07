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
