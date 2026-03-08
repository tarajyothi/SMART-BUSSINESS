import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Lightbulb,
  DollarSign,
  BarChart3,
  Tag,
  Search,
} from "lucide-react";

interface ProductIdea {
  name: string;
  description: string;
  demand: "high" | "medium" | "low";
  trend: "rising" | "stable" | "declining";
  price_min: number;
  price_max: number;
  tags: string[];
}

const demandConfig = {
  high: { label: "High Demand", color: "text-green-400", bg: "bg-green-400/10", value: 85 },
  medium: { label: "Medium Demand", color: "text-amber-400", bg: "bg-amber-400/10", value: 55 },
  low: { label: "Low Demand", color: "text-red-400", bg: "bg-red-400/10", value: 25 },
};

const trendConfig = {
  rising: { icon: TrendingUp, label: "Rising", color: "text-green-400" },
  stable: { icon: Minus, label: "Stable", color: "text-muted-foreground" },
  declining: { icon: TrendingDown, label: "Declining", color: "text-red-400" },
};

const CATEGORIES = [
  "Fashion & Accessories",
  "Handmade Jewelry",
  "Home Decor",
  "Electronics",
  "Beauty & Skincare",
  "Food & Beverages",
  "Fitness & Sports",
  "Pet Products",
];

const ProductIdeas = () => {
  const [category, setCategory] = useState("");
  const [ideas, setIdeas] = useState<ProductIdea[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async (cat?: string) => {
    const input = cat || category;
    if (!input.trim()) {
      toast.error("Please enter or select a category");
      return;
    }
    setLoading(true);
    setIdeas([]);
    try {
      const { data, error } = await supabase.functions.invoke("product-ideas", {
        body: { category: input.trim() },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
      } else {
        setIdeas(data.ideas || []);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate ideas");
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">AI Product Ideas</h1>
              <p className="text-sm text-muted-foreground">Enter a category and let AI find trending product opportunities.</p>
            </div>
          </div>
        </motion.div>

        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="glass-card rounded-xl p-6 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter a category (e.g. Handmade Jewelry, Fitness Gear)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && generate()}
                  className="pl-10 bg-secondary border-border h-11"
                />
              </div>
              <Button onClick={() => generate()} disabled={loading} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCategory(c); generate(c); }}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-50"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-12 text-center">
            <RefreshCw className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-foreground mb-2">Researching trends...</h3>
            <p className="text-sm text-muted-foreground mb-4">AI is analyzing market data for "{category}"</p>
            <Progress value={60} className="h-1.5 max-w-xs mx-auto" />
          </motion.div>
        )}

        {/* Results */}
        {ideas.length > 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">
                {ideas.length} Product Ideas for "{category}"
              </h2>
              <Button variant="outline" size="sm" onClick={() => generate()} className="gap-2 border-border text-muted-foreground hover:text-foreground">
                <RefreshCw className="h-3.5 w-3.5" /> Regenerate
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ideas.map((idea, i) => {
                const demand = demandConfig[idea.demand] || demandConfig.medium;
                const trend = trendConfig[idea.trend] || trendConfig.stable;
                const TrendIcon = trend.icon;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display text-base font-semibold text-foreground leading-snug pr-2">{idea.name}</h3>
                      <div className={`flex items-center gap-1 shrink-0 ${trend.color}`}>
                        <TrendIcon className="h-4 w-4" />
                        <span className="text-[10px] font-medium">{trend.label}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{idea.description}</p>

                    {/* Demand bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[11px] font-medium ${demand.color}`}>
                          <BarChart3 className="h-3 w-3 inline mr-1" />
                          {demand.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{demand.value}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${idea.demand === "high" ? "bg-green-400" : idea.demand === "medium" ? "bg-amber-400" : "bg-red-400"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${demand.value}%` }}
                          transition={{ delay: 0.3 + i * 0.06, duration: 0.6 }}
                        />
                      </div>
                    </div>

                    {/* Price range */}
                    <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-secondary/50">
                      <DollarSign className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Suggested Price Range</p>
                        <p className="font-display text-sm font-bold text-foreground">₹{idea.price_min} – ₹{idea.price_max}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {idea.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {idea.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            <Tag className="h-2.5 w-2.5" /> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProductIdeas;
