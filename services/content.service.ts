// services/content.service.ts
import { supabase } from "@/lib/supabase";
import { Content } from "@/types/supabase";

export const contentService = {
  // Get all content for the current user
  async getContent(options?: {
    limit?: number;
    offset?: number;
    category?: string;
    platform?: string;
    contentType?: string;
  }): Promise<Content[]> {
    let query = supabase
      .from("content")
      .select("*")
      .order("created_at", { ascending: false });

    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    if (options?.category) query = query.eq("ai_category", options.category);
    if (options?.platform) query = query.eq("platform", options.platform);
    if (options?.contentType) query = query.eq("content_type", options.contentType);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get a single content item
  async getContentItem(id: string): Promise<Content | null> {
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create (save) new content
  async saveContent(content: {
    url: string;
    title?: string;
    description?: string;
    thumbnail_url?: string;
    platform?: string;
    content_type?: string;
  }): Promise<Content> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("content")
      .insert({
        user_id: user.id,
        url: content.url,
        title: content.title,
        description: content.description,
        thumbnail_url: content.thumbnail_url,
        platform: content.platform || "other",
        content_type: content.content_type || "post",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update content
  async updateContent(id: string, updates: Partial<Content>): Promise<Content> {
    const { data, error } = await supabase
      .from("content")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete content
  async deleteContent(id: string): Promise<void> {
    const { error } = await supabase
      .from("content")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Get content with tags
  async getContentWithTags(id: string) {
    const { data, error } = await supabase
      .from("content")
      .select(`
        *,
        content_tags (
          tag:tag_id (id, name, slug, is_ai_generated)
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },
};
