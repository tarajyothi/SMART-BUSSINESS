import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productName, price } = await req.json();

    if (!productName) {
      return new Response(JSON.stringify({ error: "Product name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert e-commerce copywriter and social media marketer. You help small sellers create compelling content for their products. Always respond with the exact JSON structure requested. Be creative, engaging, and conversion-focused. Use emojis tastefully in captions.`;

    const userPrompt = `Generate marketing content for this product:
Product Name: ${productName}
Price: ₹${price}

Return a JSON object with exactly these fields:
{
  "description": "A compelling 2-3 sentence product description that highlights benefits and creates desire to buy",
  "instagram_caption": "An engaging Instagram caption (2-3 lines) with a call to action. Include relevant emojis.",
  "hashtags": "10-15 relevant hashtags separated by spaces, each starting with #"
}

Return ONLY the JSON object, no other text.`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "generate_product_content",
              description: "Generate marketing content for a product",
              parameters: {
                type: "object",
                properties: {
                  description: { type: "string", description: "Compelling product description" },
                  instagram_caption: { type: "string", description: "Engaging Instagram caption with emojis" },
                  hashtags: { type: "string", description: "Relevant hashtags separated by spaces" },
                },
                required: ["description", "instagram_caption", "hashtags"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_product_content" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const content = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(content), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try parsing from message content
    const messageContent = data.choices?.[0]?.message?.content || "";
    const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const content = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(content), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Could not parse AI response");
  } catch (e) {
    console.error("generate-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
