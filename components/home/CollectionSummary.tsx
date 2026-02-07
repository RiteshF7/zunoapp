// components/home/CollectionSummary.tsx
import React from "react";
import { View, Text } from "react-native";
import { Collection } from "@/types/content";

interface CollectionSummaryProps {
  collections: Collection[];
}

export function CollectionSummary({ collections }: CollectionSummaryProps) {
  const totalItems = collections.reduce((sum, c) => sum + c.count, 0);

  return (
    <View className="px-6 py-3 flex-row items-center justify-between">
      <Text className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {collections.length} collections
      </Text>
      <Text className="text-sm text-slate-400 dark:text-slate-500">
        {totalItems} total items
      </Text>
    </View>
  );
}
