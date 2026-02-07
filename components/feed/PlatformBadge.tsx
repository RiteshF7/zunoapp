// components/feed/PlatformBadge.tsx
import React from "react";
import { View, Text } from "react-native";
import { cn } from "@/lib/utils";
import { Platform as PlatformType } from "@/types/feed";

interface PlatformBadgeProps {
  platform: PlatformType;
  className?: string;
}

const platformConfig: Record<PlatformType, { label: string; color: string }> = {
  youtube: { label: "YT", color: "bg-red-500" },
  instagram: { label: "IG", color: "bg-pink-500" },
  twitter: { label: "X", color: "bg-slate-800 dark:bg-slate-200" },
  facebook: { label: "FB", color: "bg-blue-600" },
  linkedin: { label: "LI", color: "bg-blue-700" },
  tiktok: { label: "TT", color: "bg-slate-900" },
  reddit: { label: "RD", color: "bg-orange-500" },
  pinterest: { label: "PI", color: "bg-red-600" },
  spotify: { label: "SP", color: "bg-green-500" },
  medium: { label: "MD", color: "bg-slate-700" },
  other: { label: "WB", color: "bg-slate-500" },
};

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const config = platformConfig[platform] || platformConfig.other;

  return (
    <View
      className={cn(
        "w-6 h-6 rounded-full items-center justify-center",
        config.color,
        className
      )}
    >
      <Text className="text-white text-[8px] font-bold">
        {config.label}
      </Text>
    </View>
  );
}
