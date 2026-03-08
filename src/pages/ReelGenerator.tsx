import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clapperboard, Copy, Loader2, Sparkles, Film, MessageSquare, Hash, Mic, Video } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
}

interface ReelResult {
  reelIdea: string;
  videoScript: string;
  caption: string;
  hashtags: string;
  narrationScript: string;
}

const cards = [
  { key: "reelIdea" as const, label: "Reel Idea", icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
  { key: "videoScript" as const, label: "15s Video Script", icon: Film, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { key: "caption" as const, label: "Instagram Caption", icon: MessageSquare, color: "text-pink-400", bg: "bg-pink-400/10" },
  { key: "hashtags" as const, label: "Hashtags", icon: Hash, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { key: "narrationScript" as const, label: "Voice Narration Script", icon: Mic, color: "text-amber-400", bg: "bg-amber-400/10" },
];

const ReelGenerator = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReelResult | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("products")
      .select("id, name, description, price, image_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setProducts(data);
      });
  }, [user]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleGenerate = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("reel-generator", {
        body: {
          productName: selectedProduct.name,
          productDescription: selectedProduct.description,
          productPrice: selectedProduct.price,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as ReelResult);
      toast.success("Reel content generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate reel content");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Clapperboard className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">AI Reel Generator</h1>
          </div>
          <p className="text-muted-foreground ml-14">Generate viral Instagram Reel ideas, scripts, captions & more for your products.</p>
        </div>

        {/* Product Selector */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <label className="text-sm font-medium text-foreground">Select a Product</label>
          <div className="flex gap-3">
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="flex-1 bg-secondary border-border">
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
            <Button variant="hero" onClick={handleGenerate} disabled={!selectedProductId || loading} className="gap-2 shrink-0">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
              Generate Reel Idea
            </Button>
          </div>

          {/* Selected product preview */}
          {selectedProduct && (
            <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
              {selectedProduct.image_url ? (
                <img src={selectedProduct.image_url} alt="" className="w-14 h-14 rounded-lg object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                  <Film className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">{selectedProduct.name}</p>
                <p className="text-sm text-muted-foreground truncate">{selectedProduct.description || "No description"}</p>
              </div>
              <p className="text-primary font-bold font-display shrink-0">₹{selectedProduct.price}</p>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Crafting your viral reel content...</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="grid md:grid-cols-2 gap-5">
            {cards.map((card, i) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`glass-card rounded-xl p-6 space-y-3 ${card.key === "videoScript" ? "md:col-span-2" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${card.bg}`}>
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                    <h3 className="font-display font-semibold text-foreground">{card.label}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(result[card.key], card.label)}
                    className="text-muted-foreground hover:text-foreground gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                  {result[card.key]}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div className="text-center py-16">
            <Clapperboard className="h-14 w-14 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">Select a product and click "Generate Reel Idea" to get started.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReelGenerator;
