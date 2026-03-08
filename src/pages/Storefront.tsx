import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Zap, Package, ShoppingCart, Store, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import defaultBanner from "@/assets/store-banner-default.jpg";

interface SellerProfile {
  user_id: string;
  full_name: string;
  store_name: string;
  product_category: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  slug: string | null;
  ai_generated: boolean | null;
}

const Storefront = () => {
  const { sellerName } = useParams<{ sellerName: string }>();
  const { addItem, totalItems } = useCart();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      // Find profile by store_name slug
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, store_name, product_category");

      const decodedName = decodeURIComponent(sellerName || "");
      const matched = (profiles || []).find((p: any) => {
        const slug = (p.store_name || p.full_name || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        return slug === decodedName.toLowerCase();
      }) as SellerProfile | undefined;

      if (matched) {
        setSeller(matched);
        const { data: prods } = await supabase
          .from("products")
          .select("id, name, price, description, image_url, slug, ai_generated")
          .eq("user_id", matched.user_id);
        setProducts((prods as Product[]) || []);
      }
      setLoading(false);
    };
    fetchStore();
  }, [sellerName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Store not found</h1>
          <p className="text-muted-foreground mb-6">This seller storefront doesn't exist.</p>
          <Link to="/marketplace"><Button variant="hero">Browse Marketplace</Button></Link>
        </div>
      </div>
    );
  }

  const storeName = seller.store_name || seller.full_name || "Unnamed Store";
  const initials = storeName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">AgentHub AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/marketplace">
              <Button variant="ghost" size="sm">Marketplace</Button>
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
        </div>
      </nav>

      {/* Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img src={defaultBanner} alt="Store banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* Seller Profile */}
      <div className="container mx-auto px-6 max-w-6xl relative z-10 -mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-end gap-5 mb-10"
        >
          <div className="w-24 h-24 rounded-2xl bg-primary/10 border-4 border-background flex items-center justify-center shrink-0">
            <span className="font-display text-2xl font-bold text-primary">{initials}</span>
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{storeName}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {seller.product_category && (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {seller.product_category}
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                {products.length} product{products.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Store Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6 mb-10"
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-2">About this store</h2>
          <p className="text-muted-foreground leading-relaxed">
            Welcome to {storeName}! Browse our collection of {seller.product_category?.toLowerCase() || "unique"} products.
            {products.length > 0
              ? ` We have ${products.length} product${products.length !== 1 ? "s" : ""} available for you.`
              : " New products coming soon!"}
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="mb-16">
          <h2 className="font-display text-xl font-semibold text-foreground mb-6">All Products</h2>
          {products.length === 0 ? (
            <div className="glass-card rounded-xl p-10 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">This store hasn't listed any products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-xl overflow-hidden group hover:border-primary/30 transition-all"
                >
                  <Link to={product.slug ? `/p/${product.slug}` : `/product/${product.id}`}>
                    <div className="aspect-square bg-secondary overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={product.slug ? `/p/${product.slug}` : `/product/${product.id}`}>
                      <h3 className="font-display font-semibold text-foreground text-sm mb-1 truncate hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-primary font-bold font-display mb-3">₹{product.price}</p>
                    <Button
                      variant="hero-outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image_url: product.image_url,
                          slug: product.slug,
                        });
                        toast.success("Added to cart!");
                      }}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" /> Add to Cart
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Powered by AgentHub AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Storefront;
