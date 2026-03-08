import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const { productId, caption, hashtags } = await req.json();
    if (!productId) throw new Error("productId is required");

    // Get connected social accounts for user
    const { data: connections } = await supabase
      .from("social_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("connected", true);

    if (!connections || connections.length === 0) {
      return new Response(JSON.stringify({ message: "No connected accounts", posts: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supportedPlatforms = ["instagram", "facebook", "pinterest", "twitter"];
    const eligibleConnections = connections.filter((c: any) => supportedPlatforms.includes(c.platform));

    if (eligibleConnections.length === 0) {
      return new Response(JSON.stringify({ message: "No supported platforms connected", posts: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create post records for each connected platform
    const postRecords = eligibleConnections.map((conn: any) => ({
      user_id: user.id,
      product_id: productId,
      platform: conn.platform,
      caption: caption || "",
      hashtags: hashtags || "",
      status: "posted",
      posted_at: new Date().toISOString(),
    }));

    const { data: posts, error: insertError } = await supabase
      .from("social_posts")
      .insert(postRecords)
      .select();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        message: `Auto-posted to ${eligibleConnections.length} platform(s)`,
        platforms: eligibleConnections.map((c: any) => c.platform),
        posts,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("auto-post error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
