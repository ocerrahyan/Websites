import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, LogOut, Mail, Bell, Check, Heart, Sparkles, Tag } from "lucide-react";
import { useClientAuth } from "@/lib/client-auth";

const EMAIL_PREFS_KEY = "alis-email-preferences";

interface EmailPreferences {
  frequency: "daily" | "weekly" | "monthly" | "none";
  topics: {
    inspirational: boolean;
    beautyTips: boolean;
    offers: boolean;
    announcements: boolean;
  };
  unsubscribed: boolean;
}

function getEmailPrefs(clientId: string): EmailPreferences {
  try {
    const all = JSON.parse(localStorage.getItem(EMAIL_PREFS_KEY) || "{}");
    return all[clientId] || {
      frequency: "weekly",
      topics: { inspirational: true, beautyTips: true, offers: true, announcements: true },
      unsubscribed: false,
    };
  } catch {
    return {
      frequency: "weekly",
      topics: { inspirational: true, beautyTips: true, offers: true, announcements: true },
      unsubscribed: false,
    };
  }
}

function saveEmailPrefs(clientId: string, prefs: EmailPreferences) {
  const all = JSON.parse(localStorage.getItem(EMAIL_PREFS_KEY) || "{}");
  all[clientId] = prefs;
  localStorage.setItem(EMAIL_PREFS_KEY, JSON.stringify(all));
}

function PrefsNavbar() {
  const { client, logout } = useClientAuth();
  const [, setLocation] = useLocation();
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/portal"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <Link href="/portal" className="flex items-center gap-2">
            <span className="font-serif text-lg text-foreground">My Portal</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:block">{client?.firstName}</span>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => { logout(); setLocation("/"); }}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

const frequencyOptions = [
  { value: "daily" as const, label: "Daily", desc: "Get a morning dose of inspiration every day" },
  { value: "weekly" as const, label: "Weekly", desc: "A weekly digest every Monday morning" },
  { value: "monthly" as const, label: "Monthly", desc: "A monthly roundup of the best content" },
  { value: "none" as const, label: "Pause", desc: "Temporarily pause all emails" },
];

const topicOptions = [
  { key: "inspirational" as const, label: "Inspirational Messages", desc: "Uplifting words and devotionals from Alis", icon: Heart },
  { key: "beautyTips" as const, label: "Beauty Tips & Tutorials", desc: "Hair care, styling advice, and beauty insights", icon: Sparkles },
  { key: "offers" as const, label: "Special Offers", desc: "Exclusive deals, seasonal promotions, and birthday coupons", icon: Tag },
  { key: "announcements" as const, label: "Salon News", desc: "New services, schedule changes, and events", icon: Bell },
];

export default function EmailPreferences() {
  const { client, isAuthenticated, isLoading } = useClientAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<EmailPreferences | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) setLocation("/client/login");
  }, [isLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (client) setPrefs(getEmailPrefs(client.id));
  }, [client]);

  if (isLoading || !client || !prefs) return null;

  const handleSave = () => {
    saveEmailPrefs(client.id, prefs);
    setSaved(true);
    toast({ title: "Preferences Saved", description: "Your email preferences have been updated." });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUnsubscribe = () => {
    const updated = { ...prefs, unsubscribed: !prefs.unsubscribed };
    setPrefs(updated);
    saveEmailPrefs(client.id, updated);
    toast({
      title: updated.unsubscribed ? "Unsubscribed" : "Resubscribed",
      description: updated.unsubscribed
        ? "You've been unsubscribed from all emails."
        : "Welcome back! You'll start receiving emails again.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <PrefsNavbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2">Communication</p>
          <h1 className="font-serif text-3xl text-foreground">Email Preferences</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Manage what emails you receive and how often. You can unsubscribe at any time.
          </p>
        </motion.div>

        {prefs.unsubscribed && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-5 mb-6 border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-500" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground text-sm">You're unsubscribed</h3>
                  <p className="text-xs text-muted-foreground">You won't receive any emails from us.</p>
                </div>
                <Button size="sm" variant="outline" onClick={handleUnsubscribe}>
                  Resubscribe
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={`p-6 mb-6 ${prefs.unsubscribed ? "opacity-50 pointer-events-none" : ""}`}>
            <h3 className="font-medium text-foreground mb-1 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" /> Email Frequency
            </h3>
            <p className="text-sm text-muted-foreground mb-4">How often would you like to hear from us?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {frequencyOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPrefs({ ...prefs, frequency: opt.value })}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    prefs.frequency === opt.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <p className="font-medium text-foreground text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`p-6 mb-6 ${prefs.unsubscribed ? "opacity-50 pointer-events-none" : ""}`}>
            <h3 className="font-medium text-foreground mb-1 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Email Topics
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Choose what types of emails you'd like to receive.</p>
            <div className="space-y-4">
              {topicOptions.map((topic) => (
                <div key={topic.key} className="flex items-center justify-between gap-4 p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <topic.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium cursor-pointer">{topic.label}</Label>
                      <p className="text-xs text-muted-foreground">{topic.desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs.topics[topic.key]}
                    onCheckedChange={(checked) =>
                      setPrefs({ ...prefs, topics: { ...prefs.topics, [topic.key]: checked } })
                    }
                  />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col gap-3">
          <Button onClick={handleSave} disabled={prefs.unsubscribed} className="w-full">
            {saved ? <><Check className="w-4 h-4 mr-2" /> Saved!</> : "Save Preferences"}
          </Button>
          {!prefs.unsubscribed && (
            <Button variant="ghost" className="text-muted-foreground" onClick={handleUnsubscribe}>
              Unsubscribe from all emails
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
