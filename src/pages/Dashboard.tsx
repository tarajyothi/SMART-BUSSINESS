import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Package,
  Eye,
  ShoppingCart,
  Upload,
  TrendingUp,
  Send,
  Lightbulb,
  Sparkles,
  Clock,
  FileText,
  Share2,
  ArrowUpRight,
  Plus,
  Bell,
  DollarSign,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  created_at: string;
  ai_generated: boolean | null;
  instagram_caption: string | null;
}

interface SocialPost {
  id: string;
  platform: string;
  status: string;
  created_at: string;
  product_id: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [autoPostEnabled, setAutoPostEnabled] = useState(false);
  const [togglingAutoPost, setTogglingAutoPost] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch profile
    supabase
      .from("profiles")
      .select("auto_post_enabled")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setAutoPostEnabled(data.auto_post_enabled);
      });

    // Fetch products
    supabase
      .from("products")
      .select("id, name, price, created_at, ai_generated, instagram_caption")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setProducts(data || []));

    // Fetch social posts
    supabase
      .from("social_posts")
      .select("id, platform, status, created_at, product_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setSocialPosts(data || []));

    // Fetch events for views
    supabase
      .from("products")
      .select("id")
      .eq("user_id", user.id)
      .then(async ({ data: prods }) => {
        const ids = (prods || []).map((p) => p.id);
        if (ids.length === 0) return;

        const { data: events } = await supabase
          .from("product_events")
          .select("event_type, revenue")
          .in("product_id", ids);

        const views = (events || []).filter((e) => e.event_type === "view").length;
        const orders = (events || []).filter((e) => e.event_type === "order").length;
        const rev = (events || []).reduce((s, e) => s + (Number(e.revenue) || 0), 0);
        setTotalViews(views);
        setTotalOrders(orders);
        setTotalRevenue(rev);
      });
  }, [user]);

  const handleToggleAutoPost = async (checked: boolean) => {
    setTogglingAutoPost(true);
    const { error } = await supabase
      .from("profiles")
      .update({ auto_post_enabled: checked })
      .eq("user_id", user!.id);
    if (error) {
      toast.error("Failed to update auto-post setting");
    } else {
      setAutoPostEnabled(checked);
      toast.success(checked ? "Auto-posting enabled!" : "Auto-posting disabled");
    }
    setTogglingAutoPost(false);
  };

  // Build activity feed from products + social posts
  const activityFeed = useMemo(() => {
    const items: { icon: typeof Package; label: string; detail: string; time: string; color: string }[] = [];

    products.slice(0, 8).forEach((p) => {
      items.push({
        icon: Package,
        label: "Product created",
        detail: p.name,
        time: p.created_at,
        color: "text-primary",
      });
      if (p.instagram_caption) {
        items.push({
          icon: Sparkles,
          label: "AI caption generated",
          detail: p.name,
          time: p.created_at,
          color: "text-purple-400",
        });
      }
    });

    socialPosts.slice(0, 8).forEach((sp) => {
      items.push({
        icon: Share2,
        label: `${sp.platform} post ${sp.status}`,
        detail: `Social post ${sp.status}`,
        time: sp.created_at,
        color: "text-green-400",
      });
    });

    return items
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8);
  }, [products, socialPosts]);

  // AI suggestions
  const suggestions = useMemo(() => {
    const tips: { icon: typeof Lightbulb; text: string; action?: string; href?: string }[] = [];
    if (products.length === 0) {
      tips.push({ icon: Upload, text: "Upload your first product to get started", action: "Upload", href: "/upload" });
    }
    if (products.length > 0 && products.length < 5) {
      tips.push({ icon: TrendingUp, text: "Add more products to increase visibility in the marketplace" });
    }
    if (socialPosts.length === 0 && products.length > 0) {
      tips.push({ icon: Share2, text: "Connect social accounts to auto-post your products", action: "Connect", href: "/social-accounts" });
    }
    if (products.length > 0) {
      tips.push({ icon: Lightbulb, text: "Run AI Market Insights to discover trending opportunities", action: "Analyze", href: "/market-insights" });
    }
    tips.push({ icon: Sparkles, text: "Generate marketing campaigns with AI to boost your sales", action: "Create", href: "/campaigns" });
    return tips.slice(0, 4);
  }, [products, socialPosts]);

  const stats = [
    { icon: Package, label: "Products", value: products.length.toString(), change: "", color: "from-primary/20 to-primary/5" },
    { icon: Eye, label: "Total Views", value: totalViews.toLocaleString(), change: "", color: "from-blue-500/20 to-blue-500/5" },
    { icon: ShoppingCart, label: "Orders", value: totalOrders.toString(), change: "", color: "from-green-500/20 to-green-500/5" },
    { icon: DollarSign, label: "Revenue", value: `₹${totalRevenue.toLocaleString()}`, change: "", color: "from-amber-500/20 to-amber-500/5" },
  ];

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
        {/* Top bar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
              Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening with your store today.</p>
          </div>
          <Button onClick={() => navigate("/upload")} size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> New Product
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-5 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-50`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  {s.change && (
                    <span className="text-[11px] font-medium text-green-400 flex items-center gap-0.5">
                      <ArrowUpRight className="h-3 w-3" /> {s.change}
                    </span>
                  )}
                </div>
                <p className="font-display text-2xl font-bold text-foreground tracking-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Automation Panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="rounded-xl border border-primary/20 bg-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-display text-sm font-semibold text-foreground">AI Automation</h3>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {aiAutomationFeed.length} actions
            </span>
          </div>
          {/* Summary counters */}
          <div className="grid grid-cols-4 gap-px bg-border/50">
            {aiStats.map((s) => (
              <div key={s.label} className="bg-card px-4 py-3 text-center">
                <p className="font-display text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          {/* Timeline */}
          <div className="px-5 py-3">
            {aiAutomationFeed.length === 0 ? (
              <div className="py-8 text-center">
                <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No AI actions yet. Upload a product to trigger AI automation.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
                <div className="space-y-1">
                  {aiAutomationFeed.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.04 }}
                      className="flex items-center gap-3 py-2 pl-1 relative"
                    >
                      <div className={`w-[30px] h-[30px] rounded-full ${item.bg} flex items-center justify-center shrink-0 relative z-10 ring-2 ring-card`}>
                        <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground truncate">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-muted-foreground"> — {item.detail}</span>
                        </p>
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">{formatTime(item.time)}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Main grid: Activity + Notifications + Auto-post */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-display text-sm font-semibold text-foreground">Activity Feed</h3>
              </div>
              <span className="text-[11px] text-muted-foreground">{activityFeed.length} events</span>
            </div>
            <div className="divide-y divide-border">
              {activityFeed.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No activity yet. Upload a product to get started.</p>
                </div>
              ) : (
                activityFeed.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/30 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground truncate">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground"> — {item.detail}</span>
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">{formatTime(item.time)}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Right column: Notifications + Auto-post */}
          <div className="space-y-6">
            {/* AI Suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-xl border border-border bg-card"
            >
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                <Bell className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-semibold text-foreground">AI Suggestions</h3>
              </div>
              <div className="divide-y divide-border">
                {suggestions.map((tip, i) => (
                  <div key={i} className="px-5 py-3 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <tip.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-foreground/80 leading-relaxed">{tip.text}</p>
                      {tip.action && tip.href && (
                        <button
                          onClick={() => navigate(tip.href!)}
                          className="text-[11px] font-medium text-primary mt-1 hover:underline inline-flex items-center gap-1"
                        >
                          {tip.action} <ArrowUpRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Auto-Post */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Send className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Auto-Post</h3>
                    <p className="text-[11px] text-muted-foreground">
                      {autoPostEnabled ? "Active" : "Disabled"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={autoPostEnabled}
                  onCheckedChange={handleToggleAutoPost}
                  disabled={togglingAutoPost}
                />
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-xl border border-border bg-card p-5 space-y-2"
            >
              <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
              {[
                { label: "Upload Product", icon: Upload, href: "/upload" },
                { label: "View Marketplace", icon: ShoppingCart, href: "/marketplace" },
                { label: "AI Image Studio", icon: Sparkles, href: "/image-studio" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.href)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-secondary/50 transition-colors group"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>{item.label}</span>
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
