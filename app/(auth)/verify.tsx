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
