import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Zap, Package, Share2, ShoppingCart, Twitter, Facebook, Link2, Sparkles, Instagram, Hash, MessageCircle, Download, Copy, Send } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
  slug: string;
  instagram_caption: string;
  hashtags: string;
  ai_generated: boolean;
  created_at: string;
}

const ProductLanding = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem, totalItems } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug!)
        .single();
      if (!error && data) {
        setProduct(data as Product);
        // Track view
        await supabase.from("product_events").insert({
          product_id: data.id,
          event_type: "view",
        });
      }
      setLoading(false);
    };
    fetchProduct();
  }, [slug]);

  const shareUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleCopyCaption = () => {
    if (product?.instagram_caption) {
      navigator.clipboard.writeText(`${product.instagram_caption}\n\n${product.hashtags}`);
      toast.success("Caption & hashtags copied!");
    }
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${product?.name}!`)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Product not found</h1>
          <p className="text-muted-foreground mb-6">This product may have been removed or the link is incorrect.</p>
          <Link to="/"><Button variant="hero-outline">Go Home</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">AgentHub AI</span>
          </Link>
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-3xl rounded-full pointer-events-none" />

      <main className="container mx-auto px-6 py-12 max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-10 items-start"
        >
          {/* Product Image */}
          <div className="glass-card rounded-2xl overflow-hidden">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full aspect-square object-cover" />
            ) : (
              <div className="w-full aspect-square bg-secondary flex items-center justify-center">
                <Package className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="py-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              {product.ai_generated && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary mb-4">
                  <Sparkles className="h-3 w-3" />
                  AI-Generated Content
                </div>
              )}
              <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-3">Product</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">{product.name}</h1>
              <p className="text-4xl font-bold text-gradient font-display mb-6">₹{product.price}</p>

              {product.description && (
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">{product.description}</p>
              )}

              <Button
                variant="hero"
                size="lg"
                className="w-full mb-4 text-lg h-14"
                onClick={() => {
                  supabase.from("product_events").insert({ product_id: product.id, event_type: "click" });
                  toast.success("Added to cart!");
                }}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Buy Now
              </Button>

              {/* Share Buttons */}
              <div className="glass-card rounded-xl p-5 mt-6">
                <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-primary" />
                  Share this product
                </p>
                <div className="flex gap-3">
                  <Button variant="secondary" size="sm" onClick={handleShareTwitter} className="flex-1">
                    <Twitter className="h-4 w-4 mr-2" />Twitter
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleShareFacebook} className="flex-1">
                    <Facebook className="h-4 w-4 mr-2" />Facebook
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleCopyLink} className="flex-1">
                    <Link2 className="h-4 w-4 mr-2" />Copy Link
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* AI Generated Content Section */}
        {product.ai_generated && (product.instagram_caption || product.hashtags) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Generated Marketing Content
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Instagram Caption */}
              {product.instagram_caption && (
                <div className="glass-card rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                      <Instagram className="h-5 w-5 text-primary" />
                      Instagram Caption
                    </h3>
                    <Button variant="ghost" size="sm" onClick={handleCopyCaption}>Copy</Button>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{product.instagram_caption}</p>
                </div>
              )}

              {/* Hashtags */}
              {product.hashtags && (
                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                    <Hash className="h-5 w-5 text-primary" />
                    Hashtags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.hashtags.split(/\s+/).filter(Boolean).map((tag) => (
                      <span key={tag} className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1 border border-primary/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Publish Everywhere Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12"
        >
          <h2 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Publish Everywhere
          </h2>
          <p className="text-muted-foreground mb-6">Promote your product across all channels in one click.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Instagram */}
            <button
              onClick={handleCopyCaption}
              className="glass-card rounded-xl p-6 text-center hover:border-primary/30 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:from-pink-500/30 group-hover:to-purple-500/30 transition-colors">
                <Instagram className="h-6 w-6 text-pink-400" />
              </div>
              <p className="font-display text-sm font-semibold text-foreground">Instagram</p>
              <p className="text-xs text-muted-foreground mt-1">Copy caption + hashtags</p>
            </button>

            {/* Pinterest */}
            <button
              onClick={() => {
                const pinUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(product.image_url || "")}&description=${encodeURIComponent(product.name)}`;
                window.open(pinUrl, "_blank");
              }}
              className="glass-card rounded-xl p-6 text-center hover:border-primary/30 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center mx-auto mb-3 group-hover:bg-red-500/25 transition-colors">
                <svg className="h-6 w-6 text-red-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
              </div>
              <p className="font-display text-sm font-semibold text-foreground">Pinterest</p>
              <p className="text-xs text-muted-foreground mt-1">Pin product image</p>
            </button>

            {/* YouTube */}
            <button
              onClick={() => {
                const script = `🎬 YouTube Shorts Script for "${product.name}"\n\n🪝 Hook (0-3s):\n"Stop scrolling! You NEED this."\n\n📦 Product (3-15s):\n"Introducing ${product.name} — ${product.description || "your new must-have"}. Available now for just ₹${product.price}."\n\n🔥 CTA (15-20s):\n"Link in bio. Don't miss out!"\n\n${product.hashtags || ""}`;
                navigator.clipboard.writeText(script);
                toast.success("YouTube Shorts script copied!");
              }}
              className="glass-card rounded-xl p-6 text-center hover:border-primary/30 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-red-600/15 flex items-center justify-center mx-auto mb-3 group-hover:bg-red-600/25 transition-colors">
                <svg className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </div>
              <p className="font-display text-sm font-semibold text-foreground">YouTube</p>
              <p className="text-xs text-muted-foreground mt-1">Copy video script</p>
            </button>

            {/* Facebook */}
            <button
              onClick={handleShareFacebook}
              className="glass-card rounded-xl p-6 text-center hover:border-primary/30 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600/15 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600/25 transition-colors">
                <Facebook className="h-6 w-6 text-blue-500" />
              </div>
              <p className="font-display text-sm font-semibold text-foreground">Facebook</p>
              <p className="text-xs text-muted-foreground mt-1">Share product link</p>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => {
                const text = `Check out *${product.name}* for just ₹${product.price}!\n\n${product.description || ""}\n\n${shareUrl}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
              }}
              className="glass-card rounded-xl p-6 text-center hover:border-primary/30 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center mx-auto mb-3 group-hover:bg-green-500/25 transition-colors">
                <MessageCircle className="h-6 w-6 text-green-400" />
              </div>
              <p className="font-display text-sm font-semibold text-foreground">WhatsApp</p>
              <p className="text-xs text-muted-foreground mt-1">Share via message</p>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="glass-card rounded-xl p-6 text-center hover:border-primary/30 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                <Link2 className="h-6 w-6 text-primary" />
              </div>
              <p className="font-display text-sm font-semibold text-foreground">Copy Link</p>
              <p className="text-xs text-muted-foreground mt-1">Product page URL</p>
            </button>

            {/* Download Image */}
            <button
              onClick={async () => {
                if (!product.image_url) {
                  toast.error("No product image to download");
                  return;
                }
                try {
                  const response = await fetch(product.image_url);
                  const blob = await response.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${product.slug || product.name}.${blob.type.split("/")[1] || "jpg"}`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast.success("Image downloaded!");
                } catch {
                  toast.error("Failed to download image");
                }
              }}
              className="glass-card rounded-xl p-6 text-center hover:border-primary/30 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-500/25 transition-colors">
                <Download className="h-6 w-6 text-blue-400" />
              </div>
              <p className="font-display text-sm font-semibold text-foreground">Download</p>
              <p className="text-xs text-muted-foreground mt-1">Product image</p>
            </button>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by <Link to="/" className="text-primary hover:underline">AgentHub AI</Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ProductLanding;
