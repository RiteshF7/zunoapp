// components/home/CollectionCard.tsx
import React from "react";
import { Pressable, View, Text } from "react-native";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/common/Icon";
import { COLLECTION_THEMES, CollectionTheme } from "@/lib/constants";
import { useThemeStore } from "@/stores/themeStore";

interface CollectionCardProps {
  title: string;
  count: number;
  icon: string;
  theme: CollectionTheme;
  onPress?: () => void;
}

export function CollectionCard({
  title,
  count,
  icon,
  theme,
  onPress,
}: CollectionCardProps) {
  const themeColors = COLLECTION_THEMES[theme] || COLLECTION_THEMES.blue;
  const { isDark } = useThemeStore();

  // Map theme to actual colors for the icon
  const iconColorMap: Record<string, { light: string; dark: string }> = {
    blue: { light: "#2563eb", dark: "#60a5fa" },
    green: { light: "#16a34a", dark: "#4ade80" },
    purple: { light: "#9333ea", dark: "#c084fc" },
    amber: { light: "#d97706", dark: "#fbbf24" },
    rose: { light: "#e11d48", dark: "#fb7185" },
    indigo: { light: "#4f46e5", dark: "#818cf8" },
  };

  const colors = iconColorMap[theme] || iconColorMap.blue;

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "p-5 rounded-2xl flex-col justify-between h-48",
        themeColors.bgLight,
        themeColors.bgDark
      )}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      {/* Icon */}
      <View
        className={cn(
          "w-12 h-12 rounded-xl items-center justify-center mb-4",
          themeColors.iconBgLight,
          themeColors.iconBgDark
        )}
      >
        <Icon
          name={icon}
          size={24}
          color={isDark ? colors.dark : colors.light}
        />
      </View>

      {/* Content */}
      <View>
        <Text className="font-bold text-slate-800 dark:text-white text-lg leading-tight mb-1">
          {title}
        </Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400">
          {count} items
        </Text>
      </View>
    </Pressable>
  );
}
