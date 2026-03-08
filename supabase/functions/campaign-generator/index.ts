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
    const { product_id } = await req.json();
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

    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", product_id)
      .eq("user_id", user.id)
      .single();

    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_name, product_category")
      .eq("user_id", user.id)
      .single();

    const prompt = `Generate a full marketing campaign for this product:

Product: ${product.name}
Price: ₹${product.price}
Description: ${product.description || "N/A"}
Store: ${profile?.store_name || "Online Store"}
Category: ${profile?.product_category || "General"}

Create platform-specific, conversion-optimized marketing copy.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert digital marketing strategist specializing in small business campaigns. Create compelling, platform-optimized marketing content." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_campaign",
              description: "Generate marketing campaign content across platforms",
              parameters: {
                type: "object",
                properties: {
                  instagram_ad: {
                    type: "object",
                    properties: {
                      headline: { type: "string", description: "Bold attention-grabbing headline" },
                      body: { type: "string", description: "Engaging ad body copy (3-4 lines) with emojis" },
                      cta: { type: "string", description: "Call-to-action text" },
                      hashtags: { type: "string", description: "8-10 relevant hashtags" },
                    },
                    required: ["headline", "body", "cta", "hashtags"],
                  },
                  facebook_ad: {
                    type: "object",
                    properties: {
                      headline: { type: "string", description: "Facebook ad headline (max 40 chars)" },
                      primary_text: { type: "string", description: "Primary text above the image (2-3 sentences)" },
                      description: { type: "string", description: "Link description text" },
                      cta_type: { type: "string", description: "Suggested CTA button type: Shop Now, Learn More, etc." },
                    },
                    required: ["headline", "primary_text", "description", "cta_type"],
                  },
                  email_campaign: {
                    type: "object",
                    properties: {
                      subject_line: { type: "string", description: "Email subject line (max 60 chars)" },
                      preview_text: { type: "string", description: "Preview text shown in inbox (max 90 chars)" },
                      body: { type: "string", description: "Email body with greeting, product pitch, benefits, and CTA. Use markdown." },
                    },
                    required: ["subject_line", "preview_text", "body"],
                  },
                  google_ads: {
                    type: "object",
                    properties: {
                      headlines: {
                        type: "array",
                        items: { type: "string" },
                        description: "3 headlines (max 30 chars each)",
                      },
                      descriptions: {
                        type: "array",
                        items: { type: "string" },
                        description: "2 descriptions (max 90 chars each)",
                      },
                    },
                    required: ["headlines", "descriptions"],
                  },
                },
                required: ["instagram_ad", "facebook_ad", "email_campaign", "google_ads"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_campaign" } },
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

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const campaign = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ campaign, product_name: product.name }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Could not parse AI response");
  } catch (e) {
    console.error("campaign-generator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
