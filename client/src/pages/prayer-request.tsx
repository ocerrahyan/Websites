import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { saveAdminPrayerRequest } from "@/lib/prayer-storage";
import { logVisitorAction } from "@/lib/activity-logger";
import { ArrowLeft, Heart, Lock, HandHeart, ShieldCheck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

function PrayerNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-background/95 backdrop-blur-md border-b" : "bg-background border-b"
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home">
          <span className="font-serif text-xl text-foreground">Alis'</span>
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}

export default function PrayerRequest() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Save to PHP API for cross-device access
      await saveAdminPrayerRequest({ name, email, phone, content });
      logVisitorAction("prayer_request_submitted", { name, hasEmail: !!email }, "prayer");
      return { ok: true };
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Prayer Request Sent",
        description: "Your prayer request has been received. Alis will keep you in her prayers.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <PrayerNavbar />
        <div className="pt-24 pb-20 px-6 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif text-3xl text-foreground mb-3" data-testid="text-success-title">Thank You</h2>
            <p className="text-muted-foreground mb-8">
              Your prayer request has been received with love and care.
              Alis will hold you in her prayers. You are never alone.
            </p>
            <Link href="/">
              <Button data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PrayerNavbar />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2 font-sans">You Are Not Alone</p>
              <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
                Prayer Requests
              </h1>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Alis deeply cares about the spiritual wellbeing of every client who walks through her doors.
                If you have something on your heart, she would be honored to pray for you.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">Completely Private</h3>
                    <p className="text-muted-foreground text-sm">Your prayer requests are completely private and only seen by Alis</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HandHeart className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">Prayed Over Personally</h3>
                    <p className="text-muted-foreground text-sm">Every request is read and prayed over with genuine care</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">Safe & Confidential</h3>
                    <p className="text-muted-foreground text-sm">Share as much or as little as you feel comfortable with</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-6">
                <h3 className="font-serif text-xl text-foreground mb-5">Share Your Request</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitMutation.mutate();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="name" className="text-sm">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      data-testid="input-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      data-testid="input-email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      data-testid="input-phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content" className="text-sm">Prayer Request</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Share what's on your heart..."
                      rows={6}
                      required
                      data-testid="input-prayer-content"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!name || !content || submitMutation.isPending}
                    data-testid="button-submit-prayer"
                  >
                    {submitMutation.isPending ? "Sending..." : "Submit Prayer Request"}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
