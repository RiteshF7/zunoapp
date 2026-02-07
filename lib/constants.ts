// lib/constants.ts

export const COLORS = {
  primary: "#E2E8F0",
  backgroundLight: "#F8FAFC",
  backgroundDark: "#1A1C1E",
  cardDark: "#2D2F31",
  accentBlue: "#4D96FF",
} as const;

export const COLLECTION_THEMES = {
  blue: {
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-[#2A303C]",
    iconBgLight: "bg-blue-100",
    iconBgDark: "dark:bg-blue-900/40",
    iconLight: "text-blue-600",
    iconDark: "dark:text-blue-400",
  },
  green: {
    bgLight: "bg-green-50",
    bgDark: "dark:bg-[#2A3430]",
    iconBgLight: "bg-green-100",
    iconBgDark: "dark:bg-green-900/40",
    iconLight: "text-green-600",
    iconDark: "dark:text-green-400",
  },
  purple: {
    bgLight: "bg-purple-50",
    bgDark: "dark:bg-[#342A38]",
    iconBgLight: "bg-purple-100",
    iconBgDark: "dark:bg-purple-900/40",
    iconLight: "text-purple-600",
    iconDark: "dark:text-purple-400",
  },
  amber: {
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-[#38332A]",
    iconBgLight: "bg-amber-100",
    iconBgDark: "dark:bg-amber-900/40",
    iconLight: "text-amber-600",
    iconDark: "dark:text-amber-400",
  },
  rose: {
    bgLight: "bg-rose-50",
    bgDark: "dark:bg-[#382A2A]",
    iconBgLight: "bg-rose-100",
    iconBgDark: "dark:bg-rose-900/40",
    iconLight: "text-rose-600",
    iconDark: "dark:text-rose-400",
  },
  indigo: {
    bgLight: "bg-indigo-50",
    bgDark: "dark:bg-[#2A2E38]",
    iconBgLight: "bg-indigo-100",
    iconBgDark: "dark:bg-indigo-900/40",
    iconLight: "text-indigo-600",
    iconDark: "dark:text-indigo-400",
  },
} as const;

export type CollectionTheme = keyof typeof COLLECTION_THEMES;

export const APP = {
  name: "Zuno",
  avatar: "Z",
  tagline: "Your unified content hub",
} as const;
