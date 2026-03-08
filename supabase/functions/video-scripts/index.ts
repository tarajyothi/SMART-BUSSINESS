import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader! } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { product_name, product_description, product_price } = await req.json();
    if (!product_name) {
      return new Response(JSON.stringify({ error: "product_name is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `You are a social media marketing expert for small sellers. Generate video scripts for this product:

Product: ${product_name}
Price: ₹${product_price || "N/A"}
Description: ${product_description || "No description"}

Create 3 video scripts in JSON format (no markdown, raw JSON only):
{
  "instagram_reel": {
    "title": "catchy title",
    "duration": "15-30 seconds",
    "hook": "opening hook line (first 3 seconds)",
    "script": "full script with visual directions in [brackets]",
    "caption": "instagram caption with emojis",
    "hashtags": "#relevant #hashtags",
    "music_suggestion": "trending audio suggestion"
  },
  "youtube_shorts": {
    "title": "SEO-optimized title",
    "duration": "30-60 seconds",
    "hook": "attention-grabbing opening",
    "script": "full script with scene directions in [brackets]",
    "description": "YouTube description with keywords",
    "tags": "comma-separated tags"
  },
  "tiktok": {
    "title": "viral-style title",
    "duration": "15-30 seconds",
    "concept": "video concept/trend to use",
    "hook": "scroll-stopping opener",
    "script": "full script with visual cues in [brackets]",
    "caption": "TikTok caption",
    "sound_suggestion": "trending sound idea"
  }
}

Make scripts engaging, authentic, and optimized for each platform. Use Indian market context.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a video marketing expert. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || "{}";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let scripts;
    try { scripts = JSON.parse(content); } catch { scripts = { error: "Failed to parse", raw: content }; }

    return new Response(JSON.stringify({ scripts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("video-scripts error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
