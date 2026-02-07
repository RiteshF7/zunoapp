// components/feed/FeedCard.tsx
import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/common/Icon";
import { ContentTypeBadge } from "./ContentTypeBadge";
import { PlatformBadge } from "./PlatformBadge";
import { FeedItem } from "@/types/feed";
import { useThemeStore } from "@/stores/themeStore";

interface FeedCardProps {
  item: FeedItem;
  isBookmarked: boolean;
  onBookmarkToggle: (id: string) => void;
  onOpenSource: (url: string) => void;
}

export function FeedCard({
  item,
  isBookmarked,
  onBookmarkToggle,
  onOpenSource,
}: FeedCardProps) {
  const { isDark } = useThemeStore();

  const formatLikes = (likes: number): string => {
    if (likes >= 1000) {
      return `${(likes / 1000).toFixed(1)}k`;
    }
    return likes.toString();
  };

  return (
    <Pressable
      className="bg-white dark:bg-card-dark rounded-2xl overflow-hidden mb-4 mx-6"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {/* Thumbnail */}
      <View className="relative">
        <Image
          source={{ uri: item.imageUrl }}
          className="w-full h-48"
          resizeMode="cover"
        />

        {/* Badges overlay */}
        <View className="absolute top-3 left-3 flex-row gap-2 items-center">
          <PlatformBadge platform={item.platform} />
          <ContentTypeBadge type={item.contentType} />
        </View>

        {/* Category badge */}
        <View className="absolute top-3 right-3">
          <View className="bg-black/50 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">
              {item.category}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        <Text className="font-bold text-slate-800 dark:text-white text-base leading-tight mb-1">
          {item.title}
        </Text>
        <Text
          className="text-sm text-slate-500 dark:text-slate-400 mb-3"
          numberOfLines={2}
        >
          {item.description}
        </Text>

        {/* Actions Row */}
        <View className="flex-row items-center justify-between">
          {/* Likes */}
          <View className="flex-row items-center gap-1.5">
            <Icon
              name="favorite"
              size={16}
              color={isDark ? "#94a3b8" : "#94a3b8"}
            />
            <Text className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {formatLikes(item.likes)}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => onOpenSource(item.sourceUrl)}
              className="flex-row items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-full"
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <Icon
                name="open_in_new"
                size={14}
                color={isDark ? "#94a3b8" : "#64748b"}
              />
              <Text className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Open
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onBookmarkToggle(item.id)}
              className={cn(
                "p-2 rounded-full",
                isBookmarked
                  ? "bg-accent-blue/20"
                  : "bg-slate-100 dark:bg-slate-800"
              )}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <Icon
                name="bookmark"
                size={16}
                color={isBookmarked ? "#4D96FF" : (isDark ? "#94a3b8" : "#64748b")}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
