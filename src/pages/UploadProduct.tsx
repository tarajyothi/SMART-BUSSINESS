import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Upload, ImagePlus, ArrowLeft, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";

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

      // Create product first
      setLoadingStage("Creating product...");
      const { data: product, error } = await supabase
        .from("products")
        .insert({
          user_id: user.id,
          name,
          price: parseFloat(price),
          description,
          image_url,
        })
        .select()
        .single();

      if (error) throw error;

      // Generate AI content
      setLoadingStage("Generating AI content...");
      let aiCaption = "";
      let aiHashtags = "";
      try {
        const { data: aiData, error: aiError } = await supabase.functions.invoke("generate-content", {
          body: { productName: name, price },
        });

        if (aiError) throw aiError;

        aiCaption = aiData.instagram_caption || "";
        aiHashtags = aiData.hashtags || "";

        const updateData: Record<string, unknown> = {
          instagram_caption: aiCaption,
          hashtags: aiHashtags,
          ai_generated: true,
        };

        if (!description && aiData.description) {
          updateData.description = aiData.description;
        }

        await supabase
          .from("products")
          .update(updateData)
          .eq("id", product.id);

        toast.success("Product uploaded with AI content!");
      } catch (aiErr) {
        console.error("AI generation failed:", aiErr);
        toast.success("Product uploaded! AI content generation failed, you can retry later.");
      }

      // Auto-post if enabled
      if (autoPostEnabled) {
        setLoadingStage("Auto-posting to social media...");
        try {
          const { data: postData, error: postError } = await supabase.functions.invoke("auto-post", {
            body: {
              productId: product.id,
              caption: aiCaption,
              hashtags: aiHashtags,
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
          toast.error("Auto-posting failed. You can share manually from the product page.");
        }
      }

      navigate(`/p/${product.slug}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload product");
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
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

      <main className="container mx-auto px-6 py-12 max-w-xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Upload Product</h1>
        <p className="text-muted-foreground mb-8">Add a new product — AI will generate marketing content automatically.</p>

        <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 space-y-6">
          {/* Image Upload */}
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

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Product Name</Label>
            <Input id="name" placeholder="e.g. Handmade Candle" value={name} onChange={(e) => setName(e.target.value)} required className="bg-secondary border-border" />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-foreground">Price (₹)</Label>
            <Input id="price" type="number" min="0" step="0.01" placeholder="499" value={price} onChange={(e) => setPrice(e.target.value)} required className="bg-secondary border-border" />
          </div>

          {/* Description */}
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

          {/* Auto-post indicator */}
          {autoPostEnabled && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <Send className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Auto-posting is enabled — your product will be shared to connected accounts after upload.</span>
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
      </main>
    </div>
  );
};

export default UploadProduct;
