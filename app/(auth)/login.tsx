// app/(auth)/login.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { authService } from "@/services/auth.service";
import { useThemeStore } from "@/stores/themeStore";

export default function LoginScreen() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone.trim() || phone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number with country code.");
      return;
    }

    setLoading(true);
    const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
    const { error } = await authService.sendOTP(formattedPhone);
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      router.push({ pathname: "/(auth)/verify", params: { phone: formattedPhone } });
    }
  };

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

        {/* Phone Input */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Phone Number
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 (555) 000-0000"
            placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
            keyboardType="phone-pad"
            autoComplete="tel"
            className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-base text-slate-900 dark:text-slate-100"
            style={{ fontFamily: "Inter_400Regular" }}
          />
        </View>

        {/* Send OTP Button */}
        <View className="mb-4">
          <PrimaryButton
            label={loading ? "Sending..." : "Continue with Phone"}
            onPress={handleSendOTP}
          />
        </View>

        {/* Divider */}
        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <Text className="px-4 text-xs text-slate-400 dark:text-slate-500">OR</Text>
          <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </View>

        {/* Google Sign-In */}
        <View className="mb-4">
          <PrimaryButton
            label="Continue with Google"
            variant="outline"
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
