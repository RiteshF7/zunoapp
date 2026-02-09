// hooks/useAuth.ts
import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuthStore } from "@/stores/authStore";

/**
 * Hook to protect routes based on authentication state.
 * Redirects to login if not authenticated and trying to access protected routes.
 * Redirects to home if authenticated and trying to access auth routes.
 */
export function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // User is not signed in and not on auth screen
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // User is signed in but on auth screen — redirect to home
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);
}
