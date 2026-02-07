// components/common/SettingsDropdown.tsx
import React from "react";
import { View, Pressable, Text, Modal } from "react-native";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { ThemeToggle } from "./ThemeToggle";
import { useThemeStore } from "@/stores/themeStore";

interface SettingsDropdownProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsDropdown({ visible, onClose }: SettingsDropdownProps) {
  const { isDark } = useThemeStore();

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable
        className="flex-1"
        onPress={onClose}
      >
        <View className="absolute right-4 top-24 w-64 bg-white dark:bg-card-dark rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-3 z-30">
          {/* Theme Section */}
          <View className="px-4 pb-3">
            <Text className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Theme
            </Text>
            <ThemeToggle />
          </View>

          {/* Divider */}
          <View className="h-px bg-slate-200 dark:bg-slate-700 mx-4 my-1" />

          {/* Menu Items */}
          <Pressable
            className="w-full px-4 py-3 flex-row items-center gap-3 active:bg-slate-100 dark:active:bg-slate-700"
            style={({ pressed }) => ({
              backgroundColor: pressed
                ? isDark ? "#334155" : "#f1f5f9"
                : "transparent",
            })}
          >
            <Icon name="person" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
            <Text className="text-sm text-slate-700 dark:text-slate-300">
              Account
            </Text>
          </Pressable>

          <Pressable
            className="w-full px-4 py-3 flex-row items-center gap-3"
            style={({ pressed }) => ({
              backgroundColor: pressed
                ? isDark ? "#334155" : "#f1f5f9"
                : "transparent",
            })}
          >
            <Icon name="notifications" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
            <Text className="text-sm text-slate-700 dark:text-slate-300">
              Notifications
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
