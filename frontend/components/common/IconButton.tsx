// components/common/IconButton.tsx
import React from "react";
import { Pressable, PressableProps } from "react-native";
import { cn } from "@/lib/utils";

interface IconButtonProps extends Omit<PressableProps, "className"> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "ghost";
}

export function IconButton({
  children,
  className,
  variant = "default",
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      className={cn(
        "p-2 rounded-full items-center justify-center active:scale-95",
        variant === "default" && "hover:bg-slate-200 dark:hover:bg-slate-800",
        variant === "ghost" && "opacity-80 active:opacity-60",
        className
      )}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
      {...props}
    >
      {children}
    </Pressable>
  );
}
