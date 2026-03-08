import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productName, productDescription, productPrice, category } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a viral social media content strategist specializing in Instagram Reels for e-commerce products. You create engaging, trendy, scroll-stopping reel concepts.

Return a JSON object with exactly these keys:
- reelIdea: A creative, attention-grabbing reel concept (2-3 sentences)
- videoScript: A 15-second video script with timestamps (e.g., "0-3s: ...", "3-7s: ...", etc.)
- caption: An engaging Instagram caption (2-3 lines with emojis)
- hashtags: 10-15 relevant trending hashtags as a single string
- narrationScript: A voice-over narration script matching the 15-second video timeline

Return ONLY valid JSON, no markdown.`;

    const userPrompt = `Generate a viral Instagram Reel concept for this product:
Product: ${productName}
Description: ${productDescription || "No description"}
Price: ₹${productPrice}
Category: ${category || "General"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        reelIdea: "Creative reel showcasing the product with trending audio",
        videoScript: "0-3s: Hook with product reveal\n3-7s: Show key features\n7-12s: Lifestyle usage\n12-15s: CTA with price",
        caption: `Check out this amazing ${productName}! 🔥✨`,
        hashtags: "#trending #viral #instagram #reels #shopping #product",
        narrationScript: "You need to see this! This product is a game changer...",
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("reel-generator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
