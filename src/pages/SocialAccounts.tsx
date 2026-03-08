import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Zap, Instagram, Facebook, Hash, Youtube, MessageCircle, Twitter, CheckCircle2, XCircle, Loader2, Trash2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface SocialConnection {
  id: string;
  platform: string;
  account_name: string;
  connected: boolean;
  connected_at: string;
}

const platforms = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "from-pink-500/20 to-purple-500/20", iconColor: "text-pink-400" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "from-blue-600/20 to-blue-500/20", iconColor: "text-blue-500" },
  { id: "pinterest", name: "Pinterest", icon: Hash, color: "from-red-500/20 to-red-400/20", iconColor: "text-red-400",
    customIcon: (
      <svg className="h-6 w-6 text-red-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
  },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "from-red-600/20 to-red-500/20", iconColor: "text-red-500",
    customIcon: (
      <svg className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  { id: "whatsapp", name: "WhatsApp", icon: MessageCircle, color: "from-green-500/20 to-green-400/20", iconColor: "text-green-400" },
  { id: "twitter", name: "Twitter / X", icon: Twitter, color: "from-sky-500/20 to-sky-400/20", iconColor: "text-sky-400" },
];

const SocialAccounts = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [accountNameInput, setAccountNameInput] = useState<Record<string, string>>({});

  const fetchConnections = async () => {
    const { data } = await supabase
      .from("social_connections")
      .select("*")
      .eq("user_id", user!.id);
    setConnections((data as SocialConnection[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchConnections();
  }, [user]);

  const handleConnect = async (platformId: string) => {
    const name = accountNameInput[platformId]?.trim();
    if (!name) {
      toast.error("Please enter your account name or handle");
      return;
    }
    setConnectingPlatform(platformId);
    const { error } = await supabase.from("social_connections").upsert(
      { user_id: user!.id, platform: platformId, account_name: name, connected: true, connected_at: new Date().toISOString() },
      { onConflict: "user_id,platform" }
    );
    if (error) {
      toast.error("Failed to connect account");
    } else {
      toast.success("Account connected!");
      setAccountNameInput((prev) => ({ ...prev, [platformId]: "" }));
      await fetchConnections();
    }
    setConnectingPlatform(null);
  };

  const handleDisconnect = async (platformId: string) => {
    const { error } = await supabase
      .from("social_connections")
      .delete()
      .eq("user_id", user!.id)
      .eq("platform", platformId);
    if (error) {
      toast.error("Failed to disconnect");
    } else {
      toast.success("Account disconnected");
      await fetchConnections();
    }
  };

  const getConnection = (platformId: string) => connections.find((c) => c.platform === platformId);

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

      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Connect Social Accounts</h1>
          <p className="text-muted-foreground mb-10">Link your social media accounts to publish content directly.</p>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {platforms.map((platform, i) => {
                const conn = getConnection(platform.id);
                const Icon = platform.icon;
                return (
                  <motion.div
                    key={platform.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-xl p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center shrink-0`}>
                        {platform.customIcon || <Icon className={`h-6 w-6 ${platform.iconColor}`} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg font-semibold text-foreground">{platform.name}</h3>
                        {conn ? (
                          <div className="flex items-center gap-2 mt-1">
                            <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                            <span className="text-sm text-green-400 font-medium">Connected</span>
                            <span className="text-sm text-muted-foreground truncate">· @{conn.account_name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm text-muted-foreground">Not connected</span>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0">
                        {conn ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisconnect(platform.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Disconnect
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {!conn && (
                      <div className="flex gap-3 mt-4 pl-16">
                        <Input
                          placeholder={`Your ${platform.name} handle`}
                          value={accountNameInput[platform.id] || ""}
                          onChange={(e) => setAccountNameInput((prev) => ({ ...prev, [platform.id]: e.target.value }))}
                          className="max-w-xs"
                        />
                        <Button
                          variant="default"
                          size="sm"
                          disabled={connectingPlatform === platform.id}
                          onClick={() => handleConnect(platform.id)}
                        >
                          {connectingPlatform === platform.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : null}
                          Connect
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default SocialAccounts;
