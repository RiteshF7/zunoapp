// services/content.service.ts
import { api } from "@/lib/api";
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
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.offset) params.set("offset", String(options.offset));
    if (options?.category) params.set("category", options.category);
    if (options?.platform) params.set("platform", options.platform);
    if (options?.contentType) params.set("content_type", options.contentType);

    const qs = params.toString();
    return api.get<Content[]>(`/api/content${qs ? `?${qs}` : ""}`);
  },

  // Get a single content item
  async getContentItem(id: string): Promise<Content | null> {
    return api.get<Content>(`/api/content/${id}`);
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
    return api.post<Content>("/api/content", content);
  },

  // Update content
  async updateContent(id: string, updates: Partial<Content>): Promise<Content> {
    return api.patch<Content>(`/api/content/${id}`, updates);
  },

  // Delete content
  async deleteContent(id: string): Promise<void> {
    await api.delete(`/api/content/${id}`);
  },

  // Get content with tags
  async getContentWithTags(id: string) {
    return api.get<any>(`/api/content/${id}/tags`);
  },
};
