import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Zap, ArrowLeft, Eye, MousePointerClick, ShoppingCart, DollarSign, TrendingUp, Package } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface ProductStat {
  product_id: string;
  product_name: string;
  views: number;
  clicks: number;
  orders: number;
  revenue: number;
}

interface DailyData {
  date: string;
  views: number;
  clicks: number;
  orders: number;
  revenue: number;
}

const Analytics = () => {
  const { user, signOut } = useAuth();
  const [productStats, setProductStats] = useState<ProductStat[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      // Get user's products
      const { data: products } = await supabase
        .from("products")
        .select("id, name")
        .eq("user_id", user.id);

      if (!products || products.length === 0) {
        setLoading(false);
        return;
      }

      const productIds = products.map((p) => p.id);

      // Get all events for user's products
      const { data: events } = await supabase
        .from("product_events")
        .select("*")
        .in("product_id", productIds)
        .order("created_at", { ascending: true });

      if (!events) {
        setLoading(false);
        return;
      }

      // Compute per-product stats
      const statsMap: Record<string, ProductStat> = {};
      products.forEach((p) => {
        statsMap[p.id] = {
          product_id: p.id,
          product_name: p.name,
          views: 0,
          clicks: 0,
          orders: 0,
          revenue: 0,
        };
      });

      events.forEach((e) => {
        const s = statsMap[e.product_id];
        if (!s) return;
        if (e.event_type === "view") s.views++;
        else if (e.event_type === "click") s.clicks++;
        else if (e.event_type === "order") {
          s.orders++;
          s.revenue += Number(e.revenue) || 0;
        }
      });

      setProductStats(Object.values(statsMap));

      // Compute daily aggregates (last 14 days)
      const dailyMap: Record<string, DailyData> = {};
      const now = new Date();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        dailyMap[key] = { date: key, views: 0, clicks: 0, orders: 0, revenue: 0 };
      }

      events.forEach((e) => {
        const key = e.created_at.split("T")[0];
        if (dailyMap[key]) {
          if (e.event_type === "view") dailyMap[key].views++;
          else if (e.event_type === "click") dailyMap[key].clicks++;
          else if (e.event_type === "order") {
            dailyMap[key].orders++;
            dailyMap[key].revenue += Number(e.revenue) || 0;
          }
        }
      });

      setDailyData(Object.values(dailyMap));
      setLoading(false);
    };

    fetchAnalytics();
  }, [user]);

  const totals = useMemo(() => {
    return productStats.reduce(
      (acc, s) => ({
        views: acc.views + s.views,
        clicks: acc.clicks + s.clicks,
        orders: acc.orders + s.orders,
        revenue: acc.revenue + s.revenue,
      }),
      { views: 0, clicks: 0, orders: 0, revenue: 0 }
    );
  }, [productStats]);

  const statCards = [
    { icon: Eye, label: "Total Views", value: totals.views.toLocaleString(), color: "text-blue-400" },
    { icon: MousePointerClick, label: "Total Clicks", value: totals.clicks.toLocaleString(), color: "text-cyan-400" },
    { icon: ShoppingCart, label: "Total Orders", value: totals.orders.toLocaleString(), color: "text-green-400" },
    { icon: DollarSign, label: "Revenue", value: `₹${totals.revenue.toLocaleString()}`, color: "text-yellow-400" },
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

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
              Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-primary" />
            Analytics
          </h1>
          <p className="text-muted-foreground mb-10">Track your product performance across all channels.</p>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-6"
              >
                <s.icon className={`h-5 w-5 mb-3 ${s.color}`} />
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-3xl font-bold font-display text-foreground">{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Views & Clicks Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-xl p-6 mb-6"
          >
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Views & Clicks (Last 14 Days)</h2>
            {dailyData.some((d) => d.views > 0 || d.clicks > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(190, 95%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(190, 95%, 50%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(150, 80%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(150, 80%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 16%)" />
                  <XAxis dataKey="date" tickFormatter={formatDate} stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220, 18%, 8%)",
                      border: "1px solid hsl(220, 15%, 16%)",
                      borderRadius: "8px",
                      color: "hsl(210, 20%, 95%)",
                    }}
                    labelFormatter={formatDate}
                  />
                  <Area type="monotone" dataKey="views" stroke="hsl(190, 95%, 50%)" fill="url(#viewsGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="clicks" stroke="hsl(150, 80%, 50%)" fill="url(#clicksGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Eye className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p>No views yet. Share your products to start tracking.</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Orders & Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-xl p-6 mb-10"
          >
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Orders & Revenue (Last 14 Days)</h2>
            {dailyData.some((d) => d.orders > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 16%)" />
                  <XAxis dataKey="date" tickFormatter={formatDate} stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220, 18%, 8%)",
                      border: "1px solid hsl(220, 15%, 16%)",
                      borderRadius: "8px",
                      color: "hsl(210, 20%, 95%)",
                    }}
                    labelFormatter={formatDate}
                  />
                  <Bar dataKey="orders" fill="hsl(190, 95%, 50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" fill="hsl(45, 90%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <ShoppingCart className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p>No orders yet. They'll show up here when customers start buying.</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Per-Product Breakdown */}
          {productStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">Product Breakdown</h2>
              <div className="space-y-3">
                {productStats.map((p) => (
                  <div key={p.product_id} className="glass-card rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-primary shrink-0" />
                      <span className="font-display font-semibold text-foreground truncate">{p.product_name}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Views</p>
                        <p className="font-bold text-foreground">{p.views}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Clicks</p>
                        <p className="font-bold text-foreground">{p.clicks}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Orders</p>
                        <p className="font-bold text-foreground">{p.orders}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Revenue</p>
                        <p className="font-bold text-foreground">₹{p.revenue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {productStats.length === 0 && (
            <div className="glass-card rounded-xl p-10 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">No products to track</h2>
              <p className="text-muted-foreground mb-6">Upload your first product to start seeing analytics.</p>
              <Link to="/upload"><Button variant="hero">Upload Product</Button></Link>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Analytics;
