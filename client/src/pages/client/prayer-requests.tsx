import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, HandHeart, Lock, Heart, ShieldCheck, Send, LogOut, Clock } from "lucide-react";
import { useClientAuth } from "@/lib/client-auth";
import { saveAdminPrayerRequest } from "@/lib/prayer-storage";
import { logClientAction } from "@/lib/activity-logger";

const PRAYER_STORAGE_KEY = "alis-prayer-requests";

interface PrayerRequestItem {
  id: string;
  content: string;
  createdAt: string;
  status: "received" | "prayed";
}

function getPrayerRequests(clientId: string): PrayerRequestItem[] {
  try {
    const all = JSON.parse(localStorage.getItem(PRAYER_STORAGE_KEY) || "{}");
    return all[clientId] || [];
  } catch {
    return [];
  }
}

function savePrayerRequest(clientId: string, request: PrayerRequestItem) {
  try {
    const all = JSON.parse(localStorage.getItem(PRAYER_STORAGE_KEY) || "{}");
    if (!all[clientId]) all[clientId] = [];
    all[clientId].unshift(request);
    localStorage.setItem(PRAYER_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

function PortalPrayerNavbar() {
  const { client, logout } = useClientAuth();
  const [, setLocation] = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/portal">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/portal" className="flex items-center gap-2">
            <span className="font-serif text-lg text-foreground">My Portal</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {client?.firstName}
          </span>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { logout(); setLocation("/"); }}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

export default function PortalPrayerRequests() {
  const { client, isAuthenticated, isLoading } = useClientAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<PrayerRequestItem[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/client/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (client) {
      setRequests(getPrayerRequests(client.id));
    }
  }, [client]);

  if (isLoading || !client) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);

    // Save to PHP API + localStorage for admin visibility
    const adminReq = await saveAdminPrayerRequest({
      name: `${client.firstName} ${client.lastName}`,
      email: client.email,
      phone: client.phone,
      content: content.trim(),
    });

    // Save locally for client history
    const newRequest: PrayerRequestItem = {
      id: adminReq.id,
      content: content.trim(),
      createdAt: adminReq.createdAt,
      status: "received",
    };
    savePrayerRequest(client.id, newRequest);
    logClientAction(client.id, `${client.firstName} ${client.lastName}`, "prayer_request_submitted", { contentLength: content.trim().length }, "prayer");
    setRequests((prev) => [newRequest, ...prev]);
    setContent("");
    setIsSubmitting(false);

    toast({
      title: "Prayer Request Sent",
      description: "Alis has received your prayer request and will keep you in her prayers.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <PortalPrayerNavbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2">Private & Confidential</p>
          <h1 className="font-serif text-3xl text-foreground">Prayer Requests</h1>
          <p className="text-muted-foreground mt-2">
            Share what's on your heart. Every request is read and prayed over personally by Alis.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Submit Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="p-6">
              <h3 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
                <HandHeart className="w-5 h-5 text-primary" />
                New Prayer Request
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="prayer-content">What's on your heart?</Label>
                  <Textarea
                    id="prayer-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your prayer request... Alis will read every word with care."
                    rows={8}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!content.trim() || isSubmitting}>
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Sending..." : "Send Prayer Request"}
                </Button>
              </form>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">Completely private — only seen by Alis</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Heart className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">Every request is personally prayed over</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">Your requests are safe and confidential</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Right: History */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="font-serif text-xl text-foreground mb-4">Your Requests</h3>
            {requests.length === 0 ? (
              <Card className="p-8 text-center">
                <HandHeart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  You haven't sent any prayer requests yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your requests will appear here after you submit them.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {requests.map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="p-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          req.status === "prayed"
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-primary/10 text-primary"
                        }`}>
                          {req.status === "prayed" ? "Prayed Over" : "Received"}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(req.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{req.content}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
