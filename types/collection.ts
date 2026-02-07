// types/collection.ts

export interface CollectionDetail {
  id: string;
  title: string;
  description?: string;
  count: number;
  icon: string;
  theme: string;
  isSmartCollection: boolean;
  createdAt: string;
  updatedAt: string;
}
