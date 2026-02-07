// supabase/functions/generate-feed/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client for reading user data (respects RLS)
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service client for writing feed items
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get the current user
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user interest profile
    const { data: interests } = await serviceClient
      .from("user_interests")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!interests || interests.total_saved === 0) {
      // No interests yet — return trending/default feed
      return new Response(
        JSON.stringify({
          items: [],
          message: "Save more content to get personalized recommendations!",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the interest profile
    const topCategories = getTopN(interests.categories, 5);
    const topTags = getTopN(interests.tags, 10);
    const topPlatforms = getTopN(interests.platforms, 3);

    // Generate personalized feed using AI
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    let feedItems: any[] = [];

    if (apiKey) {
      // Use AI to generate feed recommendations
      feedItems = await generateAIFeed(apiKey, topCategories, topTags, topPlatforms, interests);
    } else {
      // Fallback: generate feed based on category matching
      feedItems = generateRuleFeed(topCategories, topTags, topPlatforms, interests);
    }

    // Upsert feed items
    for (const item of feedItems) {
      await serviceClient
        .from("feed_items")
        .upsert(item, { onConflict: "source_url" })
        .select();
    }

    // Return the feed
    const { data: feed } = await serviceClient
      .from("feed_items")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    return new Response(
      JSON.stringify({ items: feed || [], interests: topCategories }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Generate feed error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getTopN(obj: Record<string, number>, n: number): [string, number][] {
  return Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n);
}

async function generateAIFeed(
  apiKey: string,
  topCategories: [string, number][],
  topTags: [string, number][],
  topPlatforms: [string, number][],
  interests: any
): Promise<any[]> {
  const prompt = `Based on a user's content interests, generate 10 feed recommendations.

User Profile:
- Top categories: ${topCategories.map(([c, n]) => `${c} (${n} saved)`).join(", ")}
- Top tags: ${topTags.map(([t, n]) => `${t} (${n})`).join(", ")}
- Preferred platforms: ${topPlatforms.map(([p]) => p).join(", ")}
- Total saved: ${interests.total_saved}

Generate a JSON array of 10 content recommendations. Each item should have:
- "title": An engaging title
- "description": 1-2 sentence description
- "source_url": A plausible URL (use example.com)
- "category": Category that matches user interests
- "content_type": One of: video, reel, article, thread, post, image, podcast
- "platform": One of: youtube, instagram, twitter, facebook, linkedin, tiktok, reddit, pinterest, spotify
- "likes": Random number between 500-10000
- "reason": A "Why this?" explanation referencing the user's interests (e.g., "Because you saved 12 cooking videos")

Make recommendations diverse but strongly related to the user's interests.
Return ONLY a valid JSON array.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You generate content feed recommendations as JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    }),
  });

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  const items = Array.isArray(content) ? content : content.items || content.recommendations || [];

  return items.map((item: any) => ({
    title: item.title,
    description: item.description,
    image_url: `https://picsum.photos/seed/${encodeURIComponent(item.title.slice(0, 10))}/400/250`,
    source_url: item.source_url,
    category: item.category,
    content_type: item.content_type || "article",
    platform: item.platform || "other",
    likes: item.likes || Math.floor(Math.random() * 5000) + 500,
    relevance_score: Math.random() * 0.5 + 0.5,
    reason: item.reason,
  }));
}

function generateRuleFeed(
  topCategories: [string, number][],
  topTags: [string, number][],
  topPlatforms: [string, number][],
  interests: any
): any[] {
  // Simple rule-based fallback
  const items: any[] = [];

  for (const [category, count] of topCategories) {
    items.push({
      title: `Top ${category} Content This Week`,
      description: `Discover trending ${category.toLowerCase()} content picked for you.`,
      image_url: `https://picsum.photos/seed/${category}/400/250`,
      source_url: `https://example.com/${category.toLowerCase()}`,
      category,
      content_type: "article",
      platform: topPlatforms[0]?.[0] || "other",
      likes: Math.floor(Math.random() * 5000) + 500,
      relevance_score: 0.8,
      reason: `Because you saved ${count} ${category.toLowerCase()} items`,
    });
  }

  return items;
}
