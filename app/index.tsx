// app/index.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeStore } from "@/stores/themeStore";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const { isDark, initialize } = useThemeStore();

  // Animations
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initialize();

    // Staggered entrance animation
    Animated.sequence([
      // Logo fades in and scales up
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // App name fades in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Tagline fades in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
      {/* Decorative grid dots (subtle background) */}
      <View className="absolute inset-0 opacity-5">
        {Array.from({ length: 20 }).map((_, row) =>
          Array.from({ length: 10 }).map((_, col) => (
            <View
              key={`${row}-${col}`}
              className="absolute w-1 h-1 rounded-full bg-slate-400"
              style={{
                left: col * (width / 10) + width / 20,
                top: row * (height / 20) + height / 40,
              }}
            />
          ))
        )}
      </View>

      {/* Logo */}
      <Animated.View
        style={{
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
        }}
      >
        <LinearGradient
          colors={["#4D96FF", "#A855F7"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#4D96FF",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Text style={{ color: "white", fontSize: 36, fontWeight: "bold" }}>
            Z
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Divider line */}
      <Animated.View
        style={{ opacity: textOpacity }}
        className="w-8 h-0.5 bg-slate-300 dark:bg-slate-600 my-6"
      />

      {/* App Name */}
      <Animated.Text
        style={{ opacity: textOpacity }}
        className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
      >
        Zuno
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text
        style={{ opacity: taglineOpacity }}
        className="text-sm text-slate-500 dark:text-slate-400 mt-2"
      >
        Your unified content hub
      </Animated.Text>
    </View>
  );
}
