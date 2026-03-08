import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Zap,
  ArrowLeft,
  Video,
  Instagram,
  Youtube,
  Music2,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Hash,
  Sparkles,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
}

interface ReelScript {
  title: string;
  duration: string;
  hook: string;
  script: string;
  caption: string;
  hashtags: string;
  music_suggestion: string;
}

interface ShortsScript {
  title: string;
  duration: string;
  hook: string;
  script: string;
  description: string;
  tags: string;
}

interface TikTokScript {
  title: string;
  duration: string;
  concept: string;
  hook: string;
  script: string;
  caption: string;
  sound_suggestion: string;
}

interface Scripts {
  instagram_reel: ReelScript;
  youtube_shorts: ShortsScript;
  tiktok: TikTokScript;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const ScriptBlock = ({ label, content }: { label: string; content: string }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <CopyButton text={content} />
    </div>
    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-secondary/30 rounded-lg p-3 border border-border">
      {content}
    </p>
  </div>
);

const VideoScripts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [scripts, setScripts] = useState<Scripts | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeTab, setActiveTab] = useState<"instagram" | "youtube" | "tiktok">("instagram");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("products")
      .select("id, name, price, description")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data as Product[]) || []);
        setLoadingProducts(false);
      });
  }, [user]);

  const handleGenerate = async () => {
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) {
      toast.error("Please select a product");
      return;
    }
    setLoading(true);
    setScripts(null);
    try {
      const { data, error } = await supabase.functions.invoke("video-scripts", {
        body: {
          product_name: product.name,
          product_description: product.description,
          product_price: product.price,
        },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
      } else if (data?.scripts) {
        setScripts(data.scripts);
        toast.success("Video scripts generated!");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate scripts");
    }
    setLoading(false);
  };

  const tabs = [
    { id: "instagram" as const, icon: Instagram, label: "Instagram Reel", color: "text-pink-400" },
    { id: "youtube" as const, icon: Youtube, label: "YouTube Shorts", color: "text-red-400" },
    { id: "tiktok" as const, icon: Music2, label: "TikTok", color: "text-foreground" },
  ];

  const copyAll = () => {
    if (!scripts) return;
    let text = "";
    if (activeTab === "instagram") {
      const s = scripts.instagram_reel;
      text = `${s.title}\n\n🎬 Hook: ${s.hook}\n\n📝 Script:\n${s.script}\n\n📱 Caption:\n${s.caption}\n\n${s.hashtags}\n\n🎵 Music: ${s.music_suggestion}`;
    } else if (activeTab === "youtube") {
      const s = scripts.youtube_shorts;
      text = `${s.title}\n\n🎬 Hook: ${s.hook}\n\n📝 Script:\n${s.script}\n\n📝 Description:\n${s.description}\n\n🏷️ Tags: ${s.tags}`;
    } else {
      const s = scripts.tiktok;
      text = `${s.title}\n\n💡 Concept: ${s.concept}\n\n🎬 Hook: ${s.hook}\n\n📝 Script:\n${s.script}\n\n📱 Caption:\n${s.caption}\n\n🎵 Sound: ${s.sound_suggestion}`;
    }
    navigator.clipboard.writeText(text);
    toast.success("Full script copied!");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-display text-xl font-bold text-foreground">Marketing Videos</span>
            </div>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-10 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Product Selection */}
          <div className="glass-card rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Generate Video Scripts</h2>
                <p className="text-sm text-muted-foreground">AI creates platform-specific scripts for your products</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="flex-1 bg-secondary border-border">
                  <SelectValue placeholder={loadingProducts ? "Loading products..." : "Select a product"} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — ₹{p.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="hero"
                onClick={handleGenerate}
                disabled={loading || !selectedProduct}
                className="gap-2"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Generating..." : "Generate Scripts"}
              </Button>
            </div>
            {products.length === 0 && !loadingProducts && (
              <p className="text-sm text-muted-foreground mt-3">
                No products found.{" "}
                <button onClick={() => navigate("/upload")} className="text-primary hover:underline">
                  Upload one first
                </button>
              </p>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="glass-card rounded-xl p-12 text-center">
              <RefreshCw className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
              <p className="font-display text-lg font-semibold text-foreground">Writing your scripts...</p>
              <p className="text-sm text-muted-foreground mt-1">Creating content for 3 platforms</p>
            </div>
          )}

          {/* Results */}
          {scripts && !loading && (
            <AnimatePresence mode="wait">
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Platform Tabs */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                          activeTab === tab.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-primary" : tab.color}`} />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                  <Button variant="hero-outline" size="sm" onClick={copyAll} className="gap-1">
                    <Copy className="h-3 w-3" /> Copy All
                  </Button>
                </div>

                {/* Instagram Reel */}
                {activeTab === "instagram" && scripts.instagram_reel && (
                  <motion.div
                    key="ig"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card rounded-xl p-6"
                  >
                    <div className="flex items-center gap-2 mb-5">
                      <Instagram className="h-5 w-5 text-pink-400" />
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {scripts.instagram_reel.title}
                      </h3>
                      <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {scripts.instagram_reel.duration}
                      </span>
                    </div>
                    <ScriptBlock label="🎬 Hook (First 3 Seconds)" content={scripts.instagram_reel.hook} />
                    <ScriptBlock label="📝 Full Script" content={scripts.instagram_reel.script} />
                    <ScriptBlock label="📱 Caption" content={scripts.instagram_reel.caption} />
                    <ScriptBlock label="# Hashtags" content={scripts.instagram_reel.hashtags} />
                    <ScriptBlock label="🎵 Music Suggestion" content={scripts.instagram_reel.music_suggestion} />
                  </motion.div>
                )}

                {/* YouTube Shorts */}
                {activeTab === "youtube" && scripts.youtube_shorts && (
                  <motion.div
                    key="yt"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card rounded-xl p-6"
                  >
                    <div className="flex items-center gap-2 mb-5">
                      <Youtube className="h-5 w-5 text-red-400" />
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {scripts.youtube_shorts.title}
                      </h3>
                      <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {scripts.youtube_shorts.duration}
                      </span>
                    </div>
                    <ScriptBlock label="🎬 Hook" content={scripts.youtube_shorts.hook} />
                    <ScriptBlock label="📝 Full Script" content={scripts.youtube_shorts.script} />
                    <ScriptBlock label="📝 Description" content={scripts.youtube_shorts.description} />
                    <ScriptBlock label="🏷️ Tags" content={scripts.youtube_shorts.tags} />
                  </motion.div>
                )}

                {/* TikTok */}
                {activeTab === "tiktok" && scripts.tiktok && (
                  <motion.div
                    key="tt"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card rounded-xl p-6"
                  >
                    <div className="flex items-center gap-2 mb-5">
                      <Music2 className="h-5 w-5 text-foreground" />
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {scripts.tiktok.title}
                      </h3>
                      <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {scripts.tiktok.duration}
                      </span>
                    </div>
                    <ScriptBlock label="💡 Video Concept" content={scripts.tiktok.concept} />
                    <ScriptBlock label="🎬 Hook" content={scripts.tiktok.hook} />
                    <ScriptBlock label="📝 Full Script" content={scripts.tiktok.script} />
                    <ScriptBlock label="📱 Caption" content={scripts.tiktok.caption} />
                    <ScriptBlock label="🎵 Sound Suggestion" content={scripts.tiktok.sound_suggestion} />
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default VideoScripts;
