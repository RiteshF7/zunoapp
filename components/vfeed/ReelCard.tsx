// components/vfeed/ReelCard.tsx
import React from "react";
import { View, Text, Pressable, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/common/Icon";
import { FeedItem } from "@/types/feed";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ReelCardProps {
  item: FeedItem;
  onOpenSource: (url: string) => void;
}

export function ReelCard({ item, onOpenSource }: ReelCardProps) {
  return (
    <View
      className="relative overflow-hidden"
      style={{ height: SCREEN_HEIGHT }}
    >
      {/* Background Image */}
      <Image
        source={{ uri: item.imageUrl }}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
        locations={[0, 0.5, 1]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "60%",
        }}
      />

      {/* Category Badge */}
      <View className="absolute top-16 left-6">
        <View className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full">
          <Text className="text-white text-xs font-semibold">
            {item.category}
          </Text>
        </View>
      </View>

      {/* Content Overlay */}
      <View className="absolute bottom-32 left-6 right-20">
        <Text className="text-white text-2xl font-bold mb-2 leading-tight">
          {item.title}
        </Text>
        <Text className="text-white/70 text-sm" numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      {/* Action Buttons (right side) */}
      <View className="absolute bottom-36 right-4 gap-6 items-center">
        <Pressable
          className="items-center"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.9 : 1 }],
          })}
        >
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
            <Icon name="favorite" size={22} color="#ffffff" />
          </View>
          <Text className="text-white text-xs mt-1">
            {item.likes >= 1000 ? `${(item.likes / 1000).toFixed(1)}k` : item.likes}
          </Text>
        </Pressable>

        <Pressable
          className="items-center"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.9 : 1 }],
          })}
        >
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
            <Icon name="bookmark" size={22} color="#ffffff" />
          </View>
          <Text className="text-white text-xs mt-1">Save</Text>
        </Pressable>

        <Pressable
          onPress={() => onOpenSource(item.sourceUrl)}
          className="items-center"
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.9 : 1 }],
          })}
        >
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
            <Icon name="open_in_new" size={22} color="#ffffff" />
          </View>
          <Text className="text-white text-xs mt-1">Open</Text>
        </Pressable>
      </View>
    </View>
  );
}
