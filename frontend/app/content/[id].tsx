// app/content/[id].tsx — Full content detail view with AI structured content
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
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
import type { AiStructuredContent } from "@/types/supabase";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ContentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeStore();
  const [showOriginal, setShowOriginal] = useState(false);

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

  const toggleOriginal = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowOriginal((prev) => !prev);
  }, []);

  // Extract tags from nested content_tags structure
  const tags: { name: string; slug: string }[] =
    content?.content_tags
      ?.map((ct: any) => ct.tag)
      .filter(Boolean) ?? [];

  const structured: AiStructuredContent | null =
    content?.ai_structured_content ?? null;

  const hasStructuredContent =
    structured &&
    (structured.key_points?.length > 0 ||
      structured.action_items?.length > 0 ||
      structured.tldr);

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
          {content.title || "Content Detail"}
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
            style={{ width: "100%", height: 200 }}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        ) : null}

        <View className="px-6 pt-5">
          {/* Platform + Category Row */}
          <View className="flex-row gap-2 items-center mb-3">
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
          <Text className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-1">
            {content.title || "Untitled"}
          </Text>

          {/* Date */}
          <Text className="text-xs text-slate-400 dark:text-slate-500 mb-5">
            Saved {formatDate(content.created_at)}
          </Text>

          {/* =========================================================== */}
          {/* AI STRUCTURED CONTENT — default view                        */}
          {/* =========================================================== */}
          {hasStructuredContent ? (
            <View>
              {/* Save Motive Badge */}
              {structured.save_motive ? (
                <View
                  className="flex-row items-center gap-2 mb-4 px-4 py-3 rounded-2xl"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(77,150,255,0.12)"
                      : "rgba(77,150,255,0.08)",
                  }}
                >
                  <Icon name="target" size={16} color="#4D96FF" />
                  <Text className="text-sm font-medium text-accent-blue flex-1">
                    {structured.save_motive}
                  </Text>
                </View>
              ) : null}

              {/* TL;DR */}
              {structured.tldr ? (
                <View className="mb-5">
                  <View className="flex-row items-center gap-1.5 mb-2">
                    <Icon name="bolt" size={15} color="#4D96FF" />
                    <Text className="text-xs font-bold text-accent-blue uppercase tracking-wider">
                      TL;DR
                    </Text>
                  </View>
                  <Text className="text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                    {structured.tldr}
                  </Text>
                </View>
              ) : null}

              {/* Key Points */}
              {structured.key_points?.length > 0 ? (
                <View className="mb-5">
                  <View className="flex-row items-center gap-1.5 mb-3">
                    <Icon name="auto_awesome" size={15} color={isDark ? "#fbbf24" : "#d97706"} />
                    <Text
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: isDark ? "#fbbf24" : "#d97706" }}
                    >
                      Key Points
                    </Text>
                  </View>
                  {structured.key_points.map((point, idx) => (
                    <View
                      key={idx}
                      className="flex-row mb-2.5"
                    >
                      <View
                        className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5"
                        style={{
                          backgroundColor: isDark
                            ? "rgba(251,191,36,0.15)"
                            : "rgba(217,119,6,0.1)",
                        }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{ color: isDark ? "#fbbf24" : "#d97706" }}
                        >
                          {idx + 1}
                        </Text>
                      </View>
                      <Text className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
                        {point}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Action Items */}
              {structured.action_items?.length > 0 ? (
                <View className="mb-5">
                  <View className="flex-row items-center gap-1.5 mb-3">
                    <Icon name="checklist" size={15} color={isDark ? "#34d399" : "#059669"} />
                    <Text
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: isDark ? "#34d399" : "#059669" }}
                    >
                      Action Items
                    </Text>
                  </View>
                  {structured.action_items.map((item, idx) => (
                    <View
                      key={idx}
                      className="flex-row mb-2.5"
                    >
                      <View
                        className="w-6 h-6 rounded-md items-center justify-center mr-3 mt-0.5"
                        style={{
                          backgroundColor: isDark
                            ? "rgba(52,211,153,0.15)"
                            : "rgba(5,150,105,0.1)",
                        }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{ color: isDark ? "#34d399" : "#059669" }}
                        >
                          {idx + 1}
                        </Text>
                      </View>
                      <Text className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : (
            /* Fallback: show legacy ai_summary if no structured content */
            content.ai_summary ? (
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
            ) : null
          )}

          {/* =========================================================== */}
          {/* ORIGINAL CONTENT INFO — collapsible section                  */}
          {/* =========================================================== */}
          <Pressable
            onPress={toggleOriginal}
            className="flex-row items-center justify-between py-3 mt-1 mb-2"
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View className="flex-row items-center gap-2">
              <Icon name="info" size={16} color={isDark ? "#94a3b8" : "#64748b"} />
              <Text className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {showOriginal ? "Hide" : "View"} Original Content Info
              </Text>
            </View>
            <Icon
              name={showOriginal ? "expand_less" : "expand_more"}
              size={20}
              color={isDark ? "#94a3b8" : "#64748b"}
            />
          </Pressable>

          {showOriginal ? (
            <View
              className="rounded-2xl p-4 mb-4"
              style={{
                backgroundColor: isDark ? "#23252799" : "#f1f5f999",
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#e2e8f0",
              }}
            >
              {/* Description */}
              {content.description ? (
                <View className="mb-4">
                  <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Original Description
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
              <View>
                <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Source
                </Text>
                <Pressable
                  onPress={handleOpenSource}
                  className="flex-row items-center gap-2"
                >
                  <Icon name="open_in_new" size={14} color="#4D96FF" />
                  <Text
                    className="text-sm text-accent-blue flex-1"
                    numberOfLines={2}
                  >
                    {content.url}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* Open Original button */}
          <Pressable
            onPress={handleOpenSource}
            className="bg-slate-900 dark:bg-slate-200 py-4 rounded-full items-center mt-2"
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <View className="flex-row items-center gap-2">
              <Icon
                name="open_in_new"
                size={18}
                color={isDark ? "#1e293b" : "#ffffff"}
              />
              <Text className="text-base font-semibold text-white dark:text-slate-900">
                Open Original
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
