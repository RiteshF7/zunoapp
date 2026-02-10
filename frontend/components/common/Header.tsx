// components/common/Header.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "@/lib/utils";
import { Avatar } from "./Avatar";
import { IconButton } from "./IconButton";
import { Icon } from "./Icon";
import { useThemeStore } from "@/stores/themeStore";

interface HeaderAction {
  icon: string;
  onPress: () => void;
  badge?: number;
}

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showAvatar?: boolean;
  actions?: HeaderAction[];
  className?: string;
}

export function Header({
  title = "Zuno",
  subtitle,
  showAvatar = true,
  actions = [],
  className,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeStore();
  const router = useRouter();

  return (
    <View
      className={cn(
        "px-6 py-4 flex-row items-center justify-between z-20",
        className
      )}
      style={{ paddingTop: insets.top + 16 }}
    >
      {/* Left side: Avatar + Title */}
      <View className="flex-row items-center gap-3">
        {showAvatar && (
          <Pressable onPress={() => router.replace("/(tabs)/profile")}>
            <Avatar />
          </Pressable>
        )}
        <View>
          {subtitle && (
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </Text>
          )}
          <Text className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </Text>
        </View>
      </View>

      {/* Right side: Action buttons */}
      <View className="flex-row gap-2">
        {actions.map((action, index) => (
          <IconButton key={index} onPress={action.onPress}>
            <Icon
              name={action.icon}
              size={22}
              color={isDark ? "#e2e8f0" : "#1e293b"}
            />
          </IconButton>
        ))}
      </View>
    </View>
  );
}
