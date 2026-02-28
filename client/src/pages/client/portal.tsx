import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useClientAuth } from "@/lib/client-auth";
import {
  HandHeart, Calendar, User, LogOut, ArrowLeft, Scissors, Star,
  ClipboardList, Heart, ChevronRight, Mail, Bell, Video, Sparkles, Cake,
} from "lucide-react";
import { ClientNotificationBell } from "@/components/client-notification-bell";

function PortalNavbar() {
  const { client, logout } = useClientAuth();
  const [, setLocation] = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/">
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
          <ClientNotificationBell />
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

const portalItems = [
  {
    title: "Prayer Requests",
    description: "Send a private prayer request to Alis and view your history",
    href: "/portal/prayer-requests",
    icon: HandHeart,
    color: "from-purple-500/20 to-purple-400/10",
  },
  {
    title: "My Appointments",
    description: "View your schedule, service history & recommendations",
    href: "/portal/appointments",
    icon: Calendar,
    color: "from-blue-500/20 to-blue-400/10",
  },
  {
    title: "My Profile",
    description: "Update your personal information and preferences",
    href: "/portal/profile",
    icon: User,
    color: "from-green-500/20 to-green-400/10",
  },
  {
    title: "Email Preferences",
    description: "Manage your email subscriptions and notification settings",
    href: "/portal/email-preferences",
    icon: Mail,
    color: "from-teal-500/20 to-teal-400/10",
  },
  {
    title: "Virtual Consultation",
    description: "Book a free video consultation with Alis",
    href: "/portal/consultations",
    icon: Video,
    color: "from-cyan-500/20 to-cyan-400/10",
  },
  {
    title: "Book Appointment",
    description: "Schedule your next visit with Alis",
    href: "/booking",
    icon: Scissors,
    color: "from-rose-500/20 to-rose-400/10",
  },
  {
    title: "Leave a Review",
    description: "Share your experience with others",
    href: "/reviews",
    icon: Star,
    color: "from-yellow-500/20 to-yellow-400/10",
  },
  {
    title: "Style Board",
    description: "Share style inspiration for your next visit",
    href: "/style-board",
    icon: ClipboardList,
    color: "from-indigo-500/20 to-indigo-400/10",
  },
];

export default function Portal() {
  const { client, isAuthenticated, isLoading } = useClientAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/client/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading || !client) {
    return null;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // Check if it's client's birthday month
  const isBirthdayMonth = (() => {
    if (!client.birthday) return false;
    const bday = new Date(client.birthday);
    const now = new Date();
    return bday.getMonth() === now.getMonth();
  })();
  const isBirthdayToday = (() => {
    if (!client.birthday) return false;
    const bday = new Date(client.birthday);
    const now = new Date();
    return bday.getMonth() === now.getMonth() && bday.getDate() === now.getDate();
  })();

  return (
    <div className="min-h-screen bg-background">
      <PortalNavbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{greeting},</p>
              <h1 className="font-serif text-2xl md:text-3xl text-foreground">
                {client.firstName} {client.lastName}
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 ml-15">
            Welcome to your private portal at Alis' Salon.
          </p>
        </motion.div>

        {/* Birthday Greeting */}
        {isBirthdayToday && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6">
            <Card className="p-5 border-pink-500/30 bg-gradient-to-r from-pink-500/5 to-amber-500/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                  <Cake className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-foreground">Happy Birthday, {client.firstName}! 🎂🎉</h3>
                  <p className="text-sm text-muted-foreground">Wishing you the most beautiful day. As a gift, enjoy a special surprise on your next visit!</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {isBirthdayMonth && !isBirthdayToday && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card className="p-4 border-pink-500/20 bg-pink-500/5">
              <div className="flex items-center gap-3">
                <Cake className="w-5 h-5 text-pink-500" />
                <p className="text-sm text-foreground">
                  🎉 It's your birthday month! Don't forget — there may be a special treat waiting for you at the salon.
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {portalItems.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={item.href}>
                <Card className="p-5 hover-elevate cursor-pointer group h-full">
                  <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                    <item.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1 flex items-center gap-1">
                    {item.title}
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
