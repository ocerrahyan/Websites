import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Star, Sparkles, Check, Crown } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

const tiers = [
  {
    id: "bronze",
    name: "Bronze",
    color: "from-amber-700/20 to-amber-600/10",
    icon: Star,
    features: [
      "Priority booking",
      "Birthday special offer",
      "Exclusive updates via email",
      "Member-only content",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    color: "from-gray-400/20 to-gray-300/10",
    icon: Sparkles,
    popular: true,
    features: [
      "Everything in Bronze",
      "10% off all services",
      "Free consultations",
      "Early access to products",
      "Monthly beauty newsletter",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    color: "from-yellow-500/20 to-yellow-400/10",
    icon: Crown,
    features: [
      "Everything in Silver",
      "20% off all services",
      "Free monthly mini-treatment",
      "VIP scheduling priority",
      "Seasonal product samples",
      "Referral rewards program",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    color: "from-purple-500/20 to-purple-400/10",
    icon: Crown,
    features: [
      "Everything in Gold",
      "30% off everything",
      "Unlimited consultations",
      "Personal styling sessions",
      "Premium quarterly gift box",
      "Exclusive member events",
      "Priority on all services",
    ],
  },
];

export default function Membership() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [signupComplete, setSignupComplete] = useState(false);
  const { toast } = useToast();

  const signupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/membership/signup", {
        ...formData,
        tier: selectedTier,
      });
      return res.json();
    },
    onSuccess: () => {
      setSignupComplete(true);
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    },
    onError: (error: any) => {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  if (signupComplete) {
    const tier = tiers.find((t) => t.id === selectedTier);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="font-serif text-2xl text-foreground mb-2">Welcome to the Family!</h1>
            <p className="text-muted-foreground mb-6">
              You're now a <span className="font-medium text-foreground">{tier?.name}</span> member at Alis'.
              We can't wait to take care of you.
            </p>
            <Link href="/booking">
              <Button className="w-full" data-testid="button-book-first">Book Your First Appointment</Button>
            </Link>
          </Card>
        </motion.div>
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

      <div className="max-w-7xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2">Exclusive Access</p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3">Membership Plans</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Join the Alis' family and unlock exclusive benefits, priority booking, and special discounts on all our services and products.
          </p>
        </motion.div>

        {!showSignup ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  className={`p-5 relative overflow-visible hover-elevate cursor-pointer ${
                    selectedTier === tier.id ? "border-primary" : ""
                  } ${tier.popular ? "border-primary" : ""}`}
                  onClick={() => setSelectedTier(tier.id)}
                  data-testid={`card-tier-${tier.id}`}
                >
                  {tier.popular && (
                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${tier.color} flex items-center justify-center mb-3`}>
                    <tier.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="font-serif text-xl text-foreground mb-3">{tier.name}</h3>
                  <ul className="space-y-2 mb-5">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={selectedTier === tier.id ? "default" : "outline"}
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTier(tier.id);
                      setShowSignup(true);
                    }}
                    data-testid={`button-select-${tier.id}`}
                  >
                    {selectedTier === tier.id ? "Selected" : "Choose Plan"}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
            <Card className="p-6">
              <h2 className="font-serif text-xl text-foreground mb-1">
                Sign Up for {tiers.find((t) => t.id === selectedTier)?.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                Contact Alis' for pricing details
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">First Name</label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="First name"
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Last Name</label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Last name"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@email.com"
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowSignup(false)} data-testid="button-back-tiers">
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!formData.firstName || !formData.lastName || !formData.email || signupMutation.isPending}
                  onClick={() => signupMutation.mutate()}
                  data-testid="button-signup"
                >
                  {signupMutation.isPending ? "Signing up..." : "Join Now"}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
