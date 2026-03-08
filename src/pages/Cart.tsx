import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Zap, ArrowLeft, ShoppingCart, Trash2, Minus, Plus, Package } from "lucide-react";
import { motion } from "framer-motion";

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();

  if (items.length === 0) {
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
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Browse products and add items to your cart.</p>
          <Link to="/"><Button variant="hero">Browse Products</Button></Link>
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

      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Continue Shopping
          </Link>
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">Shopping Cart</h1>
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive">
              Clear Cart
            </Button>
          </div>

          <div className="space-y-4 mb-8">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-4 flex items-center gap-4"
              >
                {/* Image */}
                <Link to={item.slug ? `/p/${item.slug}` : "#"} className="shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={item.slug ? `/p/${item.slug}` : "#"}>
                    <h3 className="font-display font-semibold text-foreground truncate hover:text-primary transition-colors">{item.name}</h3>
                  </Link>
                  <p className="text-primary font-bold font-display text-lg">₹{item.price}</p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-8 text-center font-semibold text-foreground">{item.quantity}</span>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Subtotal + Remove */}
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-foreground">₹{(item.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeItem(item.id)} className="text-xs text-destructive hover:underline mt-1 inline-flex items-center gap-1">
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Total */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-display text-lg font-bold text-foreground">₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-sm text-muted-foreground">Calculated at checkout</span>
            </div>
            <div className="border-t border-border pt-4 flex items-center justify-between mb-6">
              <span className="font-display text-xl font-bold text-foreground">Total</span>
              <span className="font-display text-2xl font-bold text-gradient">₹{totalPrice.toFixed(2)}</span>
            </div>
            <Link to="/checkout">
              <Button variant="hero" className="w-full h-14 text-lg">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Cart;
