import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, LogIn, UserPlus, Eye, EyeOff, Cake } from "lucide-react";
import { useClientAuth } from "@/lib/client-auth";

function AuthNavbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon">
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
  );
}

export default function ClientLogin() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, login, register } = useClientAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthday, setBirthday] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/portal");
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (result.ok) {
      toast({ title: "Welcome back!", description: "You've been signed in." });
      setLocation("/portal");
    } else {
      toast({ title: "Sign In Failed", description: result.error, variant: "destructive" });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure both passwords are the same.", variant: "destructive" });
      return;
    }
    if (regPassword.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const result = await register({
      firstName,
      lastName,
      email: regEmail,
      phone,
      password: regPassword,
      birthday: birthday || undefined,
    });
    setIsSubmitting(false);
    if (result.ok) {
      toast({ title: "Account Created!", description: "Welcome to the Alis' family." });
      setLocation("/portal");
    } else {
      toast({ title: "Registration Failed", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <div className="max-w-md mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2">Client Portal</p>
          <h1 className="font-serif text-3xl text-foreground">
            {mode === "login" ? "Welcome Back" : "Create Your Account"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {mode === "login"
              ? "Sign in to access your private portal"
              : "Join the Alis' family for a personalized experience"}
          </p>
        </motion.div>

        {/* Tab Toggle */}
        <div className="flex rounded-lg bg-muted p-1 mb-6">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === "login" ? "bg-background shadow text-foreground" : "text-muted-foreground"
            }`}
            onClick={() => setMode("login")}
          >
            <LogIn className="w-4 h-4 inline mr-1.5" />Sign In
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === "register" ? "bg-background shadow text-foreground" : "text-muted-foreground"
            }`}
            onClick={() => setMode("register")}
          >
            <UserPlus className="w-4 h-4 inline mr-1.5" />Register
          </button>
        </div>

        <motion.div key={mode} initial={{ opacity: 0, x: mode === "login" ? -10 : 10 }} animate={{ opacity: 1, x: 0 }}>
          {mode === "login" ? (
            <Card className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="p-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="reg-first">First Name</Label>
                    <Input
                      id="reg-first"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-last">Last Name</Label>
                    <Input
                      id="reg-last"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reg-phone">Phone</Label>
                  <Input
                    id="reg-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reg-birthday" className="flex items-center gap-1.5">
                    <Cake className="w-3.5 h-3.5" /> Birthday <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="reg-birthday"
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="reg-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-confirm">Confirm Password</Label>
                  <Input
                    id="reg-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </Card>
          )}
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to Alis' Salon's terms and privacy policy.
        </p>
      </div>
    </div>
  );
}
