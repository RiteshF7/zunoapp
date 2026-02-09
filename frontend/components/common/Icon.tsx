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
  // Category collection icons
  UtensilsCrossed,
  Cpu,
  Plane,
  Dumbbell,
  Landmark,
  Film,
  Leaf,
  Briefcase,
  FlaskConical,
  Trophy,
  Music,
  Brush,
  Shirt,
  Gamepad2,
  Newspaper,
  Camera,
  Code,
  Megaphone,
  CircleCheck,
  ShoppingBag,
  Share2,
  FolderOpen,
  type LucideIcon,
} from "lucide-react-native";

const iconMap: Record<string, LucideIcon> = {
  // Common UI icons
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

  // Category collection icons (Material name → Lucide equivalent)
  restaurant: UtensilsCrossed,
  memory: Cpu,
  flight: Plane,
  fitness_center: Dumbbell,
  account_balance: Landmark,
  movie: Film,
  self_improvement: Leaf,
  business_center: Briefcase,
  science: FlaskConical,
  sports_soccer: Trophy,
  music_note: Music,
  brush: Brush,
  checkroom: Shirt,
  sports_esports: Gamepad2,
  newspaper: Newspaper,
  photo_camera: Camera,
  code: Code,
  campaign: Megaphone,
  task_alt: CircleCheck,
  shopping_bag: ShoppingBag,
  share: Share2,
  folder: FolderOpen,
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
