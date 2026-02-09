// lib/ai/categorize.ts
import { api } from "@/lib/api";

export async function processContentAI(contentId: string): Promise<{
  success: boolean;
  category?: string;
  summary?: string;
  tags?: string[];
  error?: string;
}> {
  try {
    const data = await api.post<{
      success: boolean;
      category?: string;
      summary?: string;
      tags?: string[];
    }>("/api/ai/process-content", { content_id: contentId });

    return { success: true, ...data };
  } catch (error: any) {
    console.error("AI processing error:", error);
    return { success: false, error: error.message };
  }
}
