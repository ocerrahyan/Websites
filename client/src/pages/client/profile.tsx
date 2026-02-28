import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, LogOut, User, Save, Check, Cake } from "lucide-react";
import { useClientAuth } from "@/lib/client-auth";

function ProfileNavbar() {
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

export default function PortalProfile() {
  const { client, isAuthenticated, isLoading, updateProfile } = useClientAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/client/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (client) {
      setFirstName(client.firstName);
      setLastName(client.lastName);
      setEmail(client.email);
      setPhone(client.phone);
      setBirthday(client.birthday || "");
    }
  }, [client]);

  if (isLoading || !client) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ firstName, lastName, email, phone, birthday: birthday || undefined });
    setSaved(true);
    toast({ title: "Profile Updated", description: "Your changes have been saved." });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <ProfileNavbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2">Account Settings</p>
          <h1 className="font-serif text-3xl text-foreground">My Profile</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">
                  {client.firstName} {client.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">{client.email}</p>
                {client.memberTier && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary mt-1 inline-block">
                    {client.memberTier} Member
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profile-first">First Name</Label>
                  <Input
                    id="profile-first"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="profile-last">Last Name</Label>
                  <Input
                    id="profile-last"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="profile-phone">Phone</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="profile-birthday" className="flex items-center gap-1.5">
                  <Cake className="w-3.5 h-3.5" /> Birthday
                </Label>
                <Input
                  id="profile-birthday"
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">We'll send you a special surprise on your birthday!</p>
              </div>

              <Button type="submit" className="w-full">
                {saved ? (
                  <><Check className="w-4 h-4 mr-2" /> Saved!</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
          <Card className="p-6">
            <h3 className="font-medium text-foreground mb-2">Account Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member Since</span>
                <span className="text-foreground">
                  {new Date(client.createdAt).toLocaleDateString("en-US", {
                    month: "long", year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account ID</span>
                <span className="text-foreground font-mono text-xs">{client.id}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
