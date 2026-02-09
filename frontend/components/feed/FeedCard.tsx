// components/feed/FeedCard.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/common/Icon";
import { ContentTypeBadge } from "./ContentTypeBadge";
import { PlatformBadge } from "./PlatformBadge";
import { FeedItem } from "@/types/feed";
import { useThemeStore } from "@/stores/themeStore";

interface FeedCardProps {
  item: FeedItem;
  isBookmarked?: boolean;
  reason?: string | null;
  onBookmarkToggle?: (id: string) => void;
  onOpenSource?: (url: string) => void;
  onPress?: (id: string) => void;
}

export const FeedCard = React.memo(function FeedCard({
  item,
  isBookmarked,
  reason,
  onBookmarkToggle,
  onOpenSource,
  onPress,
}: FeedCardProps) {
  const { isDark } = useThemeStore();

  return (
    <Pressable
      onPress={() => onPress?.(item.id)}
      className="bg-white dark:bg-card-dark rounded-2xl overflow-hidden mb-4 mx-6"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {/* Thumbnail — only show if there's an image */}
      {item.imageUrl ? (
        <View className="relative">
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: "100%", height: 160 }}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />

          {/* Badges overlay */}
          <View className="absolute top-3 left-3 flex-row gap-2 items-center">
            <PlatformBadge platform={item.platform} />
            <ContentTypeBadge type={item.contentType} />
          </View>

          {/* Category badge */}
          {item.category ? (
            <View className="absolute top-3 right-3">
              <View className="bg-black/50 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-semibold">
                  {item.category}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      ) : (
        /* No thumbnail — show badges inline */
        <View className="px-4 pt-4 flex-row gap-2 items-center">
          <PlatformBadge platform={item.platform} />
          <ContentTypeBadge type={item.contentType} />
          {item.category ? (
            <View className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {item.category}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Content — kept minimal */}
      <View className="p-4">
        <Text
          className="font-bold text-slate-800 dark:text-white text-base leading-tight mb-1"
          numberOfLines={1}
        >
          {item.title}
        </Text>
        {item.description ? (
          <Text
            className="text-sm text-slate-500 dark:text-slate-400"
            numberOfLines={2}
          >
            {item.description}
          </Text>
        ) : null}

        {/* "Why this?" reason label */}
        {reason ? (
          <View className="flex-row items-center gap-1.5 mt-2">
            <Icon name="auto_awesome" size={12} color="#4D96FF" />
            <Text className="text-xs text-accent-blue font-medium italic">
              {reason}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
});
