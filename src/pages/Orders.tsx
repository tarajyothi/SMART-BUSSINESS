import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Zap, ArrowLeft, Package, Loader2, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";

interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customer_email: string;
  items: OrderItem[];
  total_price: number;
  status: string;
  created_at: string;
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      // Get seller's product IDs
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .eq("user_id", user.id);
      const productIds = (products || []).map((p) => p.id);

      if (productIds.length === 0) {
        setLoading(false);
        return;
      }

      // Get all orders and filter for ones containing seller's products
      // Orders table uses permissive insert but select requires auth
      // We need a broader approach — query orders that contain our product IDs
      const { data: allOrders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      // Filter orders containing at least one of seller's products
      const sellerOrders = (allOrders || []).filter((order: any) => {
        const items = order.items as OrderItem[];
        return items?.some((item) => productIds.includes(item.product_id));
      });

      setOrders(sellerOrders as Order[]);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">AgentHub AI</span>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Orders</h1>
          <p className="text-muted-foreground mb-8">Track and manage orders for your products.</p>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <ClipboardList className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">No orders yet</h2>
              <p className="text-muted-foreground">Orders for your products will appear here.</p>
            </div>
          ) : (
            <div className="glass-card rounded-xl overflow-hidden">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-2">Order ID</div>
                <div className="col-span-3">Product</div>
                <div className="col-span-2">Customer</div>
                <div className="col-span-1">Price</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Date</div>
              </div>

              {/* Rows */}
              {orders.map((order, i) => {
                // Show a row per product item that belongs to this seller
                return order.items.map((item, j) => (
                  <motion.div
                    key={`${order.id}-${j}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (i * order.items.length + j) * 0.03 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 border-b border-border/50 last:border-b-0 hover:bg-secondary/30 transition-colors"
                  >
                    {/* Order ID */}
                    <div className="col-span-2">
                      <span className="md:hidden text-xs text-muted-foreground mr-2">Order:</span>
                      <span className="font-mono text-sm text-foreground">{order.id.slice(0, 8)}</span>
                    </div>

                    {/* Product */}
                    <div className="col-span-3">
                      <span className="md:hidden text-xs text-muted-foreground mr-2">Product:</span>
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                      {item.quantity > 1 && (
                        <span className="text-xs text-muted-foreground ml-1">×{item.quantity}</span>
                      )}
                    </div>

                    {/* Customer */}
                    <div className="col-span-2">
                      <span className="md:hidden text-xs text-muted-foreground mr-2">Customer:</span>
                      <span className="text-sm text-muted-foreground truncate block">{order.customer_email}</span>
                    </div>

                    {/* Price */}
                    <div className="col-span-1">
                      <span className="md:hidden text-xs text-muted-foreground mr-2">Price:</span>
                      <span className="text-sm font-semibold text-foreground">₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <span className="md:hidden text-xs text-muted-foreground mr-2">Status:</span>
                      <span className={`inline-flex items-center text-xs font-medium rounded-full px-2.5 py-0.5 border capitalize ${statusColor[order.status] || statusColor.pending}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="col-span-2">
                      <span className="md:hidden text-xs text-muted-foreground mr-2">Date:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </motion.div>
                ));
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Orders;
