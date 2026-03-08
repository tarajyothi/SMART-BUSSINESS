import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isToday, isBefore } from "date-fns";
import { cn } from "@/lib/utils";
import {
  CalendarIcon, Plus, Instagram, Facebook, Hash, Clock, Loader2,
  ChevronLeft, ChevronRight, Trash2, Send,
} from "lucide-react";

interface ScheduledPost {
  id: string;
  platform: string;
  caption: string | null;
  hashtags: string | null;
  status: string;
  scheduled_for: string | null;
  created_at: string;
  product_id: string;
  product_name?: string;
}

interface Product {
  id: string;
  name: string;
}

const platformConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  instagram: { icon: Instagram, label: "Instagram", color: "text-pink-400", bg: "bg-pink-400/10" },
  facebook: { icon: Facebook, label: "Facebook", color: "text-blue-500", bg: "bg-blue-500/10" },
  pinterest: { icon: Hash, label: "Pinterest", color: "text-red-400", bg: "bg-red-400/10" },
};

const PostScheduler = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [scheduleTime, setScheduleTime] = useState("10:00");

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [postsRes, productsRes] = await Promise.all([
      supabase
        .from("social_posts")
        .select("id, platform, caption, hashtags, status, scheduled_for, created_at, product_id")
        .eq("user_id", user!.id)
        .order("scheduled_for", { ascending: true, nullsFirst: false }),
      supabase
        .from("products")
        .select("id, name")
        .eq("user_id", user!.id)
        .order("name"),
    ]);

    const prods = productsRes.data || [];
    const prodMap = new Map(prods.map((p) => [p.id, p.name]));
    const enriched = (postsRes.data || []).map((p) => ({
      ...p,
      product_name: prodMap.get(p.product_id) || "Unknown",
    }));

    setPosts(enriched);
    setProducts(prods);
    setLoading(false);
  };

  const handleSchedule = async () => {
    if (!selectedProduct || !selectedPlatform || !scheduleDate) {
      toast.error("Please fill in product, platform, and date");
      return;
    }
    setSubmitting(true);
    const [hours, minutes] = scheduleTime.split(":").map(Number);
    const scheduledFor = new Date(scheduleDate);
    scheduledFor.setHours(hours, minutes, 0, 0);

    const { error } = await supabase.from("social_posts").insert({
      user_id: user!.id,
      product_id: selectedProduct,
      platform: selectedPlatform,
      caption: caption.trim() || null,
      hashtags: hashtags.trim() || null,
      status: "queued",
      scheduled_for: scheduledFor.toISOString(),
    });

    if (error) {
      toast.error("Failed to schedule post");
    } else {
      toast.success("Post scheduled!");
      setDialogOpen(false);
      resetForm();
      fetchData();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("social_posts").update({ status: "cancelled" }).eq("id", id);
    if (error) {
      toast.error("Failed to cancel post");
    } else {
      toast.success("Post cancelled");
      fetchData();
    }
  };

  const resetForm = () => {
    setSelectedProduct("");
    setSelectedPlatform("");
    setCaption("");
    setHashtags("");
    setScheduleDate(undefined);
    setScheduleTime("10:00");
  };

  // Calendar data
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const postsWithDates = useMemo(
    () => posts.filter((p) => p.scheduled_for && p.status !== "cancelled"),
    [posts]
  );

  const getPostsForDay = (day: Date) => postsWithDates.filter((p) => isSameDay(new Date(p.scheduled_for!), day));

  const upcomingPosts = useMemo(
    () => postsWithDates.filter((p) => !isBefore(new Date(p.scheduled_for!), new Date())).slice(0, 8),
    [postsWithDates]
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Post Scheduler</h1>
              <p className="text-sm text-muted-foreground">Schedule posts across Instagram, Facebook & Pinterest.</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
                <Plus className="h-4 w-4" /> Schedule Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-foreground">Schedule a Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {/* Product */}
                <div className="space-y-1.5">
                  <Label className="text-foreground text-sm">Product</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {products.length === 0 && <p className="text-xs text-muted-foreground">Upload a product first.</p>}
                </div>

                {/* Platform */}
                <div className="space-y-1.5">
                  <Label className="text-foreground text-sm">Platform</Label>
                  <div className="flex gap-2">
                    {(["instagram", "facebook", "pinterest"] as const).map((p) => {
                      const cfg = platformConfig[p];
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={p}
                          onClick={() => setSelectedPlatform(p)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all text-sm font-medium",
                            selectedPlatform === p
                              ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Caption */}
                <div className="space-y-1.5">
                  <Label className="text-foreground text-sm">Caption</Label>
                  <Textarea
                    placeholder="Write your post caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                    className="bg-secondary border-border resize-none"
                  />
                </div>

                {/* Hashtags */}
                <div className="space-y-1.5">
                  <Label className="text-foreground text-sm">Hashtags</Label>
                  <Input
                    placeholder="#trending #shopsmall"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-foreground text-sm">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal border-border bg-secondary", !scheduleDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduleDate ? format(scheduleDate, "MMM d, yyyy") : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={scheduleDate}
                          onSelect={setScheduleDate}
                          disabled={(date) => isBefore(date, new Date(new Date().setHours(0, 0, 0, 0)))}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground text-sm">Time</Label>
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>

                <Button onClick={handleSchedule} disabled={submitting} className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Schedule Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Month nav */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="font-display text-sm font-semibold text-foreground">
                  {format(currentMonth, "MMMM yyyy")}
                </h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-border">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-2">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, i) => {
                  const dayPosts = getPostsForDay(day);
                  const inMonth = day.getMonth() === currentMonth.getMonth();
                  return (
                    <div
                      key={i}
                      className={cn(
                        "min-h-[80px] border-b border-r border-border p-1.5 transition-colors",
                        !inMonth && "bg-secondary/30",
                        isToday(day) && "bg-primary/5"
                      )}
                    >
                      <span className={cn(
                        "text-[11px] font-medium",
                        inMonth ? "text-foreground" : "text-muted-foreground/50",
                        isToday(day) && "text-primary font-bold"
                      )}>
                        {format(day, "d")}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {dayPosts.slice(0, 3).map((post) => {
                          const cfg = platformConfig[post.platform] || platformConfig.instagram;
                          return (
                            <div key={post.id} className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium truncate", cfg.bg, cfg.color)}>
                              <cfg.icon className="h-2.5 w-2.5 shrink-0" />
                              <span className="truncate">{post.product_name}</span>
                            </div>
                          );
                        })}
                        {dayPosts.length > 3 && (
                          <span className="text-[9px] text-muted-foreground pl-1">+{dayPosts.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Upcoming Posts */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-semibold text-foreground">Upcoming Posts</h3>
              </div>
              <div className="divide-y divide-border">
                {upcomingPosts.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <CalendarIcon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No scheduled posts yet.</p>
                  </div>
                ) : (
                  upcomingPosts.map((post) => {
                    const cfg = platformConfig[post.platform] || platformConfig.instagram;
                    return (
                      <div key={post.id} className="px-4 py-3 flex items-center gap-3 group hover:bg-secondary/30 transition-colors">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", cfg.bg)}>
                          <cfg.icon className={cn("h-4 w-4", cfg.color)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{post.product_name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {post.scheduled_for ? format(new Date(post.scheduled_for), "MMM d 'at' h:mm a") : "—"}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PostScheduler;
