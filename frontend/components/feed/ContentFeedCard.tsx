// components/feed/ContentFeedCard.tsx
import React from "react";
import { View, Text, Pressable, Linking, Share } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Content } from "@/types/supabase";
import { Platform as PlatformType, ContentType } from "@/types/feed";
import { PlatformBadge } from "./PlatformBadge";
import { ContentTypeBadge } from "./ContentTypeBadge";
import { useThemeStore } from "@/stores/themeStore";
import {
  Share2,
  ExternalLink,
  Clock,
  Sparkles,
} from "lucide-react-native";

interface ContentFeedCardProps {
  item: Content;
  onPress?: (id: string) => void;
}

/** Human-readable relative time (e.g. "2h ago", "3d ago") */
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export const ContentFeedCard = React.memo(function ContentFeedCard({
  item,
  onPress,
}: ContentFeedCardProps) {
  const { isDark } = useThemeStore();
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress(item.id);
    } else {
      router.push(`/content/${item.id}`);
    }
  };

  const handleShare = () => {
    Share.share({
      message: `${item.title ?? item.url}\n${item.url}`,
      url: item.url,
    });
  };

  const handleOpenUrl = () => {
    Linking.openURL(item.url).catch(() => {});
  };

  // Extract domain from URL
  const domain = (() => {
    try {
      return new URL(item.url).hostname.replace("www.", "");
    } catch {
      return "";
    }
  })();

  // Safely cast platform / content_type to the badge union types
  const platform = (item.platform || "other") as PlatformType;
  const contentType = (item.content_type || "post") as ContentType;

  // Choose best description: AI summary → description → null
  const summary = item.ai_summary || item.description;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        backgroundColor: isDark ? "#2D2F31" : "#ffffff",
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 12,
        marginHorizontal: 16,
        borderWidth: isDark ? 1 : 0,
        borderColor: isDark ? "rgba(255,255,255,0.06)" : "transparent",
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      {/* Thumbnail */}
      {item.thumbnail_url ? (
        <View style={{ padding: 10, paddingBottom: 0 }}>
          <View style={{ borderRadius: 10, overflow: "hidden" }}>
            <Image
              source={{ uri: item.thumbnail_url }}
              style={{ width: "100%", height: 180 }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />

            {/* Badges overlay on thumbnail */}
            <View
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                flexDirection: "row",
                gap: 6,
                alignItems: "center",
              }}
            >
              <PlatformBadge platform={platform} />
              <ContentTypeBadge type={contentType} />
            </View>

            {/* Category badge top-right */}
            {item.ai_category ? (
              <View style={{ position: "absolute", top: 10, right: 10 }}>
                <View
                  style={{
                    backgroundColor: "rgba(0,0,0,0.5)",
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: "600",
                    }}
                  >
                    {item.ai_category}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      ) : (
        /* No thumbnail — inline badges */
        <View
          style={{
            paddingHorizontal: 14,
            paddingTop: 14,
            flexDirection: "row",
            gap: 6,
            alignItems: "center",
          }}
        >
          <PlatformBadge platform={platform} />
          <ContentTypeBadge type={contentType} />
          {item.ai_category ? (
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
                {item.ai_category}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Content body */}
      <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 }}>
        {/* Title */}
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
          {item.title || "Untitled"}
        </Text>

        {/* AI summary / description */}
        {summary ? (
          <Text
            style={{
              fontSize: 13,
              lineHeight: 18,
              color: isDark ? "#94a3b8" : "#64748b",
              marginBottom: 8,
            }}
            numberOfLines={2}
          >
            {summary}
          </Text>
        ) : null}

        {/* Meta row: domain + time */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          {domain ? (
            <Text
              style={{
                fontSize: 11,
                color: isDark ? "#64748b" : "#94a3b8",
              }}
              numberOfLines={1}
            >
              {domain}
            </Text>
          ) : null}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Clock size={10} color={isDark ? "#64748b" : "#94a3b8"} strokeWidth={2} />
            <Text
              style={{
                fontSize: 11,
                color: isDark ? "#64748b" : "#94a3b8",
              }}
            >
              {timeAgo(item.created_at)}
            </Text>
          </View>
        </View>

        {/* AI processed indicator */}
        {item.ai_processed && item.ai_structured_content?.tldr ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              marginBottom: 10,
            }}
          >
            <Sparkles size={11} color="#4D96FF" />
            <Text
              style={{
                fontSize: 11,
                color: "#4D96FF",
                fontWeight: "500",
                fontStyle: "italic",
                flex: 1,
              }}
              numberOfLines={1}
            >
              {item.ai_structured_content.tldr}
            </Text>
          </View>
        ) : null}

        {/* Quick actions row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            borderTopWidth: 1,
            borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
            paddingTop: 12,
            marginTop: 2,
            gap: 20,
          }}
        >
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

          {/* Open in browser */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              handleOpenUrl();
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
