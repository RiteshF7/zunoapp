// components/feed/FeedCard.tsx
import React from "react";
import { View, Text, Pressable, Linking, Share } from "react-native";
import { Image } from "expo-image";
import { cn } from "@/lib/utils";
import { ContentTypeBadge } from "./ContentTypeBadge";
import { PlatformBadge } from "./PlatformBadge";
import { FeedItem } from "@/types/feed";
import { useThemeStore } from "@/stores/themeStore";
import {
  Heart,
  Share2,
  ExternalLink,
  Sparkles,
} from "lucide-react-native";

interface FeedCardProps {
  item: FeedItem;
  isFavorited?: boolean;
  reason?: string | null;
  cardBg?: string;
  onFavoriteToggle?: (id: string) => void;
  onPress?: (id: string) => void;
}

export const FeedCard = React.memo(function FeedCard({
  item,
  isFavorited = false,
  reason,
  cardBg,
  onFavoriteToggle,
  onPress,
}: FeedCardProps) {
  const { isDark } = useThemeStore();

  const handleShare = () => {
    Share.share({
      message: `${item.title}\n${item.sourceUrl}`,
      url: item.sourceUrl,
    });
  };

  const handleOpen = () => {
    Linking.openURL(item.sourceUrl).catch(() => {});
  };

  // Extract a short domain for the source line
  const domain = (() => {
    try {
      return new URL(item.sourceUrl).hostname.replace("www.", "");
    } catch {
      return "";
    }
  })();

  return (
    <Pressable
      onPress={() => onPress?.(item.id)}
      style={({ pressed }) => ({
        backgroundColor: cardBg || (isDark ? "#2D2F31" : "#ffffff"),
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 16,
        marginHorizontal: 16,
        borderWidth: isDark ? 1 : 0,
        borderColor: isDark ? "rgba(255,255,255,0.06)" : "transparent",
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      {/* Thumbnail */}
      {item.imageUrl ? (
        <View style={{ padding: 10, paddingBottom: 0 }}>
          <View style={{ borderRadius: 8, overflow: "hidden" }}>
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: "100%", height: 170 }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />

            {/* Badges overlay */}
            <View className="absolute top-2.5 left-2.5 flex-row gap-1.5 items-center">
              <PlatformBadge platform={item.platform} />
              <ContentTypeBadge type={item.contentType} />
            </View>

            {/* Category badge */}
            {item.category ? (
              <View className="absolute top-2.5 right-2.5">
                <View className="bg-black/50 px-2.5 py-0.5 rounded-full">
                  <Text className="text-white text-[10px] font-semibold">
                    {item.category}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      ) : (
        /* No thumbnail — badges inline */
        <View className="px-3.5 pt-3.5 flex-row gap-1.5 items-center">
          <PlatformBadge platform={item.platform} />
          <ContentTypeBadge type={item.contentType} />
          {item.category ? (
            <View
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9",
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  color: isDark ? "#94a3b8" : "#64748b",
                }}
              >
                {item.category}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Content */}
      <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 }}>
        {/* Title — 2 lines */}
        <Text
          style={{
            fontWeight: "700",
            fontSize: 15,
            lineHeight: 20,
            color: isDark ? "#f1f5f9" : "#1e293b",
            marginBottom: 4,
          }}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {/* Description — 2 lines */}
        {item.description ? (
          <Text
            style={{
              fontSize: 13,
              lineHeight: 18,
              color: isDark ? "#94a3b8" : "#64748b",
              marginBottom: 8,
            }}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        ) : null}

        {/* Source domain */}
        {domain ? (
          <Text
            style={{
              fontSize: 11,
              color: isDark ? "#64748b" : "#94a3b8",
              marginBottom: 10,
            }}
            numberOfLines={1}
          >
            {domain}
          </Text>
        ) : null}

        {/* "Why this?" reason label */}
        {reason ? (
          <View className="flex-row items-center gap-1.5 mb-2.5">
            <Sparkles size={11} color="#4D96FF" />
            <Text style={{ fontSize: 11, color: "#4D96FF", fontWeight: "500", fontStyle: "italic" }}>
              {reason}
            </Text>
          </View>
        ) : null}

        {/* Quick Actions Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderTopWidth: 1,
            borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
            paddingTop: 12,
            marginTop: 4,
          }}
        >
          {/* Favorite */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              onFavoriteToggle?.(item.id);
            }}
            hitSlop={8}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Heart
              size={16}
              color={isFavorited ? "#ef4444" : (isDark ? "#64748b" : "#94a3b8")}
              fill={isFavorited ? "#ef4444" : "transparent"}
              strokeWidth={2}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: isFavorited ? "#ef4444" : (isDark ? "#64748b" : "#94a3b8"),
              }}
            >
              {isFavorited ? "Saved" : "Favorite"}
            </Text>
          </Pressable>

          {/* Share */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              handleShare();
            }}
            hitSlop={8}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Share2
              size={15}
              color={isDark ? "#64748b" : "#94a3b8"}
              strokeWidth={2}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: isDark ? "#64748b" : "#94a3b8",
              }}
            >
              Share
            </Text>
          </Pressable>

          {/* Open */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              handleOpen();
            }}
            hitSlop={8}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <ExternalLink
              size={15}
              color={isDark ? "#64748b" : "#94a3b8"}
              strokeWidth={2}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: isDark ? "#64748b" : "#94a3b8",
              }}
            >
              Open
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
});
