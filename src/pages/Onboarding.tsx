import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Zap,
  Store,
  Tag,
  Share2,
  Upload,
  ArrowRight,
  ArrowLeft,
  Check,
  Instagram,
  Facebook,
  Camera,
} from "lucide-react";

const CATEGORIES = [
  "Fashion & Accessories",
  "Handmade & Crafts",
  "Beauty & Skincare",
  "Food & Beverages",
  "Electronics & Gadgets",
  "Home & Decor",
  "Art & Prints",
  "Other",
];

const STEPS = [
  { icon: Store, title: "Store Name", desc: "Give your store a name" },
  { icon: Tag, title: "Category", desc: "What do you sell?" },
  { icon: Share2, title: "Social Accounts", desc: "Connect your platforms" },
  { icon: Upload, title: "First Product", desc: "Upload your first product" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const progress = ((step + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (step === 0 && !storeName.trim()) {
      toast.error("Please enter a store name");
      return;
    }
    if (step === 1 && !category) {
      toast.error("Please choose a category");
      return;
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        store_name: storeName.trim(),
        product_category: category,
        onboarding_completed: true,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Something went wrong. Please try again.");
    } else {
      toast.success("Welcome aboard! Let's start selling 🚀");
      navigate("/upload");
    }
    setLoading(false);
  };

  const handleSkipToUpload = () => {
    navigate("/upload");
  };

  const handleSkipToDashboard = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({
        store_name: storeName.trim() || "My Store",
        product_category: category || "Other",
        onboarding_completed: true,
      })
      .eq("user_id", user.id);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(190_95%_50%/0.06),transparent_60%)]" />

      {/* Header */}
      <div className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">AgentHub AI</span>
          </div>
          <button
            onClick={handleSkipToDashboard}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="relative z-10 container mx-auto px-6 pt-8 max-w-2xl">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                    ? "bg-primary/20 text-primary border border-primary/50"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="hidden sm:block text-xs text-muted-foreground">{s.title}</span>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Step Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Store Name */}
              {step === 0 && (
                <div className="glass-card rounded-2xl p-8 md:p-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Store className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                    What's your store name?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    This is how customers will recognize your brand.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="storeName" className="text-foreground">Store Name</Label>
                    <Input
                      id="storeName"
                      placeholder="e.g. Priya's Handmade Jewelry"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="bg-secondary border-border text-lg h-12"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Category */}
              {step === 1 && (
                <div className="glass-card rounded-2xl p-8 md:p-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Tag className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                    What do you sell?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Pick a category so we can tailor AI suggestions for you.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`rounded-xl p-4 text-left text-sm font-medium transition-all border ${
                          category === cat
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-secondary/50 text-foreground hover:border-primary/30"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Social Accounts */}
              {step === 2 && (
                <div className="glass-card rounded-2xl p-8 md:p-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Share2 className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                    Connect social accounts
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Link your profiles so AI can auto-post for you. You can always do this later.
                  </p>
                  <div className="space-y-3">
                    {[
                      { icon: Instagram, name: "Instagram", color: "text-pink-400" },
                      { icon: Facebook, name: "Facebook", color: "text-blue-400" },
                      { icon: Camera, name: "Pinterest", color: "text-red-400" },
                    ].map((platform) => (
                      <button
                        key={platform.name}
                        onClick={() => toast.info(`${platform.name} connection coming soon!`)}
                        className="w-full flex items-center gap-4 rounded-xl p-4 border border-border bg-secondary/50 hover:border-primary/30 transition-all text-left"
                      >
                        <platform.icon className={`h-6 w-6 ${platform.color}`} />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{platform.name}</p>
                          <p className="text-xs text-muted-foreground">Click to connect</p>
                        </div>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                          Coming soon
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Upload First Product */}
              {step === 3 && (
                <div className="glass-card rounded-2xl p-8 md:p-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                    <Upload className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                    Upload your first product
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    You're all set! Upload a product and let AI create your marketing content.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full gap-2"
                      onClick={handleFinish}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Upload My First Product"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="hero-outline"
                      size="lg"
                      className="w-full"
                      onClick={handleSkipToDashboard}
                    >
                      I'll do this later
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {step < 3 && (
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === 0}
                className="gap-1 text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button variant="hero" onClick={handleNext} className="gap-1">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
