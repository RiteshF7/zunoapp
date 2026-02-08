// app/(auth)/verify.tsx
// Phone OTP verification has been removed.
// This screen is kept as a placeholder to avoid navigation errors.
// It simply redirects back to login.

import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function VerifyScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/(auth)/login");
  }, []);

  return null;
}
