import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, LogOut, Video, Clock, CheckCircle, XCircle, Plus } from "lucide-react";
import { useClientAuth } from "@/lib/client-auth";

const CONSULTATIONS_KEY = "alis-consultations";

interface Consultation {
  id: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  date: string;
  time: string;
  notes: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  meetingLink?: string;
  createdAt: string;
}

function getConsultations(email: string): Consultation[] {
  try {
    const all: Consultation[] = JSON.parse(localStorage.getItem(CONSULTATIONS_KEY) || "[]");
    return all.filter((c) => c.email.toLowerCase() === email.toLowerCase());
  } catch {
    return [];
  }
}

function ConsultNavbar() {
  const { client, logout } = useClientAuth();
  const [, setLocation] = useLocation();
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/portal"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <Link href="/portal"><span className="font-serif text-lg text-foreground">My Portal</span></Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:block">{client?.firstName}</span>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => { logout(); setLocation("/"); }}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  confirmed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  completed: "bg-green-500/10 text-green-600 dark:text-green-400",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export default function PortalConsultations() {
  const { client, isAuthenticated, isLoading } = useClientAuth();
  const [, setLocation] = useLocation();
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) setLocation("/client/login");
  }, [isLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (client) setConsultations(getConsultations(client.email));
  }, [client]);

  if (isLoading || !client) return null;

  const upcoming = consultations.filter((c) => c.status === "pending" || c.status === "confirmed");
  const past = consultations.filter((c) => c.status === "completed" || c.status === "cancelled");

  return (
    <div className="min-h-screen bg-background">
      <ConsultNavbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2">Virtual</p>
          <h1 className="font-serif text-3xl text-foreground">My Consultations</h1>
        </motion.div>

        {consultations.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-10 text-center">
              <Video className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-serif text-xl text-foreground mb-2">No Consultations Yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Book a free virtual consultation to discuss your hair goals with Alis.
              </p>
              <Link href="/virtual-consultation">
                <Button><Plus className="w-4 h-4 mr-2" /> Book Virtual Consultation</Button>
              </Link>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-end">
              <Link href="/virtual-consultation">
                <Button size="sm"><Plus className="w-4 h-4 mr-2" /> New Consultation</Button>
              </Link>
            </div>

            {upcoming.length > 0 && (
              <div>
                <h2 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Upcoming
                </h2>
                <div className="space-y-3">
                  {upcoming.map((c) => (
                    <Card key={c.id} className="p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="font-medium text-foreground">{c.topic}</h3>
                          <p className="text-sm text-muted-foreground">
                            {c.date ? new Date(c.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Date TBD"} at {c.time}
                          </p>
                          {c.meetingLink && (
                            <a href={c.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 inline-block">
                              Join Meeting Link
                            </a>
                          )}
                        </div>
                        <Badge className={statusColors[c.status]}>{c.status}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Past
                </h2>
                <div className="space-y-3">
                  {past.map((c) => (
                    <Card key={c.id} className="p-4 opacity-70">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="font-medium text-foreground">{c.topic}</h3>
                          <p className="text-sm text-muted-foreground">
                            {c.date ? new Date(c.date).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : ""} - {c.time}
                          </p>
                        </div>
                        <Badge className={statusColors[c.status]}>{c.status}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
