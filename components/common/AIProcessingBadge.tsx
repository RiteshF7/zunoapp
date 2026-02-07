// components/common/AIProcessingBadge.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { Icon } from "./Icon";

interface AIProcessingBadgeProps {
  isProcessing: boolean;
  category?: string;
}

export function AIProcessingBadge({ isProcessing, category }: AIProcessingBadgeProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isProcessing) {
      const animation = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isProcessing]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (isProcessing) {
    return (
      <View className="flex-row items-center gap-1.5 bg-accent-blue/10 px-3 py-1.5 rounded-full">
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Icon name="auto_awesome" size={14} color="#4D96FF" />
        </Animated.View>
        <Text className="text-xs font-medium text-accent-blue">
          AI is analyzing...
        </Text>
      </View>
    );
  }

  if (category) {
    return (
      <View className="flex-row items-center gap-1.5 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
        <Icon name="auto_awesome" size={14} color="#22c55e" />
        <Text className="text-xs font-medium text-green-600 dark:text-green-400">
          {category}
        </Text>
      </View>
    );
  }

  return null;
}
