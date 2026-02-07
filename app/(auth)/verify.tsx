// app/(auth)/verify.tsx
import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, Alert, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { IconButton } from "@/components/common/IconButton";
import { Icon } from "@/components/common/Icon";
import { authService } from "@/services/auth.service";
import { useThemeStore } from "@/stores/themeStore";

const OTP_LENGTH = 6;

export default function VerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { isDark } = useThemeStore();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newOtp.every((d) => d) && newOtp.join("").length === OTP_LENGTH) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const token = code || otp.join("");
    if (token.length !== OTP_LENGTH) {
      Alert.alert("Invalid Code", "Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    const { error } = await authService.verifyOTP(phone!, token);
    setLoading(false);

    if (error) {
      Alert.alert("Verification Failed", error.message);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } else {
      // Auth state listener in root layout will handle navigation
      router.replace("/(tabs)");
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    const { error } = await authService.sendOTP(phone!);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setResendTimer(30);
      Alert.alert("Code Sent", "A new verification code has been sent.");
    }
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark px-6">
      {/* Back Button */}
      <View className="mt-16 mb-8">
        <IconButton onPress={() => router.back()}>
          <Icon
            name="arrow_back"
            size={24}
            color={isDark ? "#e2e8f0" : "#1e293b"}
          />
        </IconButton>
      </View>

      {/* Header */}
      <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        Enter verification code
      </Text>
      <Text className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        We sent a 6-digit code to {phone}
      </Text>

      {/* OTP Input Boxes */}
      <View className="flex-row gap-3 mb-8 justify-center">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref: TextInput | null) => { inputRefs.current[index] = ref; }}
            value={digit}
            onChangeText={(value) => handleOtpChange(value.slice(-1), index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="number-pad"
            maxLength={1}
            className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 ${
              digit
                ? "border-accent-blue bg-accent-blue/10"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark"
            } text-slate-900 dark:text-slate-100`}
            style={{ fontFamily: "Inter_700Bold" }}
          />
        ))}
      </View>

      {/* Verify Button */}
      <PrimaryButton
        label={loading ? "Verifying..." : "Verify"}
        onPress={() => handleVerify()}
      />

      {/* Resend */}
      <View className="items-center mt-6">
        <Pressable onPress={handleResend} disabled={resendTimer > 0}>
          <Text
            className={`text-sm font-medium ${
              resendTimer > 0
                ? "text-slate-400 dark:text-slate-500"
                : "text-accent-blue"
            }`}
          >
            {resendTimer > 0
              ? `Resend code in ${resendTimer}s`
              : "Resend code"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
