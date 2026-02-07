// components/home/CollectionsGrid.tsx
import React from "react";
import { View } from "react-native";
import { CollectionCard } from "./CollectionCard";
import { Collection } from "@/types/content";

interface CollectionsGridProps {
  collections: Collection[];
  onCollectionPress?: (id: string) => void;
}

export function CollectionsGrid({
  collections,
  onCollectionPress,
}: CollectionsGridProps) {
  return (
    <View className="px-6 flex-row flex-wrap gap-4">
      {collections.map((collection) => (
        <View key={collection.id} style={{ width: "47.5%" }}>
          <CollectionCard
            title={collection.title}
            count={collection.count}
            icon={collection.icon}
            theme={collection.theme}
            onPress={() => onCollectionPress?.(collection.id)}
          />
        </View>
      ))}
    </View>
  );
}
