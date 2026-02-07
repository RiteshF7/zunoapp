// supabase/functions/process-content/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessRequest {
  content_id: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { content_id }: ProcessRequest = await req.json();

    if (!content_id) {
      return new Response(
        JSON.stringify({ error: "content_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the content item
    const { data: content, error: fetchError } = await supabase
      .from("content")
      .select("*")
      .eq("id", content_id)
      .single();

    if (fetchError || !content) {
      return new Response(
        JSON.stringify({ error: "Content not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Fetch URL metadata (title, description, thumbnail)
    const metadata = await fetchUrlMetadata(content.url);

    // Step 2: Build the text to analyze
    const textToAnalyze = [
      metadata.title || content.title || "",
      metadata.description || content.description || "",
      content.url,
    ].filter(Boolean).join("\n\n");

    // Step 3: AI Processing
    const aiProvider = Deno.env.get("AI_PROVIDER") || "openai";
    let aiResult;

    if (aiProvider === "openai") {
      aiResult = await processWithOpenAI(textToAnalyze);
    } else if (aiProvider === "gemini") {
      aiResult = await processWithGemini(textToAnalyze);
    } else {
      throw new Error(`Unknown AI provider: ${aiProvider}`);
    }

    // Step 4: Update content record
    const { error: updateError } = await supabase
      .from("content")
      .update({
        title: content.title || metadata.title || aiResult.title,
        description: content.description || metadata.description,
        thumbnail_url: content.thumbnail_url || metadata.thumbnail,
        ai_category: aiResult.category,
        ai_summary: aiResult.summary,
        ai_processed: true,
        embedding: aiResult.embedding,
      })
      .eq("id", content_id);

    if (updateError) throw updateError;

    // Step 5: Create and assign tags
    for (const tagName of aiResult.tags) {
      const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      // Upsert tag
      const { data: tag } = await supabase
        .from("tags")
        .upsert(
          { name: tagName, slug, is_ai_generated: true },
          { onConflict: "slug" }
        )
        .select("id, usage_count")
        .single();

      if (tag) {
        // Link tag to content
        await supabase
          .from("content_tags")
          .upsert(
            { content_id, tag_id: tag.id, is_ai_assigned: true },
            { onConflict: "content_id,tag_id" }
          );

        // Increment usage count
        await supabase
          .from("tags")
          .update({ usage_count: (tag.usage_count || 0) + 1 })
          .eq("id", tag.id);
      }
    }

    // Step 6: Update user interest profile
    await updateUserInterests(supabase, content.user_id, aiResult.category, aiResult.tags, content.platform, content.content_type);

    return new Response(
      JSON.stringify({
        success: true,
        category: aiResult.category,
        summary: aiResult.summary,
        tags: aiResult.tags,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Process content error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// --- Helper Functions ---

async function fetchUrlMetadata(url: string): Promise<{
  title?: string;
  description?: string;
  thumbnail?: string;
}> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Zuno Content Analyzer/1.0" },
      redirect: "follow",
    });
    const html = await response.text();

    // Extract Open Graph and meta tags
    const title = extractMeta(html, "og:title") || extractTag(html, "title");
    const description = extractMeta(html, "og:description") || extractMeta(html, "description");
    const thumbnail = extractMeta(html, "og:image");

    return { title, description, thumbnail };
  } catch {
    return {};
  }
}

function extractMeta(html: string, property: string): string | undefined {
  // Try og: prefix
  const ogMatch = html.match(
    new RegExp(`<meta[^>]+(?:property|name)=["'](?:og:)?${property}["'][^>]+content=["']([^"']+)["']`, "i")
  );
  if (ogMatch) return ogMatch[1];

  // Try content before property
  const reverseMatch = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:)?${property}["']`, "i")
  );
  return reverseMatch?.[1];
}

function extractTag(html: string, tag: string): string | undefined {
  const match = html.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i"));
  return match?.[1]?.trim();
}

async function processWithOpenAI(text: string) {
  const apiKey = Deno.env.get("OPENAI_API_KEY")!;

  // Step 1: Categorize, summarize, and tag (single call)
  const completionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a content analysis AI. Analyze the given content and return a JSON object with:
- "category": A single category (e.g., Cooking, Tech, Travel, Fitness, Finance, Design, Health, Education, Entertainment, Lifestyle, Business, Science, Sports, Music, Art)
- "summary": A concise 1-2 sentence summary (max 150 chars)
- "tags": An array of 3-5 relevant tags (lowercase, no #)
- "title": A clean title if you can infer one (optional)
Return ONLY valid JSON.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  const completion = await completionResponse.json();
  const result = JSON.parse(completion.choices[0].message.content);

  // Step 2: Generate embedding
  const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  const embeddingData = await embeddingResponse.json();
  const embedding = embeddingData.data[0].embedding;

  return {
    category: result.category || "Uncategorized",
    summary: result.summary || "",
    tags: result.tags || [],
    title: result.title,
    embedding,
  };
}

async function processWithGemini(text: string) {
  const apiKey = Deno.env.get("GEMINI_API_KEY")!;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Analyze this content and return a JSON object with:
- "category": A single category (Cooking, Tech, Travel, Fitness, Finance, Design, Health, Education, Entertainment, Lifestyle, Business, Science, Sports, Music, Art)
- "summary": A concise 1-2 sentence summary (max 150 chars)
- "tags": An array of 3-5 relevant tags (lowercase, no #)
- "title": A clean title if you can infer one

Content:
${text}

Return ONLY valid JSON.`,
          }],
        }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  const data = await response.json();
  const resultText = data.candidates[0].content.parts[0].text;
  const result = JSON.parse(resultText);

  // Gemini doesn't have a native embedding API like OpenAI
  // Use a placeholder embedding or integrate a separate embedding service
  const embedding = new Array(1536).fill(0); // Placeholder

  return {
    category: result.category || "Uncategorized",
    summary: result.summary || "",
    tags: result.tags || [],
    title: result.title,
    embedding,
  };
}

async function updateUserInterests(
  supabase: any,
  userId: string,
  category: string,
  tags: string[],
  platform: string,
  contentType: string
) {
  // Get or create user interests
  const { data: existing } = await supabase
    .from("user_interests")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (existing) {
    // Update existing interests
    const categories = { ...existing.categories };
    categories[category] = (categories[category] || 0) + 1;

    const tagCounts = { ...existing.tags };
    for (const tag of tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }

    const platforms = { ...existing.platforms };
    platforms[platform] = (platforms[platform] || 0) + 1;

    const contentTypes = { ...existing.content_types };
    contentTypes[contentType] = (contentTypes[contentType] || 0) + 1;

    await supabase
      .from("user_interests")
      .update({
        categories,
        tags: tagCounts,
        platforms,
        content_types: contentTypes,
        total_saved: existing.total_saved + 1,
        last_updated: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } else {
    // Create new interests record
    await supabase
      .from("user_interests")
      .insert({
        user_id: userId,
        categories: { [category]: 1 },
        tags: Object.fromEntries(tags.map((t: string) => [t, 1])),
        platforms: { [platform]: 1 },
        content_types: { [contentType]: 1 },
        total_saved: 1,
      });
  }
}
