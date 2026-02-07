// components/common/ThemeToggle.tsx
import React from "react";
import { View, Pressable, Text } from "react-native";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { useThemeStore } from "@/stores/themeStore";

export function ThemeToggle() {
  const { mode, setMode, isDark } = useThemeStore();

  const options = [
    { key: "light" as const, icon: "light_mode", label: "Light" },
    { key: "dark" as const, icon: "dark_mode", label: "Dark" },
    { key: "system" as const, icon: "monitor", label: "System" },
  ];

  return (
    <View className="flex-row gap-2">
      {options.map((option) => {
        const isActive = mode === option.key;
        return (
          <Pressable
            key={option.key}
            onPress={() => setMode(option.key)}
            className={cn(
              "flex-row items-center gap-2 px-4 py-2.5 rounded-full",
              isActive
                ? "bg-slate-900 dark:bg-slate-200"
                : "bg-slate-100 dark:bg-slate-800"
            )}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <Icon
              name={option.icon}
              size={16}
              color={isActive ? (isDark ? "#1e293b" : "#ffffff") : (isDark ? "#94a3b8" : "#64748b")}
            />
            <Text
              className={cn(
                "text-xs font-medium",
                isActive
                  ? "text-white dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
