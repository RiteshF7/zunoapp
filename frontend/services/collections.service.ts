// services/collections.service.ts
import { api } from "@/lib/api";
import { Collection } from "@/types/supabase";

export const collectionsService = {
  // Get all collections for the current user
  async getCollections(): Promise<Collection[]> {
    return api.get<Collection[]>("/api/collections");
  },

  // Get distinct AI categories the user has content in
  async getCategories(): Promise<string[]> {
    return api.get<string[]>("/api/collections/categories");
  },

  // Get a single collection
  async getCollection(id: string): Promise<Collection | null> {
    return api.get<Collection>(`/api/collections/${id}`);
  },

  // Create a new collection
  async createCollection(collection: {
    title: string;
    description?: string;
    icon?: string;
    theme?: string;
    is_smart?: boolean;
    smart_rules?: Record<string, any>;
  }): Promise<Collection> {
    return api.post<Collection>("/api/collections", collection);
  },

  // Update a collection
  async updateCollection(id: string, updates: Partial<Collection>): Promise<Collection> {
    return api.patch<Collection>(`/api/collections/${id}`, updates);
  },

  // Delete a collection
  async deleteCollection(id: string): Promise<void> {
    await api.delete(`/api/collections/${id}`);
  },

  // Get items in a collection
  async getCollectionItems(collectionId: string) {
    return api.get<any[]>(`/api/collections/${collectionId}/items`);
  },

  // Add item to collection
  async addItemToCollection(collectionId: string, contentId: string): Promise<void> {
    await api.post(`/api/collections/${collectionId}/items`, {
      content_id: contentId,
    });
  },

  // Remove item from collection
  async removeItemFromCollection(collectionId: string, contentId: string): Promise<void> {
    await api.delete(`/api/collections/${collectionId}/items/${contentId}`);
  },
};
