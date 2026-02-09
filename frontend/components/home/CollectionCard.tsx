// components/home/CollectionCard.tsx
import React, { useState } from "react";
import { Pressable, View, Text } from "react-native";
import { Icon } from "@/components/common/Icon";
import { COLLECTION_THEMES, CollectionTheme } from "@/lib/constants";
import { useThemeStore } from "@/stores/themeStore";

interface CollectionCardProps {
  title: string;
  count: number;
  icon: string;
  theme: CollectionTheme;
  onPress?: () => void;
}

export function CollectionCard({
  title,
  count,
  icon,
  theme,
  onPress,
}: CollectionCardProps) {
  const t = COLLECTION_THEMES[theme] || COLLECTION_THEMES.blue;
  const { isDark } = useThemeStore();
  const [pressed, setPressed] = useState(false);

  const cardBgColor = isDark ? t.cardBg.dark : t.cardBg.light;
  const iconBgColor = isDark ? t.iconBg.dark : t.iconBg.light;
  const iconColor = isDark ? t.iconColor.dark : t.iconColor.light;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View
        style={{
          backgroundColor: cardBgColor,
          borderRadius: 22,
          height: 200,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 20,
          justifyContent: "flex-end",
          borderWidth: isDark ? 1 : 0,
          borderColor: isDark ? "rgba(255,255,255,0.06)" : "transparent",
          transform: [{ scale: pressed ? 0.96 : 1 }],
        }}
      >
        {/* Icon — centered in the remaining top space */}
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: iconBgColor,
            }}
          >
            <Icon name={icon} size={26} color={iconColor} />
          </View>
        </View>

        {/* Title + count pinned to bottom */}
        <View style={{ marginTop: 14 }}>
          <Text
            style={{
              fontFamily: "Manrope_700Bold",
              fontWeight: "700",
              fontSize: 15,
              lineHeight: 20,
              marginBottom: 5,
              color: isDark ? "#f1f5f9" : "#1e293b",
            }}
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text
            style={{
              fontFamily: "Manrope_400Regular",
              fontSize: 13,
              lineHeight: 16,
              color: isDark ? "#94a3b8" : "#64748b",
            }}
          >
            {count} items
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
