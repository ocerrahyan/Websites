import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Video, LogOut, CheckCircle, XCircle, Clock, Users, Calendar,
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";

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

function getConsultations(): Consultation[] {
  try {
    return JSON.parse(localStorage.getItem(CONSULTATIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveConsultations(data: Consultation[]) {
  localStorage.setItem(CONSULTATIONS_KEY, JSON.stringify(data));
}

const sampleConsultations: Consultation[] = [
  {
    id: "vc-s1", name: "Sarah Johnson", email: "sarah@email.com", phone: "(555) 111-2222",
    topic: "Hair Color Consultation", date: "2026-02-18", time: "10:00 AM",
    notes: "Interested in going from brunette to balayage blonde.", status: "pending",
    createdAt: "2026-02-13T14:00:00Z",
  },
  {
    id: "vc-s2", name: "Maria Lopez", email: "maria@email.com", phone: "(555) 333-4444",
    topic: "Wedding/Event Planning", date: "2026-02-20", time: "2:00 PM",
    notes: "Getting married in April, need bridal hair consultation.", status: "confirmed",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    createdAt: "2026-02-12T10:00:00Z",
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  confirmed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  completed: "bg-green-500/10 text-green-600 dark:text-green-400",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function ConsultationsContent() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<Consultation[]>(() => {
    const stored = getConsultations();
    return stored.length > 0 ? stored : sampleConsultations;
  });

  const updateStatus = (id: string, status: Consultation["status"]) => {
    const updated = consultations.map((c) => c.id === id ? { ...c, status } : c);
    setConsultations(updated);
    saveConsultations(updated);
    toast({ title: `Consultation ${status}` });
  };

  const pending = consultations.filter((c) => c.status === "pending");
  const confirmed = consultations.filter((c) => c.status === "confirmed");
  const completed = consultations.filter((c) => c.status === "completed" || c.status === "cancelled");

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="font-serif text-lg text-foreground">Virtual Consultations</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout}><LogOut className="w-4 h-4" /></Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Pending", value: pending.length, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
              { label: "Confirmed", value: confirmed.length, icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Total", value: consultations.length, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
            ].map((stat) => (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <div className={`w-8 h-8 rounded-md ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              </Card>
            ))}
          </div>

          {consultations.length === 0 ? (
            <Card className="p-10 text-center">
              <Video className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-serif text-xl text-foreground mb-2">No Consultation Requests</h3>
              <p className="text-sm text-muted-foreground">Virtual consultation requests will appear here.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {consultations.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-medium text-foreground">{c.name}</h4>
                          <Badge className={statusColors[c.status]}>{c.status}</Badge>
                        </div>
                        <p className="text-sm text-primary font-medium">{c.topic}</p>
                        <p className="text-sm text-muted-foreground">
                          {c.date ? new Date(c.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "No date"} at {c.time}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{c.email} · {c.phone}</p>
                        {c.notes && <p className="text-sm text-muted-foreground mt-2 italic">"{c.notes}"</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {c.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => updateStatus(c.id, "confirmed")}>
                              <CheckCircle className="w-3 h-3 mr-1" /> Confirm
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "cancelled")}>
                              <XCircle className="w-3 h-3 mr-1" /> Decline
                            </Button>
                          </>
                        )}
                        {c.status === "confirmed" && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "completed")}>
                            <CheckCircle className="w-3 h-3 mr-1" /> Mark Done
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default function AdminConsultations() {
  const style = { "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem" };
  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <ConsultationsContent />
      </div>
    </SidebarProvider>
  );
}
