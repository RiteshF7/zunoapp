# Phase 10 — AI Service Layer

## Overview

Build the AI abstraction layer as Supabase Edge Functions that enable automatic content categorization, summarization, tagging, and embedding generation. After a user saves content, the AI pipeline processes it asynchronously — fetching URL metadata, categorizing, summarizing, generating tags, and creating vector embeddings for semantic search.

## Prerequisites

- Phase 9 completed (content CRUD working with Supabase)
- Supabase project with Edge Functions enabled
- An AI provider API key (OpenAI recommended; Gemini also supported)
- Supabase CLI installed for deploying Edge Functions: `npm install -g supabase`

---

## Step 1: Set Up Supabase CLI and Edge Functions

```bash
# Install Supabase CLI (if not already)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Create the Edge Function
supabase functions new process-content
```

---

## Step 2: Configure AI Provider Secrets

Set secrets in Supabase for the AI provider:

```bash
# For OpenAI
supabase secrets set OPENAI_API_KEY=sk-your-openai-key

# Alternatively, for Google Gemini
supabase secrets set GEMINI_API_KEY=your-gemini-key

# Set which provider to use
supabase secrets set AI_PROVIDER=openai
```

---

## Step 3: Build the AI Provider Abstraction

**File:** `lib/ai/provider.ts`

This is the client-side interface definition. The actual AI calls happen server-side in Edge Functions.

```typescript
// lib/ai/provider.ts

export interface AICategorizationResult {
  category: string;
  confidence: number;
}

export interface AISummaryResult {
  summary: string;
}

export interface AITagsResult {
  tags: string[];
}

export interface AIEmbeddingResult {
  embedding: number[];
}

export interface AIProcessResult {
  category: string;
  summary: string;
  tags: string[];
  embedding: number[];
  title?: string;
  description?: string;
  thumbnail_url?: string;
}

export interface AIProvider {
  categorize(text: string): Promise<AICategorizationResult>;
  summarize(text: string): Promise<AISummaryResult>;
  generateTags(text: string): Promise<AITagsResult>;
  generateEmbedding(text: string): Promise<AIEmbeddingResult>;
}
```

---

## Step 4: Build the `process-content` Edge Function

**File:** `supabase/functions/process-content/index.ts`

```typescript
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
        .select("id")
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
          .update({ usage_count: tag.usage_count + 1 })
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
        tags: Object.fromEntries(tags.map((t) => [t, 1])),
        platforms: { [platform]: 1 },
        content_types: { [contentType]: 1 },
        total_saved: 1,
      });
  }
}
```

---

## Step 5: Deploy the Edge Function

```bash
supabase functions deploy process-content --no-verify-jwt
```

> Note: `--no-verify-jwt` is used for development. In production, use JWT verification and pass the user's auth token.

---

## Step 6: Create a Database Trigger to Auto-Process

Run in Supabase SQL Editor:

```sql
-- Create a function that calls the Edge Function after content is inserted
CREATE OR REPLACE FUNCTION public.trigger_process_content()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Get the Edge Function URL from project settings
  edge_function_url := current_setting('app.settings.edge_function_url', true);

  -- Call the edge function asynchronously via pg_net (if available)
  -- Alternative: Use a background job / queue
  PERFORM net.http_post(
    url := CONCAT(
      (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url' LIMIT 1),
      '/functions/v1/process-content'
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', CONCAT('Bearer ', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1))
    ),
    body := jsonb_build_object('content_id', NEW.id)
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the insert if the trigger fails
    RAISE WARNING 'process-content trigger failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NOTE: The above uses pg_net which may need to be enabled.
-- Alternative approach: Call the Edge Function from the client side after saving.
```

### Alternative: Client-Side AI Processing Call

If the database trigger approach is too complex, call the Edge Function from the client after saving content:

**File:** `lib/ai/categorize.ts`

```typescript
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
```

---

## Step 7: Update the Add Content Flow

Update the `saveContent` function to trigger AI processing after saving:

```typescript
// In app/add-content.tsx, update the handleSave function:
import { processContentAI } from "@/lib/ai/categorize";

const handleSave = async () => {
  // ... validation ...

  setLoading(true);
  try {
    const content = await contentService.saveContent({
      url: url.trim(),
      title: title.trim() || undefined,
      platform,
      content_type: contentType,
    });

    // Trigger AI processing (non-blocking)
    processContentAI(content.id).then((result) => {
      if (result.success) {
        console.log("AI processed:", result);
      }
    });

    Alert.alert("Saved!", "Content is being analyzed by AI...", [
      { text: "OK", onPress: () => router.back() },
    ]);
  } catch (error: any) {
    Alert.alert("Error", error.message || "Failed to save content.");
  } finally {
    setLoading(false);
  }
};
```

---

## Step 8: Show AI Processing State in UI

**File:** `components/common/AIProcessingBadge.tsx`

```tsx
// components/common/AIProcessingBadge.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { Icon } from "./Icon";

interface AIProcessingBadgeProps {
  isProcessing: boolean;
  category?: string;
}

export function AIProcessingBadge({ isProcessing, category }: AIProcessingBadgeProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isProcessing) {
      const animation = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isProcessing]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (isProcessing) {
    return (
      <View className="flex-row items-center gap-1.5 bg-accent-blue/10 px-3 py-1.5 rounded-full">
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Icon name="auto_awesome" size={14} color="#4D96FF" />
        </Animated.View>
        <Text className="text-xs font-medium text-accent-blue">
          AI is analyzing...
        </Text>
      </View>
    );
  }

  if (category) {
    return (
      <View className="flex-row items-center gap-1.5 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
        <Icon name="auto_awesome" size={14} color="#22c55e" />
        <Text className="text-xs font-medium text-green-600 dark:text-green-400">
          {category}
        </Text>
      </View>
    );
  }

  return null;
}
```

---

## Verification Checklist

- [ ] **Edge Function deploys**: `supabase functions deploy process-content` succeeds
- [ ] **AI provider configured**: Secrets set in Supabase dashboard
- [ ] **Content processing works**: After saving content, the AI processes it within a few seconds
- [ ] **Category assigned**: Content record has `ai_category` populated
- [ ] **Summary generated**: Content record has `ai_summary` populated
- [ ] **Tags created**: Tags are created and linked to the content
- [ ] **Embedding generated**: Content record has `embedding` vector populated
- [ ] **User interests updated**: `user_interests` table is updated with the new category/tags
- [ ] **Processing badge shows**: UI shows "AI is analyzing..." while processing
- [ ] **Processed badge shows**: After processing, shows the assigned category
- [ ] **Fallback works**: If AI fails, the content is still saved (just unprocessed)
- [ ] **Multiple providers**: The abstraction layer supports switching between OpenAI and Gemini

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Edge Function 500 error | Check logs: `supabase functions logs process-content` |
| OpenAI API error | Verify `OPENAI_API_KEY` is set: `supabase secrets list` |
| Embedding dimension mismatch | Ensure `text-embedding-3-small` produces 1536-dim vectors matching the VECTOR column |
| Tags not linking | Verify the `content_tags` upsert uses correct `onConflict` |
| pg_net not available | Use the client-side approach instead of database triggers |

---

## What's Next

Once this phase is verified, proceed to **Phase 11 — Search** (`PHASE_11_SEARCH.md`).
