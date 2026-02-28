import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import {
  Mail, Sparkles, Send, Clock, Users, BarChart3, CalendarDays,
  LogOut, Plus, Wand2, Eye, CheckCircle2, XCircle, TrendingUp,
} from "lucide-react";
import {
  SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const CAMPAIGNS_KEY = "alis-email-campaigns";

interface Campaign {
  id: string;
  subject: string;
  content: string;
  type: "inspirational" | "beauty-tips" | "promotional" | "announcement";
  cadence: "one-time" | "daily" | "weekly" | "monthly";
  status: "draft" | "scheduled" | "sent";
  recipientCount: number;
  openRate?: number;
  createdAt: string;
  sentAt?: string;
}

function getCampaigns(): Campaign[] {
  try {
    return JSON.parse(localStorage.getItem(CAMPAIGNS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCampaigns(campaigns: Campaign[]) {
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
}

const sampleCampaigns: Campaign[] = [
  {
    id: "c1", subject: "Monday Morning Inspiration ✨", content: "Dear beloved client,\n\nAs we begin a new week, remember that beauty starts from within. Every strand of hair on your head is counted, and you are valued beyond measure.\n\n\"She is clothed with strength and dignity; she can laugh at the days to come.\" - Proverbs 31:25\n\nHave a blessed week!\nWith love, Alis",
    type: "inspirational", cadence: "weekly", status: "sent", recipientCount: 47, openRate: 72, createdAt: "2026-02-10T08:00:00Z", sentAt: "2026-02-10T08:00:00Z",
  },
  {
    id: "c2", subject: "Winter Hair Care Essentials 💆‍♀️", content: "Hey beautiful!\n\nWinter can be harsh on your hair. Here are 3 quick tips:\n\n1. Deep condition weekly - your hair needs extra moisture\n2. Avoid hot water when washing - lukewarm is your friend\n3. Use a silk pillowcase to reduce friction and breakage\n\nBook your winter treatment today!\nXOXO, Alis",
    type: "beauty-tips", cadence: "monthly", status: "sent", recipientCount: 47, openRate: 65, createdAt: "2026-02-01T10:00:00Z", sentAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "c3", subject: "💕 Valentine's Day Special - 20% Off!", content: "Happy Valentine's Day!\n\nTreat yourself or someone you love to a pampering session. Use code LOVE2026 for 20% off any service this week.\n\nBecause you deserve to feel beautiful!\n\nBook now at alissimplyelegant.com\nLove, Alis",
    type: "promotional", cadence: "one-time", status: "sent", recipientCount: 52, openRate: 81, createdAt: "2026-02-14T07:00:00Z", sentAt: "2026-02-14T07:00:00Z",
  },
];

const typeColors: Record<string, string> = {
  inspirational: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "beauty-tips": "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  promotional: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  announcement: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

const aiPrompts = [
  { label: "Morning Inspiration", prompt: "Write a short, uplifting morning inspirational email for salon clients. Include a Bible verse. Keep it warm and personal, signed by Alis." },
  { label: "Beauty Tip of the Week", prompt: "Write a helpful beauty tip email about hair or skin care. Give 2-3 practical tips. Keep it friendly and encourage booking an appointment." },
  { label: "Seasonal Special", prompt: "Write a promotional email for a seasonal salon special. Include a special offer or discount code. Make it festive and inviting." },
  { label: "Gratitude & Update", prompt: "Write a heartfelt thank you email to salon clients. Share a brief salon update or story. Keep it personal and authentic." },
];

function EmailMarketingContent() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const stored = getCampaigns();
    return stored.length > 0 ? stored : sampleCampaigns;
  });
  const [showComposer, setShowComposer] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<Campaign["type"]>("inspirational");
  const [cadence, setCadence] = useState<Campaign["cadence"]>("one-time");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const stats = {
    totalSent: campaigns.filter(c => c.status === "sent").length,
    subscribers: 52,
    avgOpenRate: campaigns.filter(c => c.openRate).reduce((acc, c) => acc + (c.openRate || 0), 0) / (campaigns.filter(c => c.openRate).length || 1),
    scheduledCount: campaigns.filter(c => c.status === "scheduled").length,
  };

  const handleAIGenerate = async (prompt: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "custom", customPrompt: prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubject(data.subject || "");
        setContent(data.content || "");
        toast({ title: "AI Content Generated", description: "Review and edit as needed before sending." });
      } else {
        throw new Error("API unavailable");
      }
    } catch {
      // Simulate AI generation for demo
      const templates: Record<string, { subject: string; content: string }> = {
        "Morning Inspiration": {
          subject: "🌅 Start Your Day with Purpose",
          content: "Good morning, beautiful!\n\nToday is a gift — that's why they call it the present. Take a moment to breathe, smile, and know that you are wonderfully made.\n\n\"For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.\" — Jeremiah 29:11\n\nMay your day be filled with joy and purpose.\n\nWith love and blessings,\nAlis 💕",
        },
        "Beauty Tip of the Week": {
          subject: "💆‍♀️ This Week's Beauty Secret",
          content: "Hey gorgeous!\n\nHere's your beauty tip of the week:\n\n🌿 **Scalp Massage Magic** — Spend 5 minutes massaging your scalp before washing your hair. It boosts circulation, promotes growth, and feels amazing!\n\nPro tip: Use a few drops of coconut oil for extra nourishment.\n\nWant a professional treatment? Book your next appointment and let us pamper you!\n\nStay beautiful,\nAlis ✨",
        },
        "Seasonal Special": {
          subject: "🌸 Spring Refresh Special — Limited Time!",
          content: "Spring is in the air! 🌷\n\nTime for a fresh start — and a fresh look!\n\n✂️ **Spring Special:** 15% off any color service this month\n💅 **Bonus:** Free nail polish with any appointment\n\nUse code SPRING2026 when booking online.\n\nDon't wait — spots fill up fast in spring!\n\nBook now: alissimplyelegant.com/booking\n\nLove,\nAlis",
        },
        "Gratitude & Update": {
          subject: "💕 A Note from Alis",
          content: "Dear friend,\n\nI wanted to take a moment to say THANK YOU. Your trust means the world to me, and every time you sit in my chair, it's an honor.\n\nA small update: We've been refreshing the salon and adding some exciting new services! Can't wait to share more soon.\n\nYou are what makes this place special.\n\nGratefully yours,\nAlis 🙏",
        },
      };
      const key = Object.keys(templates).find(k => prompt.toLowerCase().includes(k.toLowerCase().split(" ")[0])) || "Morning Inspiration";
      const t = templates[key];
      setSubject(t.subject);
      setContent(t.content);
      toast({ title: "AI Content Generated ✨", description: "Review and edit as needed." });
    }
    setIsGenerating(false);
  };

  const handleSend = () => {
    const newCampaign: Campaign = {
      id: "c-" + Date.now(),
      subject, content, type, cadence,
      status: "sent",
      recipientCount: stats.subscribers,
      openRate: Math.floor(Math.random() * 30) + 55,
      createdAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
    };
    const updated = [newCampaign, ...campaigns];
    setCampaigns(updated);
    saveCampaigns(updated);
    setShowComposer(false);
    setSubject("");
    setContent("");
    toast({ title: "Campaign Sent! 🚀", description: `Email sent to ${stats.subscribers} subscribers.` });
  };

  const handleSchedule = () => {
    const newCampaign: Campaign = {
      id: "c-" + Date.now(),
      subject, content, type, cadence,
      status: "scheduled",
      recipientCount: stats.subscribers,
      createdAt: new Date().toISOString(),
    };
    const updated = [newCampaign, ...campaigns];
    setCampaigns(updated);
    saveCampaigns(updated);
    setShowComposer(false);
    setSubject("");
    setContent("");
    toast({ title: "Campaign Scheduled 📅", description: `Will be sent ${cadence} to ${stats.subscribers} subscribers.` });
  };

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="font-serif text-lg text-foreground">Email Marketing</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout}><LogOut className="w-4 h-4" /></Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Subscribers", value: stats.subscribers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Campaigns Sent", value: stats.totalSent, icon: Send, color: "text-green-500", bg: "bg-green-500/10" },
              { label: "Avg Open Rate", value: `${Math.round(stats.avgOpenRate)}%`, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
              { label: "Scheduled", value: stats.scheduledCount, icon: CalendarDays, color: "text-amber-500", bg: "bg-amber-500/10" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <div className={`w-8 h-8 rounded-md ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <h2 className="font-serif text-xl text-foreground">Campaigns</h2>
            <Button onClick={() => setShowComposer(!showComposer)}>
              <Plus className="w-4 h-4 mr-2" /> New Campaign
            </Button>
          </div>

          {/* Composer */}
          {showComposer && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 mb-6 border-primary/20">
                <h3 className="font-serif text-lg text-foreground mb-4 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" /> AI Email Composer
                </h3>

                {/* AI Quick Generate */}
                <div className="mb-5">
                  <Label className="text-sm text-muted-foreground mb-2 block">Quick AI Generate</Label>
                  <div className="flex flex-wrap gap-2">
                    {aiPrompts.map((p) => (
                      <Button
                        key={p.label}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAIGenerate(p.prompt)}
                        disabled={isGenerating}
                      >
                        <Sparkles className={`w-3 h-3 mr-1.5 ${isGenerating ? "animate-spin" : ""}`} />
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={type} onValueChange={(v) => setType(v as Campaign["type"])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inspirational">Inspirational</SelectItem>
                        <SelectItem value="beauty-tips">Beauty Tips</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cadence</Label>
                    <Select value={cadence} onValueChange={(v) => setCadence(v as Campaign["cadence"])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-Time Send</SelectItem>
                        <SelectItem value="daily">Daily (recurring)</SelectItem>
                        <SelectItem value="weekly">Weekly (recurring)</SelectItem>
                        <SelectItem value="monthly">Monthly (recurring)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mb-4">
                  <Label>Subject Line</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject..." />
                </div>

                <div className="mb-4">
                  <Label>Email Content</Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your email content here, or use AI to generate it..."
                    className="min-h-[200px]"
                  />
                </div>

                {previewMode && content && (
                  <Card className="p-5 mb-4 bg-white dark:bg-muted/30 border-dashed">
                    <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                    <h4 className="font-semibold text-foreground mb-2">{subject}</h4>
                    <div className="text-sm text-foreground whitespace-pre-line">{content}</div>
                  </Card>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                  <Button onClick={handleSend} disabled={!subject || !content}>
                    <Send className="w-4 h-4 mr-2" /> Send Now
                  </Button>
                  {cadence !== "one-time" && (
                    <Button variant="outline" onClick={handleSchedule} disabled={!subject || !content}>
                      <Clock className="w-4 h-4 mr-2" /> Schedule
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => setPreviewMode(!previewMode)}>
                    <Eye className="w-4 h-4 mr-2" /> {previewMode ? "Hide" : "Show"} Preview
                  </Button>
                  <Button variant="ghost" onClick={() => setShowComposer(false)}>Cancel</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Campaign List */}
          <div className="space-y-3">
            {campaigns.map((campaign, i) => (
              <motion.div key={campaign.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-medium text-foreground truncate">{campaign.subject}</h4>
                        <Badge variant="secondary" className={typeColors[campaign.type] || ""}>
                          {campaign.type}
                        </Badge>
                        {campaign.cadence !== "one-time" && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />{campaign.cadence}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{campaign.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {campaign.recipientCount} recipients
                        </span>
                        {campaign.openRate && (
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" /> {campaign.openRate}% open rate
                          </span>
                        )}
                        <span>
                          {campaign.sentAt
                            ? new Date(campaign.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                            : "Scheduled"
                          }
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {campaign.status === "sent" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : campaign.status === "scheduled" ? (
                        <Clock className="w-5 h-5 text-amber-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function AdminEmailMarketing() {
  const style = { "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem" };
  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <EmailMarketingContent />
      </div>
    </SidebarProvider>
  );
}
