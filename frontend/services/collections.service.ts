// services/collections.service.ts
import { api } from "@/lib/api";
import { Collection, Content } from "@/types/supabase";

export const collectionsService = {
  // Get all collections for the current user, optionally filtered by AI category
  async getCollections(category?: string): Promise<Collection[]> {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    const qs = params.toString();
    return api.get<Collection[]>(`/api/collections${qs ? `?${qs}` : ""}`);
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

  // Get items in a collection (backend returns flat Content[])
  async getCollectionItems(collectionId: string): Promise<Content[]> {
    return api.get<Content[]>(`/api/collections/${collectionId}/items`);
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
