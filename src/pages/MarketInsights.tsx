import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Clock,
  Share2,
  Lightbulb,
  BarChart3,
  ArrowLeft,
  RefreshCw,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts";

interface Insights {
  trending_products: { name: string; trend: string; score: number }[];
  price_insights: {
    avg_price: number;
    suggested_min: number;
    suggested_max: number;
    recommendation: string;
  };
  best_posting_times: { day: string; time: string; engagement_score: number }[];
  platform_performance: { platform: string; score: number; recommendation: string }[];
  marketing_strategy: {
    summary: string;
    tips: string[];
    focus_area: string;
  };
  weekly_forecast: { day: string; predicted_views: number; predicted_sales: number }[];
}

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-400" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-400" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

const MarketInsights = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [productCount, setProductCount] = useState(0);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("market-insights");
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
      } else {
        setInsights(data.insights);
        setProductCount(data.product_count);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch insights");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-display text-xl font-bold text-foreground">Market Insights</span>
            </div>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-10 max-w-6xl">
        {!insights && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-12 text-center max-w-lg mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              AI Market Insights
            </h2>
            <p className="text-muted-foreground mb-8">
              Let AI analyze your products, sales, and engagement data to give you actionable market insights and recommendations.
            </p>
            <Button variant="hero" size="lg" onClick={fetchInsights} className="gap-2">
              <Zap className="h-4 w-4" /> Generate Insights
            </Button>
          </motion.div>
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card rounded-2xl p-12 text-center max-w-lg mx-auto"
          >
            <RefreshCw className="h-10 w-10 text-primary animate-spin mx-auto mb-6" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Analyzing your data...</h3>
            <p className="text-muted-foreground mb-4">AI is crunching your product and sales data</p>
            <Progress value={66} className="h-1.5 max-w-xs mx-auto" />
          </motion.div>
        )}

        {insights && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Your Market Insights</h2>
                <p className="text-sm text-muted-foreground">Based on {productCount} product(s) in your store</p>
              </div>
              <Button variant="hero-outline" size="sm" onClick={fetchInsights} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
            </div>

            {/* Row 1: Trending + Price */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Trending Products */}
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Trending Products</h3>
                </div>
                {insights.trending_products?.length > 0 ? (
                  <div className="space-y-3">
                    {insights.trending_products.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                          <span className="text-sm font-medium text-foreground">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendIcon trend={p.trend} />
                          <div className="w-16">
                            <Progress value={p.score} className="h-1.5" />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{p.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Add products to see trends</p>
                )}
              </div>

              {/* Price Insights */}
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Price Range Insights</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-1">Avg Price</p>
                    <p className="font-display text-xl font-bold text-foreground">₹{insights.price_insights?.avg_price || 0}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-1">Suggested Min</p>
                    <p className="font-display text-xl font-bold text-green-400">₹{insights.price_insights?.suggested_min || 0}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-1">Suggested Max</p>
                    <p className="font-display text-xl font-bold text-primary">₹{insights.price_insights?.suggested_max || 0}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {insights.price_insights?.recommendation || "Upload products to get pricing recommendations."}
                </p>
              </div>
            </div>

            {/* Row 2: Best Times + Platform Performance */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Best Posting Times */}
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Best Time to Post</h3>
                </div>
                {insights.best_posting_times?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={insights.best_posting_times}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          color: "hsl(var(--foreground))",
                        }}
                        formatter={(value: number) => [`${value}%`, "Engagement"]}
                        labelFormatter={(label) => {
                          const item = insights.best_posting_times?.find((t) => t.day === label);
                          return `${label} at ${item?.time || ""}`;
                        }}
                      />
                      <Bar dataKey="engagement_score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available yet</p>
                )}
              </div>

              {/* Platform Performance */}
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Share2 className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Top Performing Platform</h3>
                </div>
                {insights.platform_performance?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={insights.platform_performance}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="platform" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <PolarRadiusAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
                      <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">Connect social accounts to see performance</p>
                )}
              </div>
            </div>

            {/* Row 3: Strategy + Forecast */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Marketing Strategy */}
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Marketing Strategy</h3>
                </div>
                <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Focus Area</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{insights.marketing_strategy?.focus_area || "General growth"}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {insights.marketing_strategy?.summary || "Generate insights to get strategy recommendations."}
                </p>
                {insights.marketing_strategy?.tips?.length > 0 && (
                  <ul className="space-y-2">
                    {insights.marketing_strategy.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                        </div>
                        {tip}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Weekly Forecast */}
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Weekly Forecast</h3>
                </div>
                {insights.weekly_forecast?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={insights.weekly_forecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Area type="monotone" dataKey="predicted_views" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} name="Views" />
                      <Area type="monotone" dataKey="predicted_sales" stroke="hsl(150, 80%, 50%)" fill="hsl(150, 80%, 50%)" fillOpacity={0.1} name="Sales" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No forecast data available</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default MarketInsights;
