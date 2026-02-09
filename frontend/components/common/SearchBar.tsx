// components/common/SearchBar.tsx
import React from "react";
import { View, TextInput, Pressable } from "react-native";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { useThemeStore } from "@/stores/themeStore";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onClear?: () => void;
  className?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search your content...",
  onSubmit,
  onClear,
  className,
}: SearchBarProps) {
  const { isDark } = useThemeStore();

  return (
    <View
      className={cn(
        "flex-row items-center bg-slate-100 dark:bg-card-dark rounded-full px-4 py-3 mx-6",
        className
      )}
    >
      <Icon
        name="search"
        size={20}
        color={isDark ? "#64748b" : "#94a3b8"}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        className="flex-1 ml-3 text-sm text-slate-900 dark:text-slate-100"
        style={{ fontFamily: "Manrope_400Regular" }}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => {
            onChangeText("");
            onClear?.();
          }}
          className="p-1"
        >
          <Icon
            name="close"
            size={18}
            color={isDark ? "#94a3b8" : "#64748b"}
          />
        </Pressable>
      )}
    </View>
  );
}
