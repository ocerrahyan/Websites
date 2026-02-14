import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Heart, CreditCard, DollarSign, CheckCircle2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Tip } from "@shared/schema";

const PRESET_AMOUNTS = [5, 10, 20, 50];

function TipNavbar() {
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
        <div className="flex items-center gap-3">
          <Link href="/" data-testid="link-back-home">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <span className="font-serif text-xl text-foreground">Alis'</span>
          </Link>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}

function AmountSelector({ selected, onSelect, customAmount, onCustomChange }: {
  selected: number | "custom";
  onSelect: (val: number | "custom") => void;
  customAmount: string;
  onCustomChange: (val: string) => void;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Select Amount</Label>
      <div className="grid grid-cols-5 gap-2">
        {PRESET_AMOUNTS.map((amt) => (
          <Button
            key={amt}
            variant={selected === amt ? "default" : "outline"}
            onClick={() => onSelect(amt)}
            data-testid={`button-amount-${amt}`}
          >
            ${amt}
          </Button>
        ))}
        <Button
          variant={selected === "custom" ? "default" : "outline"}
          onClick={() => onSelect("custom")}
          data-testid="button-amount-custom"
        >
          Custom
        </Button>
      </div>
      {selected === "custom" && (
        <div>
          <Label htmlFor="custom-amount" className="text-sm">Custom Amount ($)</Label>
          <Input
            id="custom-amount"
            type="number"
            min="1"
            step="0.01"
            value={customAmount}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder="Enter amount"
            data-testid="input-custom-amount"
          />
        </div>
      )}
    </div>
  );
}

export default function TipPage() {
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(10);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<"stripe" | "zelle">("stripe");

  const [zelleName, setZelleName] = useState("");
  const [zelleAmount, setZelleAmount] = useState<number | "custom">(10);
  const [zelleCustomAmount, setZelleCustomAmount] = useState("");
  const [zelleMessage, setZelleMessage] = useState("");

  const getAmount = (): string => {
    if (selectedAmount === "custom") return customAmount;
    return String(selectedAmount);
  };

  const getZelleAmount = (): string => {
    if (zelleAmount === "custom") return zelleCustomAmount;
    return String(zelleAmount);
  };

  const stripeTipMutation = useMutation({
    mutationFn: async () => {
      const amount = getAmount();
      if (!amount || parseFloat(amount) <= 0) throw new Error("Please select a valid amount");
      if (!name.trim()) throw new Error("Please enter your name");

      const res = await apiRequest("POST", "/api/tips", {
        clientName: name.trim(),
        clientEmail: email.trim() || null,
        amount,
        method: "stripe",
        stripePaymentId: null,
        message: message.trim() || null,
      });
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Thank you!", description: "Your tip has been recorded." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const zelleTipMutation = useMutation({
    mutationFn: async () => {
      const amount = getZelleAmount();
      if (!amount || parseFloat(amount) <= 0) throw new Error("Please select a valid amount");
      if (!zelleName.trim()) throw new Error("Please enter your name");

      const res = await apiRequest("POST", "/api/tips", {
        clientName: zelleName.trim(),
        clientEmail: null,
        amount,
        method: "zelle",
        stripePaymentId: null,
        message: zelleMessage.trim() || null,
      });
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Thank you!", description: "Your Zelle tip has been recorded." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <TipNavbar />
        <div className="pt-24 pb-20 px-6 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif text-3xl text-foreground mb-3" data-testid="text-tip-success">Thank You!</h2>
            <p className="text-muted-foreground mb-8">
              Your generosity means the world to Alis'. Thank you for your kind tip and support.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/">
                <Button data-testid="button-back-home-success">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Button>
              </Link>
              <Button variant="outline" onClick={() => {
                setSubmitted(false);
                setName("");
                setEmail("");
                setMessage("");
                setZelleName("");
                setZelleMessage("");
              }} data-testid="button-tip-again">
                Send Another Tip
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TipNavbar />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2 font-sans">Show Your Appreciation</p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">Leave a Tip</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your tips are greatly appreciated. Choose your preferred payment method below.
            </p>
          </motion.div>

          <div className="flex gap-2 mb-6 justify-center">
            <Button
              variant={activeTab === "stripe" ? "default" : "outline"}
              onClick={() => setActiveTab("stripe")}
              data-testid="button-tab-stripe"
            >
              <CreditCard className="w-4 h-4 mr-2" /> Card Payment
            </Button>
            <Button
              variant={activeTab === "zelle" ? "default" : "outline"}
              onClick={() => setActiveTab("zelle")}
              data-testid="button-tab-zelle"
            >
              <DollarSign className="w-4 h-4 mr-2" /> Zelle
            </Button>
          </div>

          {activeTab === "stripe" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6">
                <h3 className="font-serif text-xl text-foreground mb-5 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> Tip with Card
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    stripeTipMutation.mutate();
                  }}
                  className="space-y-4"
                >
                  <AmountSelector
                    selected={selectedAmount}
                    onSelect={setSelectedAmount}
                    customAmount={customAmount}
                    onCustomChange={setCustomAmount}
                  />

                  <div>
                    <Label htmlFor="stripe-name" className="text-sm">Your Name</Label>
                    <Input
                      id="stripe-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      data-testid="input-stripe-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="stripe-email" className="text-sm">Email (optional)</Label>
                    <Input
                      id="stripe-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      data-testid="input-stripe-email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="stripe-message" className="text-sm">Thank You Message (optional)</Label>
                    <Textarea
                      id="stripe-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Leave a message for Alis'..."
                      rows={3}
                      data-testid="input-stripe-message"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={stripeTipMutation.isPending}
                    data-testid="button-tip-stripe"
                  >
                    {stripeTipMutation.isPending ? "Processing..." : (
                      <>
                        <Heart className="w-4 h-4 mr-2" /> Tip ${selectedAmount === "custom" ? (customAmount || "0") : selectedAmount} with Card
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Tip recorded securely. Stripe payment processing may require configuration.
                  </p>
                </form>
              </Card>
            </motion.div>
          )}

          {activeTab === "zelle" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 mb-6">
                <h3 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" /> Send via Zelle
                </h3>
                <div className="bg-muted/50 rounded-md p-4 mb-4">
                  <p className="text-sm text-foreground font-medium mb-2" data-testid="text-zelle-instructions">
                    Send your tip via Zelle to Alis' Salon
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    Zelle ID: <span className="font-medium text-foreground" data-testid="text-zelle-id">alis.salon@email.com</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Open your banking app, select Zelle, and send to the above ID. Then record your tip below.
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-serif text-lg text-foreground mb-4">Record Your Zelle Tip</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    zelleTipMutation.mutate();
                  }}
                  className="space-y-4"
                >
                  <AmountSelector
                    selected={zelleAmount}
                    onSelect={setZelleAmount}
                    customAmount={zelleCustomAmount}
                    onCustomChange={setZelleCustomAmount}
                  />

                  <div>
                    <Label htmlFor="zelle-name" className="text-sm">Your Name</Label>
                    <Input
                      id="zelle-name"
                      value={zelleName}
                      onChange={(e) => setZelleName(e.target.value)}
                      placeholder="Your name"
                      required
                      data-testid="input-zelle-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="zelle-message" className="text-sm">Message (optional)</Label>
                    <Textarea
                      id="zelle-message"
                      value={zelleMessage}
                      onChange={(e) => setZelleMessage(e.target.value)}
                      placeholder="Leave a message for Alis'..."
                      rows={3}
                      data-testid="input-zelle-message"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={zelleTipMutation.isPending}
                    data-testid="button-tip-zelle"
                  >
                    {zelleTipMutation.isPending ? "Recording..." : (
                      <>
                        <Heart className="w-4 h-4 mr-2" /> Record Zelle Tip
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
