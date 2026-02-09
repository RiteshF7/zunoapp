// app/add-content.tsx — AI processing via Python backend
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { IconButton } from "@/components/common/IconButton";
import { Icon } from "@/components/common/Icon";
import { contentService } from "@/services/content.service";
import { processContentAI } from "@/lib/ai/categorize";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";

const PLATFORM_OPTIONS = [
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "twitter", label: "Twitter/X" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "tiktok", label: "TikTok" },
  { id: "reddit", label: "Reddit" },
  { id: "other", label: "Other" },
];

const TYPE_OPTIONS = [
  { id: "video", label: "Video" },
  { id: "reel", label: "Reel/Short" },
  { id: "article", label: "Article" },
  { id: "post", label: "Post" },
  { id: "thread", label: "Thread" },
  { id: "image", label: "Image" },
];

export default function AddContentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("other");
  const [contentType, setContentType] = useState("post");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!url.trim()) {
      Alert.alert("Error", "Please enter a URL.");
      return;
    }

    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Please sign in to save content.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/(auth)/login") },
      ]);
      return;
    }

    setLoading(true);
    try {
      const content = await contentService.saveContent({
        url: url.trim(),
        title: title.trim() || undefined,
        platform,
        content_type: contentType,
      });

      // Trigger AI processing (non-blocking)
      processContentAI(content.id).then((result) => {
        if (result.success) {
          console.log("AI processed:", result);
        }
      });

      Alert.alert("Saved!", "Content is being analyzed by AI...", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background-light dark:bg-background-dark"
    >
      <ScrollView className="flex-1" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between">
          <IconButton onPress={() => router.back()}>
            <Icon name="close" size={24} color={isDark ? "#e2e8f0" : "#1e293b"} />
          </IconButton>
          <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Add Content
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View className="px-6">
          {/* URL Input */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              URL *
            </Text>
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder="https://..."
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-base text-slate-900 dark:text-slate-100"
            />
          </View>

          {/* Title Input (Optional) */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Title (optional — AI will auto-detect)
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Content title..."
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-base text-slate-900 dark:text-slate-100"
            />
          </View>

          {/* Platform Selection */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Platform
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.id}
                  onPress={() => setPlatform(opt.id)}
                  className={`px-4 py-2.5 rounded-full ${
                    platform === opt.id
                      ? "bg-slate-900 dark:bg-slate-200"
                      : "bg-slate-100 dark:bg-card-dark"
                  }`}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  <Text
                    className={`text-sm font-medium ${
                      platform === opt.id
                        ? "text-white dark:text-slate-900"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Content Type Selection */}
          <View className="mb-8">
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Content Type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.id}
                  onPress={() => setContentType(opt.id)}
                  className={`px-4 py-2.5 rounded-full ${
                    contentType === opt.id
                      ? "bg-accent-blue"
                      : "bg-slate-100 dark:bg-card-dark"
                  }`}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  <Text
                    className={`text-sm font-medium ${
                      contentType === opt.id
                        ? "text-white"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <PrimaryButton
            label={loading ? "Saving..." : "Save to Zuno"}
            icon="add"
            onPress={handleSave}
          />

          {/* AI Note */}
          <View className="mt-4 bg-accent-blue/10 rounded-2xl p-4">
            <Text className="text-xs text-accent-blue font-medium">
              AI will automatically categorize, tag, and summarize this content after saving.
            </Text>
          </View>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
