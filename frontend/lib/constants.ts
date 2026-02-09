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
    cardBg: { light: "#bfdbfe", dark: "#1e2838" },
    iconBg: { light: "#93c5fd", dark: "#253448" },
    iconColor: { light: "#2563eb", dark: "#60a5fa" },
  },
  green: {
    bgLight: "bg-green-50",
    bgDark: "dark:bg-[#2A3430]",
    iconBgLight: "bg-green-100",
    iconBgDark: "dark:bg-green-900/40",
    iconLight: "text-green-600",
    iconDark: "dark:text-green-400",
    cardBg: { light: "#bbf7d0", dark: "#1c2b22" },
    iconBg: { light: "#86efac", dark: "#24382c" },
    iconColor: { light: "#16a34a", dark: "#4ade80" },
  },
  purple: {
    bgLight: "bg-purple-50",
    bgDark: "dark:bg-[#342A38]",
    iconBgLight: "bg-purple-100",
    iconBgDark: "dark:bg-purple-900/40",
    iconLight: "text-purple-600",
    iconDark: "dark:text-purple-400",
    cardBg: { light: "#e9d5ff", dark: "#291e34" },
    iconBg: { light: "#d8b4fe", dark: "#382848" },
    iconColor: { light: "#9333ea", dark: "#c084fc" },
  },
  amber: {
    bgLight: "bg-amber-50",
    bgDark: "dark:bg-[#38332A]",
    iconBgLight: "bg-amber-100",
    iconBgDark: "dark:bg-amber-900/40",
    iconLight: "text-amber-600",
    iconDark: "dark:text-amber-400",
    cardBg: { light: "#fde68a", dark: "#2a2518" },
    iconBg: { light: "#fcd34d", dark: "#3a3420" },
    iconColor: { light: "#d97706", dark: "#fbbf24" },
  },
  rose: {
    bgLight: "bg-rose-50",
    bgDark: "dark:bg-[#382A2A]",
    iconBgLight: "bg-rose-100",
    iconBgDark: "dark:bg-rose-900/40",
    iconLight: "text-rose-600",
    iconDark: "dark:text-rose-400",
    cardBg: { light: "#fecdd3", dark: "#2a1c1e" },
    iconBg: { light: "#fda4af", dark: "#3a2428" },
    iconColor: { light: "#e11d48", dark: "#fb7185" },
  },
  indigo: {
    bgLight: "bg-indigo-50",
    bgDark: "dark:bg-[#2A2E38]",
    iconBgLight: "bg-indigo-100",
    iconBgDark: "dark:bg-indigo-900/40",
    iconLight: "text-indigo-600",
    iconDark: "dark:text-indigo-400",
    cardBg: { light: "#c7d2fe", dark: "#1c1e2a" },
    iconBg: { light: "#a5b4fc", dark: "#28283a" },
    iconColor: { light: "#4f46e5", dark: "#818cf8" },
  },
} as const;

export type CollectionTheme = keyof typeof COLLECTION_THEMES;

export const APP = {
  name: "Zuno",
  avatar: "Z",
  tagline: "Your unified content hub",
} as const;
