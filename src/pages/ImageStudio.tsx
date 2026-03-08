import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Zap,
  ArrowLeft,
  Upload,
  Eraser,
  Sparkles,
  Image as ImageIcon,
  Megaphone,
  Download,
  RefreshCw,
  Check,
  X,
} from "lucide-react";

interface Tool {
  id: string;
  icon: typeof Eraser;
  label: string;
  desc: string;
}

const TOOLS: Tool[] = [
  { id: "remove-bg", icon: Eraser, label: "Remove Background", desc: "Clean white background for e-commerce" },
  { id: "enhance", icon: Sparkles, label: "Enhance Quality", desc: "Pro lighting, sharpness & color boost" },
  { id: "lifestyle", icon: ImageIcon, label: "Lifestyle Mockup", desc: "Place product in aspirational setting" },
  { id: "poster", icon: Megaphone, label: "Marketing Poster", desc: "Social media-ready promo design" },
];

const ImageStudio = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setFileName(file.name);
    setResultImage(null);
    setSelectedTool(null);
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleProcess = async (toolId: string) => {
    if (!originalImage || !user) return;
    setSelectedTool(toolId);
    setResultImage(null);
    setProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("image-studio", {
        body: { image_url: originalImage, tool: toolId },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
      } else if (data?.result_url) {
        setResultImage(data.result_url);
        toast.success("Image processed!");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to process image");
    }
    setProcessing(false);
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    try {
      const resp = await fetch(resultImage);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `studio-${selectedTool}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // If fetch fails (base64), open in new tab
      window.open(resultImage, "_blank");
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setResultImage(null);
    setSelectedTool(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-display text-xl font-bold text-foreground">AI Image Studio</span>
            </div>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-10 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Upload Area */}
          {!originalImage && (
            <div className="max-w-lg mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="h-8 w-8 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">AI Image Studio</h2>
                <p className="text-muted-foreground">
                  Upload a product image and transform it with AI-powered tools.
                </p>
              </div>
              <label
                htmlFor="studio-upload"
                className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 transition-all group"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <p className="font-display text-lg font-semibold text-foreground mb-1">Drop your image here</p>
                <p className="text-sm text-muted-foreground">or click to browse • PNG, JPG up to 10MB</p>
              </label>
              <input
                id="studio-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Studio workspace */}
          {originalImage && (
            <div className="space-y-8">
              {/* Tool Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Choose a tool</h2>
                  <p className="text-sm text-muted-foreground">{fileName}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 text-muted-foreground">
                    <X className="h-4 w-4" /> New Image
                  </Button>
                  {resultImage && (
                    <Button variant="hero" size="sm" onClick={handleDownload} className="gap-1">
                      <Download className="h-4 w-4" /> Download
                    </Button>
                  )}
                </div>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TOOLS.map((tool) => {
                  const isActive = selectedTool === tool.id;
                  const isProcessingThis = processing && selectedTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleProcess(tool.id)}
                      disabled={processing}
                      className={`rounded-xl p-4 text-left transition-all border ${
                        isActive
                          ? "border-primary bg-primary/10"
                          : "border-border bg-secondary/30 hover:border-primary/30"
                      } ${processing ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {isProcessingThis ? (
                          <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                        ) : isActive && resultImage ? (
                          <Check className="h-5 w-5 text-primary" />
                        ) : (
                          <tool.icon className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <p className="font-display text-sm font-semibold text-foreground">{tool.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{tool.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Side by Side Comparison */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Original */}
                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Original
                    </span>
                  </div>
                  <div className="p-2">
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full rounded-lg object-contain max-h-[500px] bg-secondary/30"
                    />
                  </div>
                </div>

                {/* Result */}
                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      AI Enhanced
                    </span>
                    {selectedTool && (
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {TOOLS.find((t) => t.id === selectedTool)?.label}
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <AnimatePresence mode="wait">
                      {processing ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full rounded-lg bg-secondary/30 flex flex-col items-center justify-center"
                          style={{ minHeight: 300 }}
                        >
                          <RefreshCw className="h-10 w-10 text-primary animate-spin mb-4" />
                          <p className="font-display text-sm font-semibold text-foreground">
                            AI is working its magic...
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">This may take 15-30 seconds</p>
                        </motion.div>
                      ) : resultImage ? (
                        <motion.img
                          key="result"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          src={resultImage}
                          alt="AI Enhanced"
                          className="w-full rounded-lg object-contain max-h-[500px] bg-secondary/30"
                        />
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="w-full rounded-lg bg-secondary/30 flex flex-col items-center justify-center"
                          style={{ minHeight: 300 }}
                        >
                          <Sparkles className="h-10 w-10 text-muted-foreground mb-4" />
                          <p className="text-sm text-muted-foreground">Select a tool above to get started</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ImageStudio;
