import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Video,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Film,
  Mic,
  Instagram,
  Hash,
  RefreshCw,
  Download,
  ImagePlus,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface VideoResult {
  reelIdea: string;
  videoScript: string;
  caption: string;
  hashtags: string;
  narrationScript: string;
}

const CopyBtn = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(`${label} copied!`);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
};

const sections = [
  { key: "reelIdea" as const, label: "Video Idea", icon: Sparkles, accent: "bg-primary/10 text-primary" },
  { key: "videoScript" as const, label: "15-30s Video Script", icon: Film, accent: "bg-cyan-400/10 text-cyan-400" },
  { key: "narrationScript" as const, label: "Voice Narration", icon: Mic, accent: "bg-amber-400/10 text-amber-400" },
  { key: "caption" as const, label: "Caption", icon: Instagram, accent: "bg-pink-400/10 text-pink-400" },
  { key: "hashtags" as const, label: "Hashtags", icon: Hash, accent: "bg-emerald-400/10 text-emerald-400" },
];

const AIVideoGenerator = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VideoResult | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a product name");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("reel-generator", {
        body: {
          productName: name,
          productDescription: description || "No description provided",
          productPrice: price || "N/A",
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as VideoResult);
      toast.success("Video content generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate video content");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = () => {
    if (!result) return;
    const text = `VIDEO MARKETING — ${name}\n${"=".repeat(40)}\n\n🎬 VIDEO IDEA\n${result.reelIdea}\n\n🎥 VIDEO SCRIPT (15-30s)\n${result.videoScript}\n\n🎙️ VOICE NARRATION\n${result.narrationScript}\n\n📱 CAPTION\n${result.caption}\n\n# HASHTAGS\n${result.hashtags}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `video-marketing-${name.replace(/\s+/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Marketing pack downloaded!");
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">AI Video Generator</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Create scroll-stopping marketing videos for your products with AI.
          </p>
        </div>

        {/* Input Form */}
        <div className="glass-card rounded-xl p-6 space-y-5">
          <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Product Details
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-foreground">Product Image</Label>
              <label className="flex flex-col items-center justify-center w-full h-44 rounded-xl border-2 border-dashed border-border bg-secondary/30 cursor-pointer hover:border-primary/40 transition-colors overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-sm">Click to upload image</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            {/* Text Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-name" className="text-foreground">Product Name *</Label>
                <Input
                  id="product-name"
                  placeholder="e.g. Handmade Leather Wallet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-price" className="text-foreground">Price (₹)</Label>
                <Input
                  id="product-price"
                  placeholder="e.g. 1299"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-desc" className="text-foreground">Description</Label>
            <Textarea
              id="product-desc"
              placeholder="Describe your product features, materials, unique selling points..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-secondary border-border resize-none"
            />
          </div>

          <Button
            variant="hero"
            onClick={handleGenerate}
            disabled={loading || !name.trim()}
            className="w-full h-12 text-base gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Video className="h-5 w-5" />}
            {loading ? "Generating Video Content..." : "Generate Video"}
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="glass-card rounded-xl p-14 text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
            <p className="font-display text-lg font-semibold text-foreground">Creating your video blueprint...</p>
            <p className="text-sm text-muted-foreground mt-1">AI is writing scripts, captions & more</p>
          </div>
        )}

        {/* Results Panel */}
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Actions bar */}
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-foreground">Video Creation Panel</h2>
              <div className="flex gap-2">
                <Button variant="hero-outline" size="sm" onClick={handleDownloadAll} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Download All
                </Button>
                <Button variant="hero-outline" size="sm" onClick={handleGenerate} className="gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" /> Generate Another
                </Button>
              </div>
            </div>

            {/* Product preview strip */}
            <div className="glass-card rounded-xl p-4 flex items-center gap-4">
              {imagePreview ? (
                <img src={imagePreview} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Package className="h-7 w-7 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-foreground truncate">{name}</p>
                <p className="text-sm text-muted-foreground truncate">{description || "No description"}</p>
              </div>
              {price && <p className="text-primary font-bold font-display shrink-0">₹{price}</p>}
            </div>

            {/* Content cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {sections.map((s, i) => (
                <motion.div
                  key={s.key}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`glass-card rounded-xl p-5 space-y-3 ${s.key === "videoScript" ? "md:col-span-2" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${s.accent.split(" ")[0]}`}>
                        <s.icon className={`h-4 w-4 ${s.accent.split(" ")[1]}`} />
                      </div>
                      <h3 className="font-display font-semibold text-foreground text-sm">{s.label}</h3>
                    </div>
                    <CopyBtn text={result[s.key]} label={s.label} />
                  </div>

                  {s.key === "hashtags" ? (
                    <div className="flex flex-wrap gap-1.5">
                      {result.hashtags
                        .split(/\s+/)
                        .filter(Boolean)
                        .map((tag) => (
                          <span key={tag} className="text-xs bg-primary/10 text-primary rounded-full px-2.5 py-0.5 border border-primary/20">
                            {tag}
                          </span>
                        ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                      {result[s.key]}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div className="text-center py-14">
            <Film className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Enter product details and click "Generate Video" to get started.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AIVideoGenerator;
