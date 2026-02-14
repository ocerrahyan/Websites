import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import type { Client, Appointment, Service } from "@shared/schema";
import {
  ArrowLeft, Mail, Phone, Calendar, Clock, Edit,
  Plus, X, LogOut, Tag, FileText, AlertTriangle,
  Heart, Star, CheckCircle, XCircle, CircleDot,
} from "lucide-react";

const TAG_COLORS: Record<string, string> = {
  VIP: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  Regular: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  New: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  "Color Client": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Loyal: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

const FALLBACK_PALETTE = [
  "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  "bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20",
];

function getTagColor(tag: string): string {
  if (TAG_COLORS[tag]) return TAG_COLORS[tag];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_PALETTE[Math.abs(hash) % FALLBACK_PALETTE.length];
}

const TIER_STYLES: Record<string, string> = {
  bronze: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  silver: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
  gold: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  platinum: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
};

function getStatusBadge(status: string | null) {
  switch (status) {
    case "completed":
      return { variant: "secondary" as const, icon: CheckCircle, label: "Completed" };
    case "cancelled":
      return { variant: "destructive" as const, icon: XCircle, label: "Cancelled" };
    case "confirmed":
      return { variant: "default" as const, icon: CheckCircle, label: "Confirmed" };
    case "no_show":
      return { variant: "destructive" as const, icon: XCircle, label: "No Show" };
    default:
      return { variant: "outline" as const, icon: CircleDot, label: "Pending" };
  }
}

function ClientDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { logout } = useAuth();
  const [newTag, setNewTag] = useState("");

  const { data: client, isLoading: clientLoading } = useQuery<Client>({
    queryKey: ["/api/clients", id],
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/clients", id, "appointments"],
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const tagMutation = useMutation({
    mutationFn: async (tags: string[]) => {
      const res = await apiRequest("PATCH", `/api/clients/${id}`, { tags });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    },
    onError: (error: any) => {
      toast({ title: "Error updating tags", description: error.message, variant: "destructive" });
    },
  });

  const addTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed || !client) return;
    const currentTags = client.tags || [];
    if (currentTags.includes(trimmed)) {
      toast({ title: "Tag already exists", variant: "destructive" });
      return;
    }
    tagMutation.mutate([...currentTags, trimmed]);
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    if (!client) return;
    const currentTags = client.tags || [];
    tagMutation.mutate(currentTags.filter((t) => t !== tagToRemove));
  };

  const getServiceName = (serviceId: string) => {
    return services?.find((s) => s.id === serviceId)?.name || "Unknown Service";
  };

  const sortedAppointments = appointments
    ? [...appointments].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateB.getTime() - dateA.getTime();
      })
    : [];

  if (clientLoading) {
    return (
      <div className="flex flex-col flex-1">
        <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
          <div className="flex items-center gap-2">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 space-y-6">
          <Skeleton className="h-48 w-full rounded-md" />
          <Skeleton className="h-32 w-full rounded-md" />
          <Skeleton className="h-64 w-full rounded-md" />
        </main>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col flex-1">
        <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
          <div className="flex items-center gap-2">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h1 className="font-serif text-lg text-foreground">Client Not Found</h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">This client could not be found.</p>
            <Link href="/admin/clients">
              <Button variant="outline" data-testid="button-back-to-clients">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Clients
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <Link href="/admin/clients">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="font-serif text-lg text-foreground">
            {client.firstName} {client.lastName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="bg-card/80 backdrop-blur-sm border border-border/50 p-6" data-testid="card-client-profile">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xl font-semibold text-primary" data-testid="text-client-initials">
                      {client.firstName[0]}{client.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-foreground" data-testid="text-client-name">
                      {client.firstName} {client.lastName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      {client.email && (
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground" data-testid="text-client-email">
                          <Mail className="w-3.5 h-3.5" /> {client.email}
                        </span>
                      )}
                      {client.phone && (
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground" data-testid="text-client-phone">
                          <Phone className="w-3.5 h-3.5" /> {client.phone}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {client.membershipTier && (
                        <Badge
                          variant="outline"
                          className={`capitalize no-default-hover-elevate no-default-active-elevate ${TIER_STYLES[client.membershipTier] || ""}`}
                          data-testid="badge-membership-tier"
                        >
                          <Star className="w-3 h-3 mr-1" />
                          {client.membershipTier}
                        </Badge>
                      )}
                      {client.joinedAt && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1" data-testid="text-joined-date">
                          <Calendar className="w-3 h-3" />
                          Joined {new Date(client.joinedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Link href="/admin/clients">
                  <Button variant="outline" size="sm" data-testid="button-edit-client">
                    <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Card className="bg-card/80 backdrop-blur-sm border border-border/50 p-6" data-testid="card-tags">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-serif text-lg text-foreground">Tags</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <AnimatePresence mode="popLayout">
                  {(client.tags || []).map((tag) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      layout
                    >
                      <Badge
                        variant="outline"
                        className={`${getTagColor(tag)} no-default-hover-elevate no-default-active-elevate`}
                        data-testid={`badge-tag-${tag}`}
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1.5 inline-flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
                          data-testid={`button-remove-tag-${tag}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {(!client.tags || client.tags.length === 0) && (
                  <span className="text-sm text-muted-foreground">No tags yet</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  className="max-w-xs"
                  data-testid="input-new-tag"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={addTag}
                  disabled={!newTag.trim() || tagMutation.isPending}
                  data-testid="button-add-tag"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <Card className="bg-card/80 backdrop-blur-sm border border-border/50 p-6" data-testid="card-notes-preferences">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-serif text-lg text-foreground">Notes & Preferences</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                    <span className="text-sm font-medium text-foreground">Allergies</span>
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid="text-allergies">
                    {client.allergies || "None noted"}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Heart className="w-3.5 h-3.5 text-pink-500" />
                    <span className="text-sm font-medium text-foreground">Preferred Services</span>
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid="text-preferred-services">
                    {client.preferredServices || "None noted"}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">General Notes</span>
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid="text-notes">
                    {client.notes || "No notes"}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
            <Card className="bg-card/80 backdrop-blur-sm border border-border/50 p-6" data-testid="card-visit-history">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-serif text-lg text-foreground">Visit History</h3>
                {appointments && (
                  <Badge variant="secondary" className="ml-auto" data-testid="badge-visit-count">
                    {appointments.length} visit{appointments.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              {appointmentsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-md" />
                  ))}
                </div>
              ) : sortedAppointments.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No appointments found</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-4">
                    {sortedAppointments.map((appt, index) => {
                      const statusInfo = getStatusBadge(appt.status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <motion.div
                          key={appt.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="relative pl-10"
                        >
                          <div className="absolute left-2.5 top-4 w-3 h-3 rounded-full bg-card border-2 border-primary z-10" />
                          <Card className="p-4 hover-elevate" data-testid={`card-appointment-${appt.id}`}>
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="space-y-1">
                                <p className="font-medium text-foreground" data-testid={`text-service-${appt.id}`}>
                                  {getServiceName(appt.serviceId)}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {appt.date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {appt.startTime} - {appt.endTime}
                                  </span>
                                </div>
                                {appt.notes && (
                                  <p className="text-xs text-muted-foreground mt-1.5 italic" data-testid={`text-appointment-notes-${appt.id}`}>
                                    {appt.notes}
                                  </p>
                                )}
                              </div>
                              <Badge variant={statusInfo.variant} data-testid={`badge-status-${appt.id}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function ClientDetail() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <ClientDetailContent />
      </div>
    </SidebarProvider>
  );
}
