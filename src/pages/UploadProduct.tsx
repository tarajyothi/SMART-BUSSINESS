import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Upload, ImagePlus, ArrowLeft, Sparkles, Send, Instagram, Facebook, Hash, Twitter, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface GeneratedContent {
  description: string;
  instagram_caption: string;
  pinterest_title: string;
  youtube_script: string;
  facebook_ad_text: string;
  hashtags: string;
}

const ContentCard = ({ icon, label, content, color }: { icon: React.ReactNode; label: string; content: string; color: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>{icon}</div>
          {label}
        </h4>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 px-2">
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
};

const UploadProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [autoPostEnabled, setAutoPostEnabled] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [productSlug, setProductSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("auto_post_enabled")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setAutoPostEnabled(data.auto_post_enabled);
      });
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setGeneratedContent(null);

    try {
      let image_url: string | null = null;

      if (imageFile) {
        setLoadingStage("Uploading image...");
        const fileExt = imageFile.name.split(".").pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);
        image_url = urlData.publicUrl;
      }

      setLoadingStage("Creating product...");
      const { data: product, error } = await supabase
        .from("products")
        .insert({ user_id: user.id, name, price: parseFloat(price), description, image_url })
        .select()
        .single();
      if (error) throw error;

      setProductId(product.id);
      setProductSlug(product.slug);

      // Generate AI content
      setLoadingStage("Generating AI content for all platforms...");
      try {
        const { data: aiData, error: aiError } = await supabase.functions.invoke("generate-content", {
          body: { productName: name, price },
        });
        if (aiError) throw aiError;

        const content: GeneratedContent = {
          description: aiData.description || "",
          instagram_caption: aiData.instagram_caption || "",
          pinterest_title: aiData.pinterest_title || "",
          youtube_script: aiData.youtube_script || "",
          facebook_ad_text: aiData.facebook_ad_text || "",
          hashtags: aiData.hashtags || "",
        };
        setGeneratedContent(content);

        const updateData: Record<string, unknown> = {
          instagram_caption: content.instagram_caption,
          hashtags: content.hashtags,
          pinterest_title: content.pinterest_title,
          youtube_script: content.youtube_script,
          facebook_ad_text: content.facebook_ad_text,
          ai_generated: true,
        };
        if (!description && content.description) {
          updateData.description = content.description;
        }

        await supabase.from("products").update(updateData).eq("id", product.id);
        toast.success("AI content generated for all platforms!");
      } catch (aiErr) {
        console.error("AI generation failed:", aiErr);
        toast.error("AI content generation failed. You can retry later.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload product");
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  };

  const handlePublish = async () => {
    if (!productId || !generatedContent) return;

    if (autoPostEnabled) {
      setLoading(true);
      setLoadingStage("Auto-posting to social media...");
      try {
        const { data: postData, error: postError } = await supabase.functions.invoke("auto-post", {
          body: {
            productId,
            caption: generatedContent.instagram_caption,
            hashtags: generatedContent.hashtags,
          },
        });
        if (postError) throw postError;
        if (postData?.platforms?.length > 0) {
          toast.success(`Auto-posted to ${postData.platforms.join(", ")}!`);
        } else {
          toast.info("No connected social accounts to auto-post to.");
        }
      } catch (autoPostErr) {
        console.error("Auto-post failed:", autoPostErr);
        toast.error("Auto-posting failed. You can share manually.");
      } finally {
        setLoading(false);
        setLoadingStage("");
      }
    }

    navigate(`/p/${productSlug}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">AgentHub AI</span>
          </div>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Upload Product</h1>
        <p className="text-muted-foreground mb-8">Add a new product — AI will generate marketing content for every platform.</p>

        {!generatedContent ? (
          <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 space-y-6 max-w-xl">
            <div className="space-y-2">
              <Label className="text-foreground">Product Image</Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload image</p>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Product Name</Label>
              <Input id="name" placeholder="e.g. Handmade Candle" value={name} onChange={(e) => setName(e.target.value)} required className="bg-secondary border-border" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-foreground">Price (₹)</Label>
              <Input id="price" type="number" min="0" step="0.01" placeholder="499" value={price} onChange={(e) => setPrice(e.target.value)} required className="bg-secondary border-border" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Description <span className="text-muted-foreground font-normal">(optional — AI will generate if empty)</span></Label>
              <textarea
                id="description"
                placeholder="Leave blank to auto-generate with AI..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-md bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {autoPostEnabled && (
              <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                <Send className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">Auto-posting enabled — content will be shared after you review it.</span>
              </div>
            )}

            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  {loadingStage}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Generate AI Content
                </>
              )}
            </Button>
          </form>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">AI-Generated Content</h2>
                <p className="text-sm text-muted-foreground">Review your content before publishing.</p>
              </div>
            </div>

            {/* Product description */}
            {generatedContent.description && (
              <ContentCard
                icon={<Zap className="h-4 w-4 text-primary" />}
                label="Product Description"
                content={generatedContent.description}
                color="bg-primary/10"
              />
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {/* Instagram */}
              <ContentCard
                icon={<Instagram className="h-4 w-4 text-pink-400" />}
                label="Instagram Caption"
                content={generatedContent.instagram_caption}
                color="bg-pink-500/10"
              />

              {/* Facebook */}
              <ContentCard
                icon={<Facebook className="h-4 w-4 text-blue-500" />}
                label="Facebook Ad Text"
                content={generatedContent.facebook_ad_text}
                color="bg-blue-500/10"
              />

              {/* Pinterest */}
              <ContentCard
                icon={
                  <svg className="h-4 w-4 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                  </svg>
                }
                label="Pinterest Title"
                content={generatedContent.pinterest_title}
                color="bg-red-500/10"
              />

              {/* YouTube */}
              <ContentCard
                icon={
                  <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                }
                label="YouTube Shorts Script"
                content={generatedContent.youtube_script}
                color="bg-red-600/10"
              />
            </div>

            {/* Hashtags */}
            {generatedContent.hashtags && (
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Hash className="h-4 w-4 text-primary" />
                    </div>
                    Hashtags
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedContent.hashtags);
                      toast.success("Hashtags copied!");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {generatedContent.hashtags.split(/\s+/).filter(Boolean).map((tag) => (
                    <span key={tag} className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1 border border-primary/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="hero" className="flex-1" onClick={handlePublish} disabled={loading}>
                {loading ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    {loadingStage}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {autoPostEnabled ? "Publish & Auto-Post" : "Go to Product Page"}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default UploadProduct;
