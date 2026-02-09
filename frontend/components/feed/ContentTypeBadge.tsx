// components/feed/ContentTypeBadge.tsx
import React from "react";
import { View, Text } from "react-native";
import { cn } from "@/lib/utils";
import { ContentType } from "@/types/feed";

interface ContentTypeBadgeProps {
  type: ContentType;
  className?: string;
}

const badgeConfig: Record<ContentType, { label: string; color: string; bgColor: string }> = {
  video: { label: "Video", color: "text-red-700 dark:text-red-300", bgColor: "bg-red-100 dark:bg-red-900/40" },
  reel: { label: "Reel", color: "text-pink-700 dark:text-pink-300", bgColor: "bg-pink-100 dark:bg-pink-900/40" },
  article: { label: "Article", color: "text-blue-700 dark:text-blue-300", bgColor: "bg-blue-100 dark:bg-blue-900/40" },
  thread: { label: "Thread", color: "text-purple-700 dark:text-purple-300", bgColor: "bg-purple-100 dark:bg-purple-900/40" },
  post: { label: "Post", color: "text-green-700 dark:text-green-300", bgColor: "bg-green-100 dark:bg-green-900/40" },
  image: { label: "Image", color: "text-amber-700 dark:text-amber-300", bgColor: "bg-amber-100 dark:bg-amber-900/40" },
  podcast: { label: "Podcast", color: "text-indigo-700 dark:text-indigo-300", bgColor: "bg-indigo-100 dark:bg-indigo-900/40" },
  audio: { label: "Audio", color: "text-teal-700 dark:text-teal-300", bgColor: "bg-teal-100 dark:bg-teal-900/40" },
};

export function ContentTypeBadge({ type, className }: ContentTypeBadgeProps) {
  const config = badgeConfig[type] || badgeConfig.post;

  return (
    <View className={cn("px-2.5 py-1 rounded-full", config.bgColor, className)}>
      <Text className={cn("text-xs font-semibold", config.color)}>
        {config.label}
      </Text>
    </View>
  );
}
