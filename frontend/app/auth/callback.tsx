// app/auth/callback.tsx
// This route catches the OAuth redirect (zunoapp://auth/callback)
// and prevents the "unmatched route" flash. The actual session
// handling happens in _layout.tsx via onAuthStateChange.
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // The root layout's onAuthStateChange listener will pick up
    // the new session automatically. Just redirect to home.
    const timeout = setTimeout(() => {
      router.replace("/(tabs)");
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
      <ActivityIndicator size="large" color="#4D96FF" />
    </View>
  );
}
