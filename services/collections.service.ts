// services/collections.service.ts
import { supabase } from "@/lib/supabase";
import { Collection } from "@/types/supabase";

export const collectionsService = {
  // Get all collections for the current user
  async getCollections(): Promise<Collection[]> {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get a single collection
  async getCollection(id: string): Promise<Collection | null> {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("collections")
      .insert({
        user_id: user.id,
        title: collection.title,
        description: collection.description,
        icon: collection.icon || "folder",
        theme: collection.theme || "blue",
        is_smart: collection.is_smart || false,
        smart_rules: collection.smart_rules,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a collection
  async updateCollection(id: string, updates: Partial<Collection>): Promise<Collection> {
    const { data, error } = await supabase
      .from("collections")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a collection
  async deleteCollection(id: string): Promise<void> {
    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Get items in a collection
  async getCollectionItems(collectionId: string) {
    const { data, error } = await supabase
      .from("collection_items")
      .select(`
        added_at,
        content:content_id (*)
      `)
      .eq("collection_id", collectionId)
      .order("added_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Add item to collection
  async addItemToCollection(collectionId: string, contentId: string): Promise<void> {
    const { error } = await supabase
      .from("collection_items")
      .insert({ collection_id: collectionId, content_id: contentId });

    if (error) throw error;

    // Update item count
    await supabase.rpc("increment_collection_count", { collection_id: collectionId });
  },

  // Remove item from collection
  async removeItemFromCollection(collectionId: string, contentId: string): Promise<void> {
    const { error } = await supabase
      .from("collection_items")
      .delete()
      .eq("collection_id", collectionId)
      .eq("content_id", contentId);

    if (error) throw error;

    // Decrement item count
    await supabase.rpc("decrement_collection_count", { collection_id: collectionId });
  },
};
