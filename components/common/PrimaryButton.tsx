// components/common/PrimaryButton.tsx
import React from "react";
import { Pressable, Text, View } from "react-native";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

interface PrimaryButtonProps {
  label: string;
  icon?: string;
  onPress?: () => void;
  className?: string;
  variant?: "default" | "outline";
}

export function PrimaryButton({
  label,
  icon,
  onPress,
  className,
  variant = "default",
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "w-full py-4 px-8 rounded-full flex-row items-center justify-center gap-2",
        variant === "default" &&
          "bg-white dark:bg-slate-100 shadow-lg",
        variant === "outline" &&
          "bg-transparent border-2 border-slate-300 dark:border-slate-600",
        className
      )}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.95 : 1 }],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
      })}
    >
      {icon && <Icon name={icon} size={24} color="#1e293b" />}
      <Text
        className={cn(
          "font-bold tracking-tight",
          variant === "default" && "text-slate-900",
          variant === "outline" && "text-slate-900 dark:text-slate-100"
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
