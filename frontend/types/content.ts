// types/content.ts
import { CollectionTheme } from "@/lib/constants";

export interface Filter {
  id: string;
  label: string;
}

export interface Collection {
  id: string;
  title: string;
  count: number;
  icon: string;
  theme: CollectionTheme;
}

export interface AppContent {
  app: {
    name: string;
    avatar: string;
    title: string;
  };
  filters: Filter[];
  collections: Collection[];
}
