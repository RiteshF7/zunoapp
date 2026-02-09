// components/feed/FeedSkeleton.tsx
import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

function SkeletonBox({ width, height, className }: { width: `${number}%` | number; height: number; className?: string }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      className={`bg-slate-200 dark:bg-slate-700 rounded-xl ${className || ""}`}
      style={{ width, height, opacity }}
    />
  );
}

export function FeedSkeleton() {
  return (
    <View className="mx-6 mb-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <View
          key={index}
          className="bg-white dark:bg-card-dark rounded-2xl overflow-hidden mb-4"
        >
          {/* Image skeleton */}
          <SkeletonBox width="100%" height={192} className="rounded-none" />

          {/* Content skeleton */}
          <View className="p-4">
            <SkeletonBox width="80%" height={18} className="mb-2" />
            <SkeletonBox width="100%" height={14} className="mb-1" />
            <SkeletonBox width="60%" height={14} className="mb-3" />

            {/* Actions skeleton */}
            <View className="flex-row items-center justify-between">
              <SkeletonBox width={60} height={16} />
              <View className="flex-row gap-2">
                <SkeletonBox width={70} height={32} className="rounded-full" />
                <SkeletonBox width={32} height={32} className="rounded-full" />
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
