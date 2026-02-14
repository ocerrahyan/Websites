import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function StyleBoard() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/style-inspirations", {
        clientName: name,
        clientEmail: email,
        clientPhone: phone || null,
        imageUrl: imageUrl || null,
        description,
        appointmentDate: appointmentDate || null,
        isReviewed: false,
      });
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Inspiration Shared", description: "Your style vision has been submitted." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (submitted) {
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
        <div className="flex items-center justify-center min-h-[80vh] px-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif text-3xl text-foreground mb-3" data-testid="text-style-success">Vision Received!</h2>
            <p className="text-muted-foreground mb-8">
              Thank you for sharing your style inspiration. Our team will review it before your appointment.
            </p>
            <Link href="/">
              <Button data-testid="button-back-home-success">
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

      <div className="max-w-2xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2">Style Board</p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">Share Your Style Vision</h1>
          <p className="text-muted-foreground">
            Have a look in mind for your next visit? Share inspiration photos or describe your desired style.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
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
                  placeholder="Your full name"
                  required
                  data-testid="input-style-name"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  data-testid="input-style-email"
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
                  data-testid="input-style-phone"
                />
              </div>

              <div>
                <Label htmlFor="imageUrl" className="text-sm">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/inspiration-photo.jpg"
                  data-testid="input-style-image-url"
                />
                {imageUrl && (
                  <div className="mt-2 rounded-md overflow-hidden border">
                    <img src={imageUrl} alt="Inspiration preview" className="w-full max-h-48 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="description" className="text-sm">Describe Your Desired Style</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the look you're going for..."
                  rows={4}
                  required
                  data-testid="input-style-description"
                />
              </div>

              <div>
                <Label htmlFor="appointmentDate" className="text-sm">Appointment Date (optional)</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  data-testid="input-style-appointment-date"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!name || !email || !description || submitMutation.isPending}
                data-testid="button-submit-style"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {submitMutation.isPending ? "Submitting..." : "Share Inspiration"}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
