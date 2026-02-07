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
