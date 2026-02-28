import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Calendar, Package, ShoppingBag, Clock, TrendingUp, LogOut,
  Scissors, ArrowRight, Bell, Cake, Heart, Send, Sparkles, CheckCircle2,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { fetchAllAppointments, type PHPAppointment } from "@/lib/appointment-storage";
import type { Client, Appointment, Service, Product } from "@shared/schema";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";

type BirthdayClient = Client & { daysUntil: number };

function DashboardContent() {
  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({ queryKey: ["/api/clients"] });
  const { data: appointments, isLoading: apptLoading } = useQuery<Appointment[]>({ queryKey: ["/api/appointments"] });
  const { data: services } = useQuery<Service[]>({ queryKey: ["/api/services"] });
  const { data: products } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: birthdays, isLoading: birthdaysLoading } = useQuery<BirthdayClient[]>({ queryKey: ["/api/clients/upcoming-birthdays"] });
  const { data: pendingReminders, isLoading: remindersLoading } = useQuery<Appointment[]>({ queryKey: ["/api/reminders/pending"] });
  const { data: pendingFollowups, isLoading: followupsLoading } = useQuery<Appointment[]>({ queryKey: ["/api/followups/pending"] });
  const [phpAppointments, setPhpAppointments] = useState<PHPAppointment[]>([]);
  const { logout } = useAuth();
  const { toast } = useToast();
  const [generatingBirthday, setGeneratingBirthday] = useState<string | null>(null);
  const [generatingFollowup, setGeneratingFollowup] = useState<string | null>(null);

  // Fetch PHP appointments
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAllAppointments();
        setPhpAppointments(data);
      } catch { /* ignore */ }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const markReminded = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/appointments/${id}/remind`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders/pending"] });
      toast({ title: "Reminder marked as sent" });
    },
  });

  const markFollowedUp = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/appointments/${id}/followup`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/followups/pending"] });
      toast({ title: "Follow-up marked as sent" });
    },
  });

  const generateBirthdayMsg = async (clientName: string) => {
    setGeneratingBirthday(clientName);
    try {
      const res = await apiRequest("POST", "/api/ai/generate-birthday", { clientName });
      const data = await res.json();
      toast({ title: "Birthday Message Generated", description: data.content });
    } catch {
      toast({ title: "Could not generate message", variant: "destructive" });
    } finally {
      setGeneratingBirthday(null);
    }
  };

  const generateFollowupMsg = async (apptId: string) => {
    setGeneratingFollowup(apptId);
    try {
      const client = clients?.find((c) => c.id === pendingFollowups?.find((a) => a.id === apptId)?.clientId);
      const service = services?.find((s) => s.id === pendingFollowups?.find((a) => a.id === apptId)?.serviceId);
      const res = await apiRequest("POST", "/api/ai/generate-followup", {
        clientName: client ? `${client.firstName} ${client.lastName}` : "a client",
        serviceName: service?.name || "salon service",
      });
      const data = await res.json();
      toast({ title: "Follow-up Message Generated", description: data.content });
    } catch {
      toast({ title: "Could not generate message", variant: "destructive" });
    } finally {
      setGeneratingFollowup(null);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments?.filter((a) => a.date === today) || [];
  const pendingAppointments = appointments?.filter((a) => a.status === "pending") || [];
  // PHP appointments for today and pending
  const todayPhpAppts = phpAppointments.filter((a) => a.date === today);
  const pendingPhpAppts = phpAppointments.filter((a) => a.status === "pending");
  const totalTodayAppts = todayAppointments.length + todayPhpAppts.length;

  const stats = [
    {
      label: "Total Clients",
      value: clients?.length || 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Today's Appointments",
      value: totalTodayAppts,
      icon: Calendar,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Active Services",
      value: services?.filter((s) => s.isActive).length || 0,
      icon: Scissors,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Products Listed",
      value: products?.length || 0,
      icon: ShoppingBag,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <h1 className="font-serif text-lg text-foreground">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h2 className="font-serif text-2xl text-foreground mb-1">Welcome back, Alis</h2>
            <p className="text-muted-foreground text-sm">Here's what's happening at the salon today.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <div className={`w-8 h-8 rounded-md ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-foreground">
                    {clientsLoading || apptLoading ? <Skeleton className="h-7 w-12" /> : stat.value}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-5">
              <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                <h3 className="font-serif text-lg text-foreground">Today's Schedule</h3>
                <Link href="/admin/calendar">
                  <Button variant="ghost" size="sm" data-testid="button-view-calendar">
                    View All <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
              {apptLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-md" />
                  ))}
                </div>
              ) : totalTodayAppts === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.slice(0, 5).map((appt) => {
                    const service = services?.find((s) => s.id === appt.serviceId);
                    const client = clients?.find((c) => c.id === appt.clientId);
                    return (
                      <div key={appt.id} className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/50" data-testid={`appointment-${appt.id}`}>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {client ? `${client.firstName} ${client.lastName}` : "Unknown Client"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {service?.name} - {appt.startTime}
                          </p>
                        </div>
                        <Badge variant={
                          appt.status === "confirmed" ? "default" :
                          appt.status === "completed" ? "secondary" :
                          appt.status === "cancelled" ? "destructive" : "outline"
                        }>
                          {appt.status}
                        </Badge>
                      </div>
                    );
                  })}
                  {todayPhpAppts.slice(0, 5).map((appt) => (
                    <div key={appt.id} className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/50" data-testid={`appointment-${appt.id}`}>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {appt.firstName} {appt.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appt.serviceName} - {appt.startTime}
                        </p>
                        {appt.email && <p className="text-xs text-muted-foreground">{appt.email}</p>}
                      </div>
                      <Badge variant={
                        appt.status === "confirmed" ? "default" :
                        appt.status === "completed" ? "secondary" :
                        appt.status === "cancelled" ? "destructive" : "outline"
                      }>
                        {appt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border border-border/50 p-5">
              <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-pink-500/10 flex items-center justify-center">
                    <Cake className="w-4 h-4 text-pink-500" />
                  </div>
                  <h3 className="font-serif text-lg text-foreground">Upcoming Birthdays</h3>
                </div>
                {birthdays && birthdays.length > 0 && (
                  <Badge variant="secondary">{birthdays.length}</Badge>
                )}
              </div>
              {birthdaysLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-md" />
                  ))}
                </div>
              ) : !birthdays?.length ? (
                <div className="text-center py-8">
                  <Cake className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No upcoming birthdays in the next 30 days</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {birthdays.slice(0, 5).map((bc) => (
                    <motion.div key={bc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/50" data-testid={`birthday-${bc.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-pink-500">{bc.firstName[0]}{bc.lastName[0]}</span>
                        </div>
                        <div>
                          <Link href={`/admin/clients/${bc.id}`} className="text-sm font-medium text-foreground hover:underline" data-testid={`link-birthday-client-${bc.id}`}>{bc.firstName} {bc.lastName}</Link>
                          <p className="text-xs text-muted-foreground">
                            {bc.daysUntil === 0 ? "Today!" : bc.daysUntil === 1 ? "Tomorrow" : `In ${bc.daysUntil} days`}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => generateBirthdayMsg(`${bc.firstName} ${bc.lastName}`)} disabled={generatingBirthday === `${bc.firstName} ${bc.lastName}`} data-testid={`button-birthday-msg-${bc.id}`}>
                        {generatingBirthday === `${bc.firstName} ${bc.lastName}` ? (
                          <Sparkles className="w-3 h-3 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border border-border/50 p-5">
              <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-amber-500/10 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-amber-500" />
                  </div>
                  <h3 className="font-serif text-lg text-foreground">Appointment Reminders</h3>
                </div>
                {pendingReminders && pendingReminders.length > 0 && (
                  <Badge variant="secondary">{pendingReminders.length}</Badge>
                )}
              </div>
              {remindersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-md" />
                  ))}
                </div>
              ) : !pendingReminders?.length ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">All reminders sent. You're all set!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReminders.slice(0, 5).map((appt) => {
                    const service = services?.find((s) => s.id === appt.serviceId);
                    const client = clients?.find((c) => c.id === appt.clientId);
                    return (
                      <motion.div key={appt.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/50" data-testid={`reminder-${appt.id}`}>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {client ? `${client.firstName} ${client.lastName}` : "Client"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {service?.name} - {appt.date} at {appt.startTime}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => markReminded.mutate(appt.id)} disabled={markReminded.isPending} data-testid={`button-remind-${appt.id}`}>
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Sent
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border border-border/50 p-5">
              <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h3 className="font-serif text-lg text-foreground">Follow-Up Aftercare</h3>
                </div>
                {pendingFollowups && pendingFollowups.length > 0 && (
                  <Badge variant="secondary">{pendingFollowups.length}</Badge>
                )}
              </div>
              {followupsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-md" />
                  ))}
                </div>
              ) : !pendingFollowups?.length ? (
                <div className="text-center py-8">
                  <Heart className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No follow-ups pending</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingFollowups.slice(0, 5).map((appt) => {
                    const service = services?.find((s) => s.id === appt.serviceId);
                    const client = clients?.find((c) => c.id === appt.clientId);
                    return (
                      <motion.div key={appt.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/50" data-testid={`followup-${appt.id}`}>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {client ? `${client.firstName} ${client.lastName}` : "Client"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {service?.name} - {appt.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => generateFollowupMsg(appt.id)} disabled={generatingFollowup === appt.id} data-testid={`button-gen-followup-${appt.id}`}>
                            {generatingFollowup === appt.id ? <Sparkles className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => markFollowedUp.mutate(appt.id)} disabled={markFollowedUp.isPending} data-testid={`button-followup-done-${appt.id}`}>
                            <CheckCircle2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                <h3 className="font-serif text-lg text-foreground">Recent Clients</h3>
                <Link href="/admin/clients">
                  <Button variant="ghost" size="sm" data-testid="button-view-clients">
                    View All <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
              {clientsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-md" />
                  ))}
                </div>
              ) : !clients?.length ? (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No clients yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clients.slice(0, 5).map((client) => (
                    <div key={client.id} className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/50" data-testid={`client-${client.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {client.firstName[0]}{client.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <Link href={`/admin/clients/${client.id}`} className="text-sm font-medium text-foreground hover:underline" data-testid={`link-client-${client.id}`}>{client.firstName} {client.lastName}</Link>
                          <p className="text-xs text-muted-foreground">{client.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">{client.membershipTier}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="font-serif text-lg text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/clients">
                  <Button variant="outline" className="w-full h-auto flex flex-col items-center gap-2 p-4" data-testid="button-quick-clients">
                    <Users className="w-5 h-5" />
                    <span className="text-xs">Manage Clients</span>
                  </Button>
                </Link>
                <Link href="/admin/calendar">
                  <Button variant="outline" className="w-full h-auto flex flex-col items-center gap-2 p-4" data-testid="button-quick-calendar">
                    <Calendar className="w-5 h-5" />
                    <span className="text-xs">Calendar</span>
                  </Button>
                </Link>
                <Link href="/admin/services">
                  <Button variant="outline" className="w-full h-auto flex flex-col items-center gap-2 p-4" data-testid="button-quick-services">
                    <Scissors className="w-5 h-5" />
                    <span className="text-xs">Services</span>
                  </Button>
                </Link>
                <Link href="/admin/products">
                  <Button variant="outline" className="w-full h-auto flex flex-col items-center gap-2 p-4" data-testid="button-quick-products">
                    <ShoppingBag className="w-5 h-5" />
                    <span className="text-xs">Products</span>
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <DashboardContent />
      </div>
    </SidebarProvider>
  );
}
