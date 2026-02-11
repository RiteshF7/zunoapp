// app/+not-found.tsx
// Silently redirect any unmatched route (e.g. OAuth callback deep links)
// to the main tabs screen instead of showing a default error page.
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/(tabs)");
  }, []);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
      <ActivityIndicator size="large" color="#4D96FF" />
    </View>
  );
}
