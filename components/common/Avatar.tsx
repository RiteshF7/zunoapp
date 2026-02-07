// components/common/Avatar.tsx
import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "@/lib/utils";

interface AvatarProps {
  letter?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { container: "w-8 h-8", text: "text-sm" },
  md: { container: "w-10 h-10", text: "text-lg" },
  lg: { container: "w-14 h-14", text: "text-xl" },
};

export function Avatar({ letter = "Z", size = "md", className }: AvatarProps) {
  const sizeStyles = sizeMap[size];

  return (
    <View className={cn("rounded-full overflow-hidden shadow-lg", sizeStyles.container, className)}>
      <LinearGradient
        colors={["#4D96FF", "#A855F7"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Text className={cn("text-white font-bold", sizeStyles.text)}>
          {letter}
        </Text>
      </LinearGradient>
    </View>
  );
}
