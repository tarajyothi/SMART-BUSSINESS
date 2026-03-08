import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
    <div className="container mx-auto flex h-16 items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <Zap className="h-6 w-6 text-primary" />
        <span className="font-display text-xl font-bold text-foreground">AgentHub AI</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a href="#problem" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Problem</a>
        <a href="#solution" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Solution</a>
        <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
        <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
      </div>
      <Button variant="hero" size="sm">Start Selling</Button>
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
          <Button variant="hero" size="lg">Start Selling</Button>
          <Button variant="hero-outline" size="lg">View Demo</Button>
        </div>
      </motion.div>
    </div>
  </section>
);

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
              <Button variant={plan.highlight ? "hero" : "hero-outline"} className="w-full">
                Get Started
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

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
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
