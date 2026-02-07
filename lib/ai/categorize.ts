// lib/ai/categorize.ts
import { supabase } from "@/lib/supabase";

export async function processContentAI(contentId: string): Promise<{
  success: boolean;
  category?: string;
  summary?: string;
  tags?: string[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke("process-content", {
      body: { content_id: contentId },
    });

    if (error) throw error;
    return { success: true, ...data };
  } catch (error: any) {
    console.error("AI processing error:", error);
    return { success: false, error: error.message };
  }
}
