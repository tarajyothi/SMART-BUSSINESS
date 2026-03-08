import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TOOL_PROMPTS: Record<string, string> = {
  "remove-bg":
    "Remove the background from this product image completely. Make the background pure white or transparent. Keep the product perfectly intact with clean edges.",
  enhance:
    "Enhance this product image: improve lighting, sharpen details, boost colors naturally, and make it look professional and ready for e-commerce. Keep the product exactly as is.",
  lifestyle:
    "Take this product and place it in a beautiful, realistic lifestyle setting. Show the product being used or displayed in an aspirational, Instagram-worthy environment with natural lighting and warm tones. Make it look like a professional lifestyle photoshoot.",
  poster:
    "Create a professional marketing poster featuring this product. Add bold, modern typography with a catchy tagline, use vibrant brand colors, and design it for social media marketing. Make it eye-catching and sales-ready with a clean layout.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Auth check
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

    const { image_url, tool } = await req.json();

    if (!image_url || !tool) {
      return new Response(JSON.stringify({ error: "image_url and tool are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = TOOL_PROMPTS[tool];
    if (!prompt) {
      return new Response(JSON.stringify({ error: `Unknown tool: ${tool}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing image with tool: ${tool} for user: ${user.id}`);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: image_url } },
            ],
          },
        ],
        modalities: ["image", "text"],
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
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedImage = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = aiData.choices?.[0]?.message?.content || "";

    if (!generatedImage) {
      return new Response(JSON.stringify({ error: "AI did not generate an image. Try again.", text: textResponse }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upload to storage for persistence
    const base64Data = generatedImage.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const fileName = `${user.id}/studio-${tool}-${Date.now()}.png`;

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
    const { error: uploadError } = await adminSupabase.storage
      .from("product-images")
      .upload(fileName, imageBuffer, { contentType: "image/png", upsert: true });

    let resultUrl = generatedImage;
    if (!uploadError) {
      const { data: publicUrl } = adminSupabase.storage
        .from("product-images")
        .getPublicUrl(fileName);
      resultUrl = publicUrl.publicUrl;
    } else {
      console.error("Upload error (returning base64 instead):", uploadError);
    }

    return new Response(
      JSON.stringify({ result_url: resultUrl, text: textResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("image-studio error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
