// components/common/FilterChips.tsx
import React from "react";
import { ScrollView, Pressable, Text } from "react-native";
import { cn } from "@/lib/utils";
import { Filter } from "@/types/content";

interface FilterChipsProps {
  filters: Filter[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  className?: string;
}

export function FilterChips({
  filters,
  activeFilter,
  onFilterChange,
  className,
}: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      className={cn("px-6 py-2", className)}
      contentContainerStyle={{ gap: 8 }}
    >
      {filters.map((filter) => {
        const isActive = filter.id === activeFilter;
        return (
          <Pressable
            key={filter.id}
            onPress={() => onFilterChange(filter.id)}
            className={cn(
              "px-5 py-2.5 rounded-full",
              isActive
                ? "bg-slate-900 dark:bg-slate-200 shadow-md"
                : "bg-slate-200 dark:bg-card-dark"
            )}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <Text
              className={cn(
                "text-sm whitespace-nowrap",
                isActive
                  ? "text-white dark:text-slate-900 font-semibold"
                  : "text-slate-600 dark:text-slate-400 font-medium"
              )}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
