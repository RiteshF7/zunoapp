// app/content/[id].tsx — Full content detail view
import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Icon } from "@/components/common/Icon";
import { IconButton } from "@/components/common/IconButton";
import { ContentTypeBadge } from "@/components/feed/ContentTypeBadge";
import { PlatformBadge } from "@/components/feed/PlatformBadge";
import { contentService } from "@/services/content.service";
import { useThemeStore } from "@/stores/themeStore";

export default function ContentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeStore();

  const { data: content, isLoading } = useQuery({
    queryKey: ["content", id],
    queryFn: () => contentService.getContentWithTags(id!),
    enabled: !!id,
  });

  const handleOpenSource = useCallback(() => {
    if (content?.url) {
      Linking.openURL(content.url).catch((err) =>
        console.warn("Failed to open URL:", err)
      );
    }
  }, [content?.url]);

  // Extract tags from nested content_tags structure
  const tags: { name: string; slug: string }[] =
    content?.content_tags
      ?.map((ct: any) => ct.tag)
      .filter(Boolean) ?? [];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" color="#4D96FF" />
      </View>
    );
  }

  if (!content) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-6">
        <Text className="text-lg font-semibold text-slate-400 dark:text-slate-500">
          Content not found
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="px-4 pb-3 flex-row items-center justify-between bg-background-light/80 dark:bg-background-dark/80"
      >
        <IconButton onPress={() => router.back()}>
          <Icon
            name="arrow_back"
            size={22}
            color={isDark ? "#e2e8f0" : "#1e293b"}
          />
        </IconButton>
        <Text
          className="text-base font-semibold text-slate-900 dark:text-slate-100 flex-1 text-center"
          numberOfLines={1}
        >
          Content Detail
        </Text>
        <IconButton onPress={handleOpenSource}>
          <Icon
            name="open_in_new"
            size={20}
            color={isDark ? "#e2e8f0" : "#1e293b"}
          />
        </IconButton>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Thumbnail */}
        {content.thumbnail_url ? (
          <Image
            source={{ uri: content.thumbnail_url }}
            style={{ width: "100%", height: 220 }}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        ) : null}

        <View className="px-6 pt-5">
          {/* Platform + Type badges */}
          <View className="flex-row gap-2 items-center mb-4">
            <PlatformBadge platform={(content.platform || "other") as any} />
            <ContentTypeBadge type={(content.content_type || "post") as any} />
            {content.ai_category ? (
              <View className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {content.ai_category}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-3">
            {content.title || "Untitled"}
          </Text>

          {/* Date */}
          <Text className="text-xs text-slate-400 dark:text-slate-500 mb-4">
            Saved {formatDate(content.created_at)}
          </Text>

          {/* AI Summary */}
          {content.ai_summary ? (
            <View className="bg-accent-blue/10 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center gap-1.5 mb-2">
                <Icon name="auto_awesome" size={14} color="#4D96FF" />
                <Text className="text-xs font-semibold text-accent-blue">
                  AI Summary
                </Text>
              </View>
              <Text className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {content.ai_summary}
              </Text>
            </View>
          ) : null}

          {/* Description — full text, no line limit */}
          {content.description ? (
            <View className="mb-4">
              <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Description
              </Text>
              <Text className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {content.description}
              </Text>
            </View>
          ) : null}

          {/* Tags */}
          {tags.length > 0 ? (
            <View className="mb-4">
              <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Tags
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {tags.map((tag) => (
                  <View
                    key={tag.slug}
                    className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full"
                  >
                    <Text className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      #{tag.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Source URL */}
          <View className="mb-4">
            <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Source
            </Text>
            <Pressable
              onPress={handleOpenSource}
              className="flex-row items-center gap-2"
            >
              <Icon
                name="open_in_new"
                size={14}
                color="#4D96FF"
              />
              <Text
                className="text-sm text-accent-blue flex-1"
                numberOfLines={2}
              >
                {content.url}
              </Text>
            </Pressable>
          </View>

          {/* Open in App button */}
          <Pressable
            onPress={handleOpenSource}
            className="bg-slate-900 dark:bg-slate-200 py-4 rounded-full items-center mt-2"
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <Text className="text-base font-semibold text-white dark:text-slate-900">
              Open Original
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
