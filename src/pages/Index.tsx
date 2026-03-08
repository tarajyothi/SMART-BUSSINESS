import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Quote, Instagram, Facebook, Share2, Link as LinkIcon, Heart, ShoppingCart, Upload, Sparkles, Globe, ArrowRight, Store, ShoppingBag, Package } from "lucide-react";
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
        <a href="#problem" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Problem</a>
        <a href="#solution" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Solution</a>
        <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
        <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
      </div>
      <Link to="/signup"><Button variant="hero" size="sm">Start Selling</Button></Link>
    </div>
  </nav>
);

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(190_95%_50%/0.08),transparent_60%)]" />
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
    <div className="container mx-auto px-6 text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground mb-8">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span>Powered by AI agents</span>
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
          Turn Any Product Into a{" "}
          <span className="text-gradient">Selling Machine</span> with AI
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          AgentHub AI helps small sellers automatically create product pages, marketing content, and social posts — in seconds.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/signup"><Button variant="hero" size="lg">Start Selling</Button></Link>
          <Link to="/login"><Button variant="hero-outline" size="lg">View Demo</Button></Link>
        </div>
      </motion.div>
    </div>
  </section>
);

const SocialProofSection = () => {
  const platforms = [
    { icon: Instagram, name: "Instagram" },
    { icon: Store, name: "Shopify" },
    { icon: ShoppingBag, name: "Etsy" },
    { icon: Package, name: "Amazon" },
    { icon: Facebook, name: "Facebook" },
  ];

  return (
    <section className="py-16 border-y border-border/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground mb-8">Trusted by sellers on the platforms you already use</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
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
        </motion.div>
      </div>
    </section>
  );
};

const ProblemSection = () => (
  <section id="problem" className="py-24 relative">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto"
      >
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">The Problem</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
          Small sellers are <span className="text-gradient">stuck</span>
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Creating product pages, writing marketing copy, and building a social presence takes hours. Most small sellers don't have the time, skills, or budget to do it right — and it's costing them sales every day.
        </p>
      </motion.div>
    </div>
  </section>
);

const HowItWorksSection = () => {
  const steps = [
    { icon: Upload, step: "01", title: "Upload Product", desc: "Add your product photo and basic details — name, price, and category. That's all we need." },
    { icon: Sparkles, step: "02", title: "AI Generates Marketing Content", desc: "Our AI creates product descriptions, social captions, hashtags, and a ready-to-share landing page." },
    { icon: Globe, step: "03", title: "Publish Everywhere", desc: "Share your product across Instagram, Facebook, WhatsApp, and your own storefront in one click." },
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">How It Works</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Three steps to <span className="text-gradient">start selling</span>
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
          {/* Connector lines */}
          <div className="hidden md:block absolute top-16 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40" />
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="glass-card rounded-xl p-8 text-center hover:border-primary/30 transition-all relative group"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors relative">
                <s.icon className="h-6 w-6 text-primary" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
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

const SolutionSection = () => {
  const items = [
    { title: "Product Description", desc: "Compelling copy that converts browsers into buyers" },
    { title: "Instagram Caption", desc: "Scroll-stopping captions optimized for engagement" },
    { title: "Smart Hashtags", desc: "AI-researched hashtags for maximum reach" },
    { title: "Landing Page", desc: "Beautiful, conversion-ready pages in one click" },
  ];

  return (
    <section id="solution" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">The Solution</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Upload your product. <span className="text-gradient">AI does the rest.</span>
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-6 hover:border-primary/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    { icon: "✍️", title: "AI Product Writer", desc: "Generate high-converting product descriptions instantly" },
    { icon: "📸", title: "AI Caption Generator", desc: "Create viral-worthy social media captions" },
    { icon: "🚀", title: "Auto Landing Pages", desc: "One-click beautiful product pages that sell" },
    { icon: "🛒", title: "Social Commerce Tools", desc: "Sell directly from your social media profiles" },
  ];

  return (
    <section id="features" className="py-24 relative">
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
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-8 hover:border-primary/30 transition-all hover:glow-border group"
            >
              <span className="text-3xl mb-4 block">{f.icon}</span>
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SeeItInActionSection = () => (
  <section className="py-24 relative">
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
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="relative">
            <img src={demoProduct} alt="Handmade Beaded Bracelet" className="w-full aspect-square object-cover" />
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
        <div className="flex flex-col gap-4">
          <div className="glass-card rounded-xl p-6 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Generated Caption</span>
            </div>
            <p className="text-foreground leading-relaxed text-sm">
              ✨ Handcrafted with love — each bead tells a story. Our beaded bracelet blends natural stones with artisan charm for a look that's uniquely yours. 🌿💎
            </p>
            <p className="text-primary text-xs mt-3">#HandmadeJewelry #BeadedBracelet #ArtisanCraft #ShopSmall #NaturalStones</p>
          </div>
          <div className="glass-card rounded-xl p-6 flex-1">
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
          </div>
          <div className="glass-card rounded-xl p-6">
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
                <div
                  key={s.label}
                  className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                >
                  <s.icon className="h-5 w-5 text-foreground" />
                  <span className="text-[10px] text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const TestimonialsSection = () => {
  const testimonials = [
    { quote: "This tool saved me hours creating product pages.", name: "Priya Sharma", role: "Handmade Jewelry Seller", img: testimonial1 },
    { quote: "I can launch products in seconds.", name: "Arjun Mehta", role: "Dropshipping Entrepreneur", img: testimonial2 },
    { quote: "Perfect for small Instagram sellers.", name: "Sneha Patel", role: "Instagram Shop Owner", img: testimonial3 },
  ];

  return (
    <section className="py-24 relative">
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
              className="glass-card rounded-xl p-8 hover:border-primary/30 transition-all relative"
            >
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              <p className="text-foreground text-lg mb-6 leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20" />
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

const PricingSection = () => {
  const plans = [
    { name: "Free", price: "₹0", period: "forever", features: ["5 products", "Basic AI writing", "1 landing page"], highlight: false },
    { name: "Pro", price: "₹499", period: "/month", features: ["50 products", "Advanced AI tools", "Unlimited pages", "Priority support"], highlight: true },
    { name: "Business", price: "₹999", period: "/month", features: ["Unlimited products", "All AI features", "Custom branding", "API access", "Dedicated support"], highlight: false },
  ];

  return (
    <section id="pricing" className="py-24">
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
              className={`rounded-xl p-8 border transition-all ${
                plan.highlight
                  ? "border-primary/50 bg-primary/5 glow-border"
                  : "glass-card hover:border-primary/20"
              }`}
            >
              {plan.highlight && (
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Most Popular</span>
              )}
              <h3 className="font-display text-2xl font-bold mt-2 text-foreground">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
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

const CTASection = () => (
  <section className="py-24 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(190_95%_50%/0.1),transparent_60%)]" />
    <div className="container mx-auto px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card rounded-2xl p-12 md:p-16 text-center max-w-4xl mx-auto border-primary/20 glow-border"
      >
        <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-foreground">
          Start Selling with <span className="text-gradient">AI Today</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          Join thousands of sellers using AgentHub AI to create product pages, generate marketing content, and sell more — all in seconds.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/signup">
            <Button variant="hero" size="lg" className="gap-2">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="hero-outline" size="lg">
              Browse Marketplace
            </Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-6">No credit card required • Free plan available</p>
      </motion.div>
    </div>
  </section>
);

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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SocialProofSection />
      <ProblemSection />
      <SolutionSection />
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
