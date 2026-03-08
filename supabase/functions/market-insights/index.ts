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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch seller's products
    const { data: products } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id);

    // Fetch product events
    const productIds = (products || []).map((p: any) => p.id);
    let events: any[] = [];
    if (productIds.length > 0) {
      const { data: eventsData } = await supabase
        .from("product_events")
        .select("*")
        .in("product_id", productIds);
      events = eventsData || [];
    }

    // Fetch orders
    const { data: orders } = await supabase
      .from("orders")
      .select("*");

    // Filter orders that contain seller's products
    const sellerOrders = (orders || []).filter((order: any) => {
      const items = order.items as any[];
      return items?.some((item: any) => productIds.includes(item.product_id));
    });

    const productSummary = (products || []).map((p: any) => ({
      name: p.name,
      price: p.price,
      category: p.description?.substring(0, 50),
      views: events.filter((e: any) => e.product_id === p.id && e.event_type === "view").length,
      clicks: events.filter((e: any) => e.product_id === p.id && e.event_type === "click").length,
      orders: events.filter((e: any) => e.product_id === p.id && e.event_type === "order").length,
      created: p.created_at,
    }));

    const prompt = `You are a market analytics AI for small online sellers. Analyze this seller's data and provide actionable insights.

SELLER DATA:
- Products: ${JSON.stringify(productSummary)}
- Total orders: ${sellerOrders.length}
- Total revenue: ₹${sellerOrders.reduce((s: number, o: any) => s + Number(o.total_price), 0)}

Respond with a JSON object using this EXACT structure (no markdown, just raw JSON):
{
  "trending_products": [
    { "name": "Product Name", "trend": "up" | "down" | "stable", "score": 0-100 }
  ],
  "price_insights": {
    "avg_price": number,
    "suggested_min": number,
    "suggested_max": number,
    "recommendation": "string"
  },
  "best_posting_times": [
    { "day": "Monday", "time": "10:00 AM", "engagement_score": 0-100 }
  ],
  "platform_performance": [
    { "platform": "Instagram" | "Facebook" | "WhatsApp" | "Pinterest", "score": 0-100, "recommendation": "string" }
  ],
  "marketing_strategy": {
    "summary": "string",
    "tips": ["tip1", "tip2", "tip3"],
    "focus_area": "string"
  },
  "weekly_forecast": [
    { "day": "Mon", "predicted_views": number, "predicted_sales": number }
  ]
}

If the seller has no products yet, provide general market insights and recommendations for getting started. Always return valid JSON.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a data analytics AI. Always respond with valid JSON only, no markdown formatting." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || "{}";
    
    // Strip markdown fences if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let insights;
    try {
      insights = JSON.parse(content);
    } catch {
      insights = { error: "Failed to parse AI response", raw: content };
    }

    return new Response(JSON.stringify({ insights, product_count: (products || []).length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("market-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
