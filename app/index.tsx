// app/index.tsx
import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Header } from "@/components/common/Header";
import { FilterChips } from "@/components/common/FilterChips";
import { CollectionCard } from "@/components/home/CollectionCard";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { SearchBar } from "@/components/common/SearchBar";
import { FeedCard } from "@/components/feed/FeedCard";
import contentData from "@/assets/data/content.json";
import feedData from "@/assets/data/feed.json";
import { FeedItem } from "@/types/feed";

export default function PreviewScreen() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Header
          title="Zuno"
          subtitle="Pick your"
          actions={[
            { icon: "search", onPress: () => {} },
            { icon: "settings", onPress: () => {} },
          ]}
        />

        {/* Theme Toggle */}
        <View className="px-6 mb-4">
          <ThemeToggle />
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          className="mb-4"
        />

        {/* Filter Chips */}
        <FilterChips
          filters={contentData.filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Collection Cards (2-col sample) */}
        <Text className="px-6 mt-4 mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Collections
        </Text>
        <View className="px-6 flex-row flex-wrap gap-4 mb-6">
          {contentData.collections.slice(0, 4).map((col) => (
            <View key={col.id} style={{ width: "47%" }}>
              <CollectionCard
                title={col.title}
                count={col.count}
                icon={col.icon}
                theme={col.theme as any}
                onPress={() => console.log("Pressed:", col.id)}
              />
            </View>
          ))}
        </View>

        {/* Feed Card Sample */}
        <Text className="px-6 mt-2 mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Feed Cards
        </Text>
        {feedData.items.slice(0, 2).map((item) => (
          <FeedCard
            key={item.id}
            item={item as FeedItem}
            isBookmarked={bookmarks.includes(item.id)}
            onBookmarkToggle={toggleBookmark}
            onOpenSource={(url) => console.log("Open:", url)}
          />
        ))}

        {/* Primary Button */}
        <View className="px-6 mt-4 mb-8">
          <PrimaryButton label="Add New" icon="add" />
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}
