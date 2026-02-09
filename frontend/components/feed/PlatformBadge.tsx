// components/feed/PlatformBadge.tsx
import React from "react";
import { View, Text } from "react-native";
import { cn } from "@/lib/utils";
import { Platform as PlatformType } from "@/types/feed";
import {
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Linkedin,
  Globe,
  MessageCircle,
  Disc3,
  Rss,
  type LucideIcon,
} from "lucide-react-native";

interface PlatformBadgeProps {
  platform: PlatformType;
  className?: string;
}

const platformConfig: Record<
  PlatformType,
  { label: string; bg: string; icon: LucideIcon }
> = {
  youtube: { label: "YouTube", bg: "#FF0000", icon: Youtube },
  instagram: { label: "Instagram", bg: "#E1306C", icon: Instagram },
  twitter: { label: "X", bg: "#14171A", icon: Twitter },
  facebook: { label: "Facebook", bg: "#1877F2", icon: Facebook },
  linkedin: { label: "LinkedIn", bg: "#0A66C2", icon: Linkedin },
  tiktok: { label: "TikTok", bg: "#111111", icon: Disc3 },
  reddit: { label: "Reddit", bg: "#FF4500", icon: MessageCircle },
  pinterest: { label: "Pinterest", bg: "#E60023", icon: Rss },
  spotify: { label: "Spotify", bg: "#1DB954", icon: Disc3 },
  medium: { label: "Medium", bg: "#333333", icon: Globe },
  other: { label: "Web", bg: "#64748b", icon: Globe },
};

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const config = platformConfig[platform] || platformConfig.other;
  const IconComponent = config.icon;

  return (
    <View
      className={cn(
        "flex-row items-center gap-1 px-2.5 py-1 rounded-full",
        className
      )}
      style={{ backgroundColor: config.bg }}
    >
      <IconComponent size={10} color="#fff" strokeWidth={2.5} />
      <Text className="text-white text-[10px] font-bold">
        {config.label}
      </Text>
    </View>
  );
}
