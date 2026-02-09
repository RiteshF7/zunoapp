// app/(auth)/login.tsx
import React, { useState } from "react";
import { View, Text, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { authService } from "@/services/auth.service";

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error, url } = await authService.signInWithGoogle();
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else if (url) {
      // Open Google OAuth URL in browser
      const WebBrowser = require("expo-web-browser");
      await WebBrowser.openAuthSessionAsync(url, "zunoapp://auth/callback");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background-light dark:bg-background-dark"
    >
      <View className="flex-1 justify-center px-6">
        {/* Logo */}
        <View className="items-center mb-10">
          <LinearGradient
            colors={["#4D96FF", "#A855F7"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ color: "white", fontSize: 28, fontWeight: "bold" }}>Z</Text>
          </LinearGradient>
          <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            Welcome to Zuno
          </Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Sign in to sync your content across devices
          </Text>
        </View>

        {/* Google Sign-In */}
        <View className="mb-4">
          <PrimaryButton
            label={loading ? "Signing in..." : "Continue with Google"}
            onPress={handleGoogleSignIn}
          />
        </View>

        {/* Skip */}
        <View className="items-center mt-4">
          <Text
            onPress={() => router.replace("/(tabs)")}
            className="text-sm text-accent-blue font-medium"
          >
            Skip for now
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
