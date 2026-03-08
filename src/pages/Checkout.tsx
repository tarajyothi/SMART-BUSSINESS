import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, ArrowLeft, Package, ShoppingCart, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";

const checkoutSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
  address: z.string().trim().min(10, "Address must be at least 10 characters").max(500, "Address is too long"),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto flex h-16 items-center px-6">
            <Link to="/" className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-display text-xl font-bold text-foreground">AgentHub AI</span>
            </Link>
          </div>
        </nav>
        <div className="container mx-auto px-6 py-24 max-w-2xl text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">Nothing to checkout</h1>
          <p className="text-muted-foreground mb-8">Add items to your cart first.</p>
          <Link to="/"><Button variant="hero">Browse Products</Button></Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto flex h-16 items-center px-6">
            <Link to="/" className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-display text-xl font-bold text-foreground">AgentHub AI</span>
            </Link>
          </div>
        </nav>
        <div className="container mx-auto px-6 py-24 max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <CheckCircle2 className="h-20 w-20 text-green-400 mx-auto mb-6" />
            <h1 className="font-display text-3xl font-bold text-foreground mb-3">Order Placed!</h1>
            <p className="text-muted-foreground mb-2">Thank you for your purchase.</p>
            <p className="text-sm text-muted-foreground mb-8">Order ID: <span className="font-mono text-foreground">{orderId.slice(0, 8)}</span></p>
            <Link to="/"><Button variant="hero">Continue Shopping</Button></Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = checkoutSchema.safeParse({ email, address });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url,
      }));

      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          customer_email: result.data.email,
          shipping_address: result.data.address,
          items: orderItems,
          total_price: totalPrice,
          status: "pending",
        })
        .select("id")
        .single();

      if (error) throw error;

      // Track order events for each product
      for (const item of items) {
        await supabase.from("product_events").insert({
          product_id: item.id,
          event_type: "order",
          revenue: item.price * item.quantity,
        });
      }

      setOrderId(data.id);
      setOrderPlaced(true);
      clearCart();
      toast.success("Order placed successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center px-6">
          <Link to="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">AgentHub AI</span>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Cart
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">Checkout</h1>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="md:col-span-3 space-y-6">
              <div className="glass-card rounded-xl p-6 space-y-5">
                <h2 className="font-display text-lg font-semibold text-foreground">Contact Information</h2>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary border-border"
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div className="glass-card rounded-xl p-6 space-y-5">
                <h2 className="font-display text-lg font-semibold text-foreground">Shipping Address</h2>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-foreground">Full Address</Label>
                  <textarea
                    id="address"
                    placeholder="Street address, city, state, PIN code"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={4}
                    className="w-full rounded-md bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                </div>
              </div>

              <Button type="submit" variant="hero" className="w-full h-14 text-lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order · ₹${totalPrice.toFixed(2)}`
                )}
              </Button>
            </form>

            {/* Order Summary */}
            <div className="md:col-span-2">
              <div className="glass-card rounded-xl p-6 sticky top-24">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground shrink-0">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-muted-foreground">Free</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-display font-bold text-foreground">Total</span>
                    <span className="font-display text-xl font-bold text-gradient">₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Checkout;
