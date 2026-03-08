import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, Search, Package, ShoppingCart, Loader2, ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  slug: string | null;
  user_id: string;
  created_at: string;
}

interface ProductWithStats extends Product {
  views: number;
}

const CATEGORIES = [
  "All",
  "Fashion & Accessories",
  "Handmade & Crafts",
  "Beauty & Skincare",
  "Food & Beverages",
  "Electronics & Gadgets",
  "Home & Decor",
  "Art & Prints",
];

type SortOption = "newest" | "price-low" | "price-high" | "popular";

const Marketplace = () => {
  const { addItem, totalItems } = useCart();
  const [products, setProducts] = useState<ProductWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortOption>("newest");

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all products
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, price, description, image_url, slug, user_id, created_at")
        .order("created_at", { ascending: false });

      // Fetch view counts for popularity
      const { data: events } = await supabase
        .from("product_events")
        .select("product_id, event_type");

      const viewCounts: Record<string, number> = {};
      (events || []).forEach((e: any) => {
        if (e.event_type === "view" || e.event_type === "click") {
          viewCounts[e.product_id] = (viewCounts[e.product_id] || 0) + 1;
        }
      });

      const enriched: ProductWithStats[] = ((prods as Product[]) || []).map((p) => ({
        ...p,
        views: viewCounts[p.id] || 0,
      }));

      setProducts(enriched);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q);
      if (category === "All") return matchesSearch;
      return (
        matchesSearch &&
        (p.description || "").toLowerCase().includes(category.toLowerCase())
      );
    });

    switch (sort) {
      case "price-low":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "popular":
        result = [...result].sort((a, b) => b.views - a.views);
        break;
      case "newest":
      default:
        // already sorted by created_at desc from query
        break;
    }

    return result;
  }, [products, search, category, sort]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">AgentHub AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/marketplace" className="text-sm text-primary font-medium hidden sm:inline">
              Marketplace
            </Link>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline">
              Sign In
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

      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">Marketplace</h1>
            <p className="text-muted-foreground">
              Discover {products.length} product{products.length !== 1 ? "s" : ""} from sellers powered by AI.
            </p>
          </div>

          {/* Search + Sort Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary border-border h-11"
              />
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                <SelectTrigger className="w-[160px] bg-secondary border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low → High</SelectItem>
                  <SelectItem value="price-high">Price: High → Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap mb-8">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground mt-1.5 shrink-0" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all border ${
                  category === cat
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            {search && ` for "${search}"`}
            {category !== "All" && ` in ${category}`}
          </p>

          {/* Product Grid */}
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">No products found</h2>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filters.</p>
              {(search || category !== "All") && (
                <Button
                  variant="hero-outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.5) }}
                  className="glass-card rounded-xl overflow-hidden hover:border-primary/30 transition-all group"
                >
                  <Link to={product.slug ? `/p/${product.slug}` : `/product/${product.id}`}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-secondary flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </Link>
                  <div className="p-4">
                    <Link to={product.slug ? `/p/${product.slug}` : `/product/${product.id}`}>
                      <h3 className="font-display font-semibold text-foreground truncate text-sm group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-primary font-bold font-display">₹{product.price}</p>
                      {product.views > 0 && (
                        <span className="text-[10px] text-muted-foreground">{product.views} views</span>
                      )}
                    </div>
                    <Button
                      variant="hero-outline"
                      size="sm"
                      className="w-full mt-3 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
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
        </motion.div>
      </main>
    </div>
  );
};

export default Marketplace;
