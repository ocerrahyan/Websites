import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Heart, Mail, MessageCircle, HandHeart, Lock, ShieldCheck, Church, Sparkles, BookOpen, Check,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { saveAdminPrayerRequest } from "@/lib/prayer-storage";
import { logVisitorAction } from "@/lib/activity-logger";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function Membership() {
  const { toast } = useToast();

  // Subscribe state
  const [subFirstName, setSubFirstName] = useState("");
  const [subLastName, setSubLastName] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [subPhone, setSubPhone] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [channel, setChannel] = useState("email");
  const [subSubmitted, setSubSubmitted] = useState(false);

  // Prayer / comment state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [content, setContent] = useState("");
  const [prayerSubmitted, setPrayerSubmitted] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscribers", {
        firstName: subFirstName,
        lastName: subLastName,
        email: subEmail,
        phone: subPhone || null,
        frequency,
        channel,
        isActive: true,
      });
      return res.json();
    },
    onSuccess: () => {
      setSubSubmitted(true);
      toast({
        title: "Welcome!",
        description: "You've been subscribed to inspirational messages from Alis'.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Oops",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const prayerMutation = useMutation({
    mutationFn: async () => {
      await saveAdminPrayerRequest({ name, email, phone, content });
      logVisitorAction("prayer_request_submitted", { name, hasEmail: !!email }, "prayer");
      return { ok: true };
    },
    onSuccess: () => {
      setPrayerSubmitted(true);
      toast({
        title: "Request Received",
        description: "Your message has been received. Alis will keep you in her prayers.",
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

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-lg text-foreground">Alis'</span>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="relative h-48 overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-background">
        <div className="absolute inset-0 flex items-center px-6">
          <div className="max-w-7xl mx-auto w-full">
            <p className="text-primary text-sm tracking-[0.2em] uppercase mb-1 font-sans">Join the Family</p>
            <h1 className="font-serif text-3xl md:text-4xl text-foreground">Community</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Connect with Alis through prayer requests, special messages, and inspirational content.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: HandHeart, title: "Prayer Requests", desc: "Share what's on your heart" },
            { icon: Sparkles, title: "Inspirational Messages", desc: "Receive uplifting words from Alis" },
            { icon: Church, title: "Spiritual Community", desc: "Connect through faith and encouragement" },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="p-4 text-center hover-elevate">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="prayer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="prayer" className="gap-2">
              <Heart className="w-4 h-4" /> Prayer & Comments
            </TabsTrigger>
            <TabsTrigger value="subscribe" className="gap-2">
              <Mail className="w-4 h-4" /> Subscribe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prayer">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <h2 className="font-serif text-2xl text-foreground mb-3">Prayer Requests & Special Comments</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Alis deeply cares about the spiritual wellbeing of every person who connects with her.
                  If you have something on your heart — a prayer request, a special comment, or words
                  of encouragement — she would be honored to receive them.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground text-sm">Completely Private</h3>
                      <p className="text-muted-foreground text-sm">Your messages are seen only by Alis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HandHeart className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground text-sm">Prayed Over Personally</h3>
                      <p className="text-muted-foreground text-sm">Every request is read and prayed over with genuine care</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground text-sm">Safe & Confidential</h3>
                      <p className="text-muted-foreground text-sm">Share as much or as little as you feel comfortable with</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                {prayerSubmitted ? (
                  <Card className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-serif text-2xl text-foreground mb-2">Thank You</h3>
                    <p className="text-muted-foreground mb-6">
                      Your message has been received with love and care.
                      Alis will hold you in her prayers. You are never alone.
                    </p>
                    <Button onClick={() => { setPrayerSubmitted(false); setName(""); setEmail(""); setPhone(""); setContent(""); }}>
                      Send Another Message
                    </Button>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <h3 className="font-serif text-xl text-foreground mb-5">Share Your Request</h3>
                    <form onSubmit={(e) => { e.preventDefault(); prayerMutation.mutate(); }} className="space-y-4">
                      <div>
                        <Label htmlFor="pr-name" className="text-sm">Name</Label>
                        <Input id="pr-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required data-testid="input-name" />
                      </div>
                      <div>
                        <Label htmlFor="pr-email" className="text-sm">Email (optional)</Label>
                        <Input id="pr-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" data-testid="input-email" />
                      </div>
                      <div>
                        <Label htmlFor="pr-phone" className="text-sm">Phone (optional)</Label>
                        <Input id="pr-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" data-testid="input-phone" />
                      </div>
                      <div>
                        <Label htmlFor="pr-content" className="text-sm">Prayer Request or Comment</Label>
                        <Textarea id="pr-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share what's on your heart..." rows={5} required data-testid="input-prayer-content" />
                      </div>
                      <Button type="submit" className="w-full" disabled={!name || !content || prayerMutation.isPending} data-testid="button-submit-prayer">
                        {prayerMutation.isPending ? "Sending..." : "Submit Request"}
                      </Button>
                    </form>
                  </Card>
                )}
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="subscribe">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <h2 className="font-serif text-2xl text-foreground mb-3">Messages from Alis'</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Subscribe to receive heartfelt, inspirational messages from Alis Cerrahyan.
                  Drawing from 45+ years of wisdom, her published books, and spiritual insights,
                  each message is designed to uplift and inspire you.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground text-sm">Daily or Weekly Inspiration</h3>
                      <p className="text-muted-foreground text-sm">Choose how often you'd like to hear from Alis'</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground text-sm">Wisdom from Her Books</h3>
                      <p className="text-muted-foreground text-sm">Insights from "Behind the Chair" and more</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Church className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground text-sm">Gospel & Spiritual Messages</h3>
                      <p className="text-muted-foreground text-sm">Uplifting spiritual content to nourish your soul</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                {subSubmitted ? (
                  <Card className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-serif text-2xl text-foreground mb-2">You're In!</h3>
                    <p className="text-muted-foreground mb-6">
                      Thank you for subscribing. You'll receive {frequency} inspirational messages from Alis'.
                      Each message is crafted with love and over 45 years of wisdom.
                    </p>
                    <Link href="/">
                      <Button><ArrowLeft className="w-4 h-4 mr-2" /> Back to Home</Button>
                    </Link>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <h3 className="font-serif text-xl text-foreground mb-5">Subscribe Now</h3>
                    <form onSubmit={(e) => { e.preventDefault(); subscribeMutation.mutate(); }} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="sub-firstName" className="text-sm">First Name</Label>
                          <Input id="sub-firstName" value={subFirstName} onChange={(e) => setSubFirstName(e.target.value)} placeholder="First name" required data-testid="input-first-name" />
                        </div>
                        <div>
                          <Label htmlFor="sub-lastName" className="text-sm">Last Name</Label>
                          <Input id="sub-lastName" value={subLastName} onChange={(e) => setSubLastName(e.target.value)} placeholder="Last name" required data-testid="input-last-name" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="sub-email" className="text-sm">Email Address</Label>
                        <Input id="sub-email" type="email" value={subEmail} onChange={(e) => setSubEmail(e.target.value)} placeholder="you@example.com" required data-testid="input-email" />
                      </div>
                      <div>
                        <Label htmlFor="sub-phone" className="text-sm">Phone (optional)</Label>
                        <Input id="sub-phone" type="tel" value={subPhone} onChange={(e) => setSubPhone(e.target.value)} placeholder="(555) 123-4567" data-testid="input-phone" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Frequency</Label>
                          <Select value={frequency} onValueChange={setFrequency}>
                            <SelectTrigger data-testid="select-frequency"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">Receive Via</Label>
                          <Select value={channel} onValueChange={setChannel}>
                            <SelectTrigger data-testid="select-channel"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="sms">SMS</SelectItem>
                              <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={subscribeMutation.isPending} data-testid="button-subscribe">
                        {subscribeMutation.isPending ? "Subscribing..." : (
                          <><Heart className="w-4 h-4 mr-2" /> Subscribe to Messages</>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        You can unsubscribe at any time. We respect your privacy.
                      </p>
                    </form>
                  </Card>
                )}
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
