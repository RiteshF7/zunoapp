// components/common/Icon.tsx
import React from "react";
import { View } from "react-native";
import { cn } from "@/lib/utils";
import {
  Search,
  Settings,
  Bell,
  Home,
  Plus,
  User,
  Heart,
  Bookmark,
  ExternalLink,
  Sun,
  Moon,
  Monitor,
  ChevronRight,
  ArrowLeft,
  X,
  Palette,
  FileText,
  Wrench,
  Lightbulb,
  GraduationCap,
  Gavel,
  Sparkles,
  Play,
  type LucideIcon,
} from "lucide-react-native";

const iconMap: Record<string, LucideIcon> = {
  search: Search,
  settings: Settings,
  notifications: Bell,
  home: Home,
  add: Plus,
  person: User,
  favorite: Heart,
  bookmark: Bookmark,
  open_in_new: ExternalLink,
  light_mode: Sun,
  dark_mode: Moon,
  monitor: Monitor,
  chevron_right: ChevronRight,
  arrow_back: ArrowLeft,
  close: X,
  palette: Palette,
  gavel: Gavel,
  description: FileText,
  handyman: Wrench,
  wb_sunny: Lightbulb,
  school: GraduationCap,
  auto_awesome: Sparkles,
  play_arrow: Play,
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export function Icon({ name, size = 24, color, className }: IconProps) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    // Fallback: render nothing for unknown icons
    return <View style={{ width: size, height: size }} />;
  }

  return (
    <View className={className}>
      <IconComponent size={size} color={color || "#64748b"} />
    </View>
  );
}

export { iconMap };
