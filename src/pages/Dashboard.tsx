import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Zap, Package, Eye, ShoppingCart, Upload, List, BarChart3, LogOut, Share2, Send, ClipboardList, Lightbulb, Image as ImageIcon, Video, Megaphone } from "lucide-react";
import SellerChatbot from "@/components/SellerChatbot";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [autoPostEnabled, setAutoPostEnabled] = useState(false);
  const [togglingAutoPost, setTogglingAutoPost] = useState(false);

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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const stats = [
    { icon: Package, label: "Total Products", value: "0" },
    { icon: Eye, label: "Total Views", value: "0" },
    { icon: ShoppingCart, label: "Total Sales", value: "0" },
  ];

  const actions = [
    { icon: Upload, label: "Upload Product", desc: "Add a new product to your store", href: "/upload" },
    { icon: List, label: "My Products", desc: "View and manage your listings", href: "/dashboard" },
    { icon: ClipboardList, label: "Orders", desc: "View and manage customer orders", href: "/orders" },
    { icon: BarChart3, label: "Analytics", desc: "Track your performance metrics", href: "/analytics" },
    { icon: Share2, label: "Social Accounts", desc: "Connect your social media platforms", href: "/social-accounts" },
    { icon: Lightbulb, label: "AI Insights", desc: "AI-powered market analysis & strategy", href: "/market-insights" },
    { icon: ImageIcon, label: "Image Studio", desc: "AI-powered product image editing", href: "/image-studio" },
    { icon: Video, label: "Video Scripts", desc: "Generate marketing video scripts", href: "/video-scripts" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">AgentHub AI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}!
          </h1>
          <p className="text-muted-foreground mb-10">Here's your seller dashboard overview.</p>

          {/* Auto-Post Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card rounded-xl p-6 mb-10 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">Auto Posting</h3>
                <p className="text-sm text-muted-foreground">
                  {autoPostEnabled
                    ? "Products will be auto-posted to connected social accounts on upload."
                    : "Enable to automatically share new products to your connected social accounts."}
                </p>
              </div>
            </div>
            <Switch
              checked={autoPostEnabled}
              onCheckedChange={handleToggleAutoPost}
              disabled={togglingAutoPost}
            />
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-6 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold font-display text-foreground">{s.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {actions.map((a, i) => (
              <motion.button
                key={a.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={() => navigate(a.href)}
                className="glass-card rounded-xl p-6 text-left hover:border-primary/30 transition-all group cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <a.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">{a.label}</h3>
                <p className="text-sm text-muted-foreground">{a.desc}</p>
              </motion.button>
            ))}
          </div>

          {/* Empty State */}
          <div className="glass-card rounded-xl p-10 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">No products yet</h2>
            <p className="text-muted-foreground mb-6">Upload your first product to get started with AI-powered selling.</p>
            <Button variant="hero" onClick={() => navigate("/upload")}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Product
            </Button>
          </div>
        </motion.div>
      </main>
      <SellerChatbot />
    </div>
  );
};

export default Dashboard;
