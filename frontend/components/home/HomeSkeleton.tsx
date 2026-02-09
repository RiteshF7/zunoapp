// components/home/HomeSkeleton.tsx
import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

function SkeletonPulse({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

export function HomeSkeleton() {
  return (
    <SkeletonPulse>
      {/* Filter chips skeleton */}
      <View className="px-6 py-2 flex-row gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} className="bg-slate-200 dark:bg-slate-700 rounded-full w-20 h-10" />
        ))}
      </View>

      {/* Grid skeleton */}
      <View className="px-6 mt-4 flex-row flex-wrap gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View
            key={i}
            className="bg-slate-200 dark:bg-slate-700 rounded-2xl h-48"
            style={{ width: "47.5%" }}
          />
        ))}
      </View>
    </SkeletonPulse>
  );
}
