// app/index.tsx
import { View, Text, Pressable } from "react-native";
import { useThemeStore } from "@/stores/themeStore";

export default function HomeScreen() {
  const { isDark, mode, setMode } = useThemeStore();

  const toggleTheme = () => {
    if (mode === "light") setMode("dark");
    else if (mode === "dark") setMode("system");
    else setMode("light");
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-6">
      <Text className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        Zuno
      </Text>
      <Text className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        Your unified content hub
      </Text>

      <View className="bg-blue-50 dark:bg-[#2A303C] p-5 rounded-2xl w-full mb-4">
        <Text className="font-bold text-slate-800 dark:text-white text-lg">
          NativeWind is working!
        </Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Theme: {mode} (isDark: {isDark ? "yes" : "no"})
        </Text>
      </View>

      <Pressable
        onPress={toggleTheme}
        className="bg-slate-900 dark:bg-slate-200 px-8 py-4 rounded-full active:scale-95"
      >
        <Text className="text-white dark:text-slate-900 font-bold">
          Toggle Theme ({mode})
        </Text>
      </Pressable>
    </View>
  );
}
