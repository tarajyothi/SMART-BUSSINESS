import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, Zap, RefreshCw, Copy, Check, Instagram, Facebook, Mail, Search,
  Megaphone,
} from "lucide-react";

interface Campaign {
  instagram_ad: { headline: string; body: string; cta: string; hashtags: string };
  facebook_ad: { headline: string; primary_text: string; description: string; cta_type: string };
  email_campaign: { subject_line: string; preview_text: string; body: string };
  google_ads: { headlines: string[]; descriptions: string[] };
}

const CampaignGenerator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("products")
      .select("id, name, price")
      .eq("user_id", user.id)
      .then(({ data }) => setProducts(data || []));
  }, [user]);

  const generate = async () => {
    if (!selectedProduct) { toast.error("Select a product first"); return; }
    setLoading(true);
    setCampaign(null);
    try {
      const { data, error } = await supabase.functions.invoke("campaign-generator", {
        body: { product_id: selectedProduct },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setCampaign(data.campaign);
      setProductName(data.product_name);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate campaign");
    }
    setLoading(false);
  };

  const copyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied!");
    setTimeout(() => setCopiedField(""), 2000);
  };

  const CopyBtn = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0"
      onClick={() => copyText(text, field)}
    >
      {copiedField === field ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );

  const Field = ({ label, value, id }: { label: string; value: string; id: string }) => (
    <div className="rounded-lg bg-secondary/50 p-4">
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <CopyBtn text={value} field={id} />
      </div>
      <p className="text-sm text-foreground whitespace-pre-wrap">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-primary" />
              <span className="font-display text-xl font-bold text-foreground">Campaign Generator</span>
            </div>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-10 max-w-4xl">
        {/* Product selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6 mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Select a Product</h2>
          <div className="flex gap-3">
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose a product..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — ₹{p.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="hero" onClick={generate} disabled={loading || !selectedProduct} className="gap-2">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Generate
            </Button>
          </div>
          {products.length === 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              No products found.{" "}
              <button onClick={() => navigate("/upload")} className="text-primary underline">Upload one first</button>.
            </p>
          )}
        </motion.div>

        {/* Loading */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-12 text-center">
            <RefreshCw className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-foreground mb-1">Crafting your campaigns...</h3>
            <p className="text-sm text-muted-foreground">AI is generating platform-optimized marketing copy</p>
          </motion.div>
        )}

        {/* Results */}
        {campaign && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Campaign for "{productName}"</h2>
                <p className="text-sm text-muted-foreground">Copy any section to use in your marketing</p>
              </div>
              <Button variant="hero-outline" size="sm" onClick={generate} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Regenerate
              </Button>
            </div>

            <Tabs defaultValue="instagram" className="space-y-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="instagram" className="gap-1.5 text-xs sm:text-sm">
                  <Instagram className="h-4 w-4" /> Instagram
                </TabsTrigger>
                <TabsTrigger value="facebook" className="gap-1.5 text-xs sm:text-sm">
                  <Facebook className="h-4 w-4" /> Facebook
                </TabsTrigger>
                <TabsTrigger value="email" className="gap-1.5 text-xs sm:text-sm">
                  <Mail className="h-4 w-4" /> Email
                </TabsTrigger>
                <TabsTrigger value="google" className="gap-1.5 text-xs sm:text-sm">
                  <Search className="h-4 w-4" /> Google
                </TabsTrigger>
              </TabsList>

              {/* Instagram */}
              <TabsContent value="instagram" className="glass-card rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Instagram className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Instagram Ad</h3>
                </div>
                <Field label="Headline" value={campaign.instagram_ad.headline} id="ig-headline" />
                <Field label="Ad Copy" value={campaign.instagram_ad.body} id="ig-body" />
                <Field label="Call to Action" value={campaign.instagram_ad.cta} id="ig-cta" />
                <Field label="Hashtags" value={campaign.instagram_ad.hashtags} id="ig-hashtags" />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={() => copyText(
                    `${campaign.instagram_ad.headline}\n\n${campaign.instagram_ad.body}\n\n${campaign.instagram_ad.cta}\n\n${campaign.instagram_ad.hashtags}`,
                    "ig-all"
                  )}
                >
                  {copiedField === "ig-all" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy All
                </Button>
              </TabsContent>

              {/* Facebook */}
              <TabsContent value="facebook" className="glass-card rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Facebook className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Facebook Ad</h3>
                </div>
                <Field label="Headline" value={campaign.facebook_ad.headline} id="fb-headline" />
                <Field label="Primary Text" value={campaign.facebook_ad.primary_text} id="fb-primary" />
                <Field label="Description" value={campaign.facebook_ad.description} id="fb-desc" />
                <Field label="CTA Button" value={campaign.facebook_ad.cta_type} id="fb-cta" />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={() => copyText(
                    `Headline: ${campaign.facebook_ad.headline}\n\n${campaign.facebook_ad.primary_text}\n\n${campaign.facebook_ad.description}\n\nCTA: ${campaign.facebook_ad.cta_type}`,
                    "fb-all"
                  )}
                >
                  {copiedField === "fb-all" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy All
                </Button>
              </TabsContent>

              {/* Email */}
              <TabsContent value="email" className="glass-card rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Email Campaign</h3>
                </div>
                <Field label="Subject Line" value={campaign.email_campaign.subject_line} id="em-subject" />
                <Field label="Preview Text" value={campaign.email_campaign.preview_text} id="em-preview" />
                <Field label="Email Body" value={campaign.email_campaign.body} id="em-body" />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={() => copyText(
                    `Subject: ${campaign.email_campaign.subject_line}\nPreview: ${campaign.email_campaign.preview_text}\n\n${campaign.email_campaign.body}`,
                    "em-all"
                  )}
                >
                  {copiedField === "em-all" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy All
                </Button>
              </TabsContent>

              {/* Google Ads */}
              <TabsContent value="google" className="glass-card rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Google Ads</h3>
                </div>
                <div className="rounded-lg bg-secondary/50 p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Headlines (30 chars max)</span>
                    <CopyBtn text={campaign.google_ads.headlines.join("\n")} field="ga-headlines" />
                  </div>
                  <div className="space-y-2">
                    {campaign.google_ads.headlines.map((h, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary w-5">H{i + 1}</span>
                        <span className="text-sm text-foreground">{h}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{h.length}/30</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-secondary/50 p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descriptions (90 chars max)</span>
                    <CopyBtn text={campaign.google_ads.descriptions.join("\n")} field="ga-descs" />
                  </div>
                  <div className="space-y-2">
                    {campaign.google_ads.descriptions.map((d, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-xs font-bold text-primary w-5 mt-0.5">D{i + 1}</span>
                        <span className="text-sm text-foreground">{d}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{d.length}/90</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={() => copyText(
                    `Headlines:\n${campaign.google_ads.headlines.map((h, i) => `H${i + 1}: ${h}`).join("\n")}\n\nDescriptions:\n${campaign.google_ads.descriptions.map((d, i) => `D${i + 1}: ${d}`).join("\n")}`,
                    "ga-all"
                  )}
                >
                  {copiedField === "ga-all" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy All
                </Button>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default CampaignGenerator;
