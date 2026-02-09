// components/common/ErrorBoundary.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Icon } from "./Icon";

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-6">
      <View className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 items-center justify-center mb-4">
        <Icon name="close" size={32} color="#ef4444" />
      </View>
      <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 text-center">
        Something went wrong
      </Text>
      <Text className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
        {error?.message || "An unexpected error occurred. Please try again."}
      </Text>
      {resetError && (
        <Pressable
          onPress={resetError}
          className="bg-accent-blue px-6 py-3 rounded-full active:scale-95"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </Pressable>
      )}
    </View>
  );
}
