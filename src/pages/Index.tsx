import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Zap, Quote, Instagram, Facebook, Share2, Link as LinkIcon, Heart,
  ShoppingCart, Upload, Sparkles, Globe, ArrowRight, Store, ShoppingBag,
  Package, Camera, FileText, Hash, Send, CheckCircle2, Image, MessageSquare,
  TrendingUp, BarChart3
} from "lucide-react";
import demoProduct from "@/assets/demo-product.jpg";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
    <div className="container mx-auto flex h-16 items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <Zap className="h-6 w-6 text-primary" />
        <span className="font-display text-xl font-bold text-foreground">AgentHub AI</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <Link to="/marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Marketplace</Link>
        <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
        <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
        <a href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Demo</a>
        <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
      </div>
      <Link to="/signup"><Button variant="hero" size="sm">Start Selling</Button></Link>
    </div>
  </nav>
);

/* ───────── Animated Hero Flow ───────── */
const flowSteps = [
  { icon: Camera, label: "Upload Product", color: "from-primary to-primary/70" },
  { icon: Sparkles, label: "AI Generates Content", color: "from-primary/70 to-accent" },
  { icon: Send, label: "Publish Everywhere", color: "from-accent to-primary" },
];

const HeroSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActiveStep((s) => (s + 1) % 3), 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(190_95%_50%/0.08),transparent_60%)]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8">
              <Zap className="h-3.5 w-3.5" />
              <span>AI-powered selling platform</span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
              Turn Any Product Into a{" "}
              <span className="text-gradient">Selling Machine</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-10 leading-relaxed">
              Upload a product photo. AI creates descriptions, captions, hashtags, and a landing page — then publishes everywhere.
            </p>
            <div className="flex items-center gap-4 mb-8">
              <Link to="/signup"><Button variant="hero" size="lg" className="gap-2 h-14 px-8 text-base">Get Started Free <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to="/marketplace"><Button variant="hero-outline" size="lg" className="h-14 px-8 text-base">Browse Products</Button></Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Free plan</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> AI powered</span>
            </div>
          </motion.div>

          {/* Right: Animated Flow Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Flow cards */}
              <div className="space-y-4">
                {flowSteps.map((step, i) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.15 }}
                    className={`glass-card rounded-xl p-5 flex items-center gap-4 transition-all duration-500 ${
                      activeStep === i ? "border-primary/40 glow-border scale-[1.02]" : "border-border/30 opacity-60"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0 transition-transform duration-500 ${activeStep === i ? "scale-110" : ""}`}>
                      <step.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-primary/60">STEP {i + 1}</span>
                        {activeStep === i && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                      <p className="font-display font-semibold text-foreground">{step.label}</p>
                    </div>
                    {activeStep > i && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Animated connector line */}
              <div className="absolute left-[29px] top-[68px] bottom-[68px] w-px">
                <div className="h-full bg-border/30" />
                <motion.div
                  className="absolute top-0 left-0 w-full bg-primary"
                  animate={{ height: `${(activeStep / 2) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
              </div>

              {/* Preview card that appears */}
              <AnimatePresence mode="wait">
                {activeStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="mt-4 glass-card rounded-xl p-4 border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <img src={demoProduct} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">Beaded Bracelet — Published!</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Instagram</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Facebook</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Landing Page</span>
                        </div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ───────── Social Proof (logo strip + stats) ───────── */
const SocialProofSection = () => {
  const platforms = [
    { icon: Instagram, name: "Instagram" },
    { icon: Store, name: "Shopify" },
    { icon: ShoppingBag, name: "Etsy" },
    { icon: Package, name: "Amazon" },
    { icon: Facebook, name: "Facebook" },
  ];

  const stats = [
    { value: "10K+", label: "Products Created" },
    { value: "5K+", label: "Active Sellers" },
    { value: "50K+", label: "AI Generations" },
    { value: "99%", label: "Uptime" },
  ];

  return (
    <section className="py-20 border-y border-border/30">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <p className="text-sm text-muted-foreground text-center mb-8">Trusted by sellers on the platforms you already use</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-12">
            {platforms.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                <p.icon className="h-6 w-6" />
                <span className="font-display text-lg font-semibold">{p.name}</span>
              </motion.div>
            ))}
          </div>
          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-3xl font-bold text-gradient">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ───────── How It Works ───────── */
const HowItWorksSection = () => {
  const steps = [
    { icon: Upload, step: "01", title: "Upload Product", desc: "Add your product photo and basic details — name, price, and category. That's all we need.", gradient: "from-primary/20 to-primary/5" },
    { icon: Sparkles, step: "02", title: "AI Generates Marketing", desc: "Our AI creates product descriptions, social captions, hashtags, and a ready-to-share landing page.", gradient: "from-accent/20 to-accent/5" },
    { icon: Globe, step: "03", title: "Publish Everywhere", desc: "Share your product across Instagram, Facebook, WhatsApp, and your own storefront in one click.", gradient: "from-primary/20 to-accent/5" },
  ];

  return (
    <section id="how-it-works" className="py-28 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(190_95%_50%/0.04),transparent_50%)]" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">How It Works</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Three steps to <span className="text-gradient">start selling</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">From product photo to published everywhere — in under 60 seconds.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-20 left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-px">
            <div className="h-full bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40" />
            <motion.div
              className="absolute top-0 left-0 h-full bg-primary"
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
            />
          </div>
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              className="glass-card rounded-2xl p-8 text-center hover:border-primary/30 transition-all relative group"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 relative`}>
                <s.icon className="h-7 w-7 text-primary" />
                <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg">
                  {s.step}
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-3 text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ───────── Features ───────── */
const FeaturesSection = () => {
  const features = [
    { icon: FileText, title: "AI Product Writer", desc: "Generate high-converting product descriptions instantly" },
    { icon: MessageSquare, title: "AI Caption Generator", desc: "Create viral-worthy social media captions" },
    { icon: Globe, title: "Auto Landing Pages", desc: "One-click beautiful product pages that sell" },
    { icon: TrendingUp, title: "Market Insights", desc: "AI-powered analytics and pricing recommendations" },
    { icon: Image, title: "Image Studio", desc: "Generate and enhance product images with AI" },
    { icon: BarChart3, title: "Social Commerce", desc: "Sell directly from your social media profiles" },
  ];

  return (
    <section id="features" className="py-28 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(190_95%_50%/0.05),transparent_60%)]" />
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Features</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Everything you need to <span className="text-gradient">sell more</span>
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-xl p-7 hover:border-primary/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ───────── Product Demo Preview ───────── */
const SeeItInActionSection = () => (
  <section id="demo" className="py-28 relative">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(190_95%_50%/0.06),transparent_60%)]" />
    <div className="container mx-auto px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Live Demo</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold">
          See It <span className="text-gradient">In Action</span>
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Upload a product photo and watch AI generate everything you need to start selling.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8"
      >
        {/* Product card */}
        <div className="glass-card rounded-2xl overflow-hidden group">
          <div className="relative overflow-hidden">
            <img src={demoProduct} alt="Handmade Beaded Bracelet" className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            <div className="absolute top-3 right-3 flex gap-2">
              <div className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <Heart className="h-4 w-4 text-foreground" />
              </div>
              <div className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <Share2 className="h-4 w-4 text-foreground" />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-xl font-bold text-foreground">Handmade Beaded Bracelet</h3>
              <span className="font-display text-xl font-bold text-primary">₹349</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Artisan crafted • Natural stones • Adjustable fit</p>
            <Button variant="hero" className="w-full gap-2">
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </Button>
          </div>
        </div>

        {/* AI-generated content cards */}
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-6 flex-1"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Generated Caption</span>
            </div>
            <p className="text-foreground leading-relaxed text-sm">
              ✨ Handcrafted with love — each bead tells a story. Our beaded bracelet blends natural stones with artisan charm for a look that's uniquely yours. 🌿💎
            </p>
            <p className="text-primary text-xs mt-3">#HandmadeJewelry #BeadedBracelet #ArtisanCraft #ShopSmall #NaturalStones</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="glass-card rounded-xl p-6 flex-1"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <LinkIcon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Product Page Preview</span>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <div className="w-2 h-2 rounded-full bg-accent" />
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] text-muted-foreground ml-2">agenthub.ai/p/beaded-bracelet</span>
              </div>
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-md bg-muted overflow-hidden shrink-0">
                  <img src={demoProduct} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Handmade Beaded Bracelet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">₹349 • In Stock</p>
                  <div className="flex gap-1 mt-2">
                    <div className="h-5 w-14 rounded bg-primary/20 text-[9px] flex items-center justify-center text-primary font-medium">Buy Now</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Share2 className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Share Everywhere</span>
            </div>
            <div className="flex gap-3">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Facebook, label: "Facebook" },
                { icon: Share2, label: "WhatsApp" },
                { icon: LinkIcon, label: "Copy Link" },
              ].map((s) => (
                <div key={s.label} className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group">
                  <s.icon className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[10px] text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

/* ───────── Testimonials ───────── */
const TestimonialsSection = () => {
  const testimonials = [
    { quote: "AgentHub AI saved me 10+ hours per week creating product pages. My sales doubled in the first month.", name: "Priya Sharma", role: "Handmade Jewelry Seller", img: testimonial1 },
    { quote: "I went from zero to 50 products listed in a single day. The AI-generated captions are incredibly good.", name: "Arjun Mehta", role: "Dropshipping Entrepreneur", img: testimonial2 },
    { quote: "The auto-publish feature is a game changer. I post across 4 platforms with one click.", name: "Sneha Patel", role: "Instagram Shop Owner", img: testimonial3 },
  ];

  return (
    <section className="py-28 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Testimonials</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Loved by <span className="text-gradient">sellers</span>
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card rounded-2xl p-8 hover:border-primary/30 transition-all relative group"
            >
              <Quote className="h-8 w-8 text-primary/20 mb-4 group-hover:text-primary/40 transition-colors" />
              <p className="text-foreground text-base mb-6 leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <img src={t.img} alt={t.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/20" />
                <div>
                  <p className="font-display font-semibold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ───────── Pricing ───────── */
const PricingSection = () => {
  const plans = [
    { name: "Free", price: "₹0", period: "forever", features: ["5 products", "Basic AI writing", "1 landing page"], highlight: false },
    { name: "Pro", price: "₹499", period: "/month", features: ["50 products", "Advanced AI tools", "Unlimited pages", "Priority support"], highlight: true },
    { name: "Business", price: "₹999", period: "/month", features: ["Unlimited products", "All AI features", "Custom branding", "API access", "Dedicated support"], highlight: false },
  ];

  return (
    <section id="pricing" className="py-28">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Pricing</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Simple, <span className="text-gradient">transparent</span> pricing
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-8 border transition-all ${
                plan.highlight
                  ? "border-primary/50 bg-primary/5 glow-border scale-[1.03]"
                  : "glass-card hover:border-primary/20"
              }`}
            >
              {plan.highlight && (
                <span className="inline-block text-xs font-semibold text-primary-foreground bg-primary rounded-full px-3 py-1 uppercase tracking-wider mb-3">Most Popular</span>
              )}
              <h3 className="font-display text-2xl font-bold text-foreground">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-muted-foreground flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button variant={plan.highlight ? "hero" : "hero-outline"} className="w-full">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ───────── CTA ───────── */
const CTASection = () => (
  <section className="py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(190_95%_50%/0.1),transparent_60%)]" />
    <div className="container mx-auto px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-3xl p-12 md:p-20 text-center max-w-4xl mx-auto border-primary/20 glow-border relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(190_95%_50%/0.08),transparent_60%)]" />
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8"
          >
            <Zap className="h-8 w-8 text-primary" />
          </motion.div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Start Selling with <span className="text-gradient">AI Today</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Join thousands of sellers using AgentHub AI to create product pages, generate marketing content, and sell more — all in seconds.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup">
              <Button variant="hero" size="lg" className="gap-2 h-14 px-10 text-base">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="hero-outline" size="lg" className="h-14 px-10 text-base">
                Browse Marketplace
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-8">No credit card required • Free plan available • Cancel anytime</p>
        </div>
      </motion.div>
    </div>
  </section>
);

/* ───────── Footer ───────── */
const Footer = () => (
  <footer className="border-t border-border py-12">
    <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        <span className="font-display font-bold text-foreground">AgentHub AI</span>
      </div>
      <div className="flex items-center gap-8 text-sm text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">About</a>
        <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
        <a href="#" className="hover:text-foreground transition-colors">Contact</a>
      </div>
      <p className="text-sm text-muted-foreground">© 2026 AgentHub AI</p>
    </div>
  </footer>
);

/* ───────── Page ───────── */
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SocialProofSection />
      <HowItWorksSection />
      <FeaturesSection />
      <SeeItInActionSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
