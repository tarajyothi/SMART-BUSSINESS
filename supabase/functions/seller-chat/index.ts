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
    const { messages } = await req.json();
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

    // Gather seller context
    const { data: products } = await supabase.from("products").select("*").eq("user_id", user.id);
    const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
    const { data: orders } = await supabase.from("orders").select("*");

    const productIds = (products || []).map((p: any) => p.id);
    let events: any[] = [];
    if (productIds.length > 0) {
      const { data: eventsData } = await supabase.from("product_events").select("*").in("product_id", productIds);
      events = eventsData || [];
    }

    const sellerOrders = (orders || []).filter((order: any) => {
      const items = order.items as any[];
      return items?.some((item: any) => productIds.includes(item.product_id));
    });

    const productSummary = (products || []).map((p: any) => ({
      name: p.name,
      price: p.price,
      description: p.description?.substring(0, 100),
      views: events.filter((e: any) => e.product_id === p.id && e.event_type === "view").length,
      clicks: events.filter((e: any) => e.product_id === p.id && e.event_type === "click").length,
      orders: events.filter((e: any) => e.product_id === p.id && e.event_type === "order").length,
    }));

    const systemPrompt = `You are an expert AI seller assistant for a small online business platform. You help sellers grow their business with actionable advice.

SELLER CONTEXT:
- Store name: ${profile?.store_name || "Not set"}
- Category: ${profile?.product_category || "General"}
- Products (${(products || []).length}): ${JSON.stringify(productSummary)}
- Total orders: ${sellerOrders.length}
- Total revenue: ₹${sellerOrders.reduce((s: number, o: any) => s + Number(o.total_price), 0)}

You can help with:
- Product suggestions & what to sell next
- Pricing strategy based on their current products
- Platform performance advice (Instagram, Facebook, WhatsApp, Pinterest)
- Marketing tips & best posting times
- Understanding their analytics data

Be concise, friendly, and data-driven. Use the seller's actual data to personalize advice. Format responses with markdown for readability. Keep responses under 300 words.`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("seller-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
