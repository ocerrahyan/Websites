import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import {
  Video, Calendar, Clock, ArrowLeft, CheckCircle, Phone, MessageSquare,
  ArrowRight, Sparkles,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const topics = [
  "Hair Color Consultation",
  "Style Change Discussion",
  "Product Recommendations",
  "Wedding/Event Planning",
  "Hair & Scalp Assessment",
  "General Question",
];

export default function VirtualConsultation() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store consultation request locally
    const requests = JSON.parse(localStorage.getItem("alis-consultations") || "[]");
    requests.push({
      id: "vc-" + Date.now(),
      name, email, phone, topic, date, time, notes,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("alis-consultations", JSON.stringify(requests));
    setSubmitted(true);
    toast({ title: "Consultation Requested! 🎉", description: "We'll confirm your virtual consultation shortly." });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-3">
            <Link href="/"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
            <span className="font-serif text-lg text-foreground">Alis'</span>
          </div>
        </nav>
        <div className="max-w-md mx-auto px-6 py-20 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="font-serif text-3xl text-foreground mb-3">Request Received!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you, {name}! We'll review your consultation request and send a confirmation
              with a video meeting link to <strong>{email}</strong>.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/booking"><Button className="w-full">Book an In-Person Visit <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
              <Link href="/"><Button variant="outline" className="w-full">Back to Home</Button></Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
            <span className="font-serif text-lg text-foreground">Alis'</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Video className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-serif text-4xl text-foreground mb-3">Virtual Consultation</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Book a free virtual consultation with Alis to discuss
            your hair goals, get personalized advice, and plan your next look.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
            <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">
              Note: Alis is currently not accepting new clients. Virtual consultations are available for existing clients only.
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Benefits */}
          <div className="lg:col-span-1 space-y-4">
            {[
              { icon: Video, title: "Face-to-Face", desc: "Video call from the comfort of your home" },
              { icon: Sparkles, title: "Personalized Advice", desc: "Get expert recommendations for your hair type" },
              { icon: Clock, title: "15-30 Minutes", desc: "Quick yet thorough consultation" },
              { icon: Phone, title: "Flexible Scheduling", desc: "Choose a time that works for you" },
              { icon: MessageSquare, title: "Follow-Up Notes", desc: "Receive a summary after your consultation" },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="font-serif text-xl text-foreground mb-5">Book Your Free Consultation</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vc-name">Full Name</Label>
                    <Input id="vc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
                  </div>
                  <div>
                    <Label htmlFor="vc-email">Email</Label>
                    <Input id="vc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="vc-phone">Phone</Label>
                  <Input id="vc-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" required />
                </div>
                <div>
                  <Label>Consultation Topic</Label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger><SelectValue placeholder="What would you like to discuss?" /></SelectTrigger>
                    <SelectContent>
                      {topics.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vc-date">Preferred Date</Label>
                    <Input id="vc-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} required />
                  </div>
                  <div>
                    <Label htmlFor="vc-time">Preferred Time</Label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                      <SelectContent>
                        {["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"].map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="vc-notes">Additional Notes</Label>
                  <Textarea id="vc-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tell us more about your hair goals or any questions..." className="min-h-[100px]" />
                </div>
                <Button type="submit" className="w-full" disabled={!topic || !time}>
                  <Video className="w-4 h-4 mr-2" /> Request Virtual Consultation
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
