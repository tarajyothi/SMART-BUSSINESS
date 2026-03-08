import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Zap, Package, Share2, ShoppingCart, Twitter, Facebook, Link2, Sparkles, Instagram, Hash } from "lucide-react";
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
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug!)
        .single();
      if (!error && data) setProduct(data as Product);
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

              <Button variant="hero" size="lg" className="w-full mb-4 text-lg h-14">
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
