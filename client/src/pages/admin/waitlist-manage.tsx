import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { LogOut, Trash2, Phone, Mail, Calendar, Clock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WaitlistEntry, Service } from "@shared/schema";

type StatusFilter = "all" | "waiting" | "contacted" | "booked";

function WaitlistContent() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<StatusFilter>("all");

  const { data: entries, isLoading } = useQuery<WaitlistEntry[]>({ queryKey: ["/api/waitlist"] });
  const { data: services } = useQuery<Service[]>({ queryKey: ["/api/services"] });

  const serviceName = (id: string | null) => {
    if (!id || !services) return null;
    return services.find((s) => s.id === id)?.name || null;
  };

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/waitlist/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      toast({ title: "Status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/waitlist/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/waitlist"] });
      toast({ title: "Entry removed" });
    },
  });

  const filtered = entries?.filter((e) => filter === "all" || e.status === filter) || [];

  const statusBadge = (status: string | null) => {
    switch (status) {
      case "contacted":
        return <Badge variant="secondary" data-testid="badge-status-contacted">Contacted</Badge>;
      case "booked":
        return <Badge className="bg-green-600 text-white" data-testid="badge-status-booked">Booked</Badge>;
      case "cancelled":
        return <Badge variant="destructive" data-testid="badge-status-cancelled">Cancelled</Badge>;
      default:
        return <Badge variant="outline" data-testid="badge-status-waiting">Waiting</Badge>;
    }
  };

  const filters: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "all" },
    { label: "Waiting", value: "waiting" },
    { label: "Contacted", value: "contacted" },
    { label: "Booked", value: "booked" },
  ];

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <h1 className="font-serif text-lg text-foreground">Waitlist</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.value)}
              data-testid={`button-filter-${f.value}`}
            >
              {f.label}
            </Button>
          ))}
          <span className="text-muted-foreground text-sm ml-auto">{filtered.length} entries</span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No waitlist entries found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((entry) => (
              <Card key={entry.id} className="p-4" data-testid={`card-waitlist-${entry.id}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-foreground" data-testid={`text-name-${entry.id}`}>{entry.clientName}</h3>
                      {statusBadge(entry.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {entry.clientEmail}
                      </span>
                      {entry.clientPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {entry.clientPhone}
                        </span>
                      )}
                    </div>
                    {serviceName(entry.serviceId) && (
                      <p className="text-sm text-muted-foreground">
                        Service: <span className="text-foreground">{serviceName(entry.serviceId)}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      {entry.preferredDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {entry.preferredDate}
                        </span>
                      )}
                      {entry.preferredTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {entry.preferredTime}
                        </span>
                      )}
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground italic">"{entry.notes}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {entry.status === "waiting" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateMutation.mutate({ id: entry.id, status: "contacted" })}
                        disabled={updateMutation.isPending}
                        data-testid={`button-contacted-${entry.id}`}
                      >
                        Mark Contacted
                      </Button>
                    )}
                    {(entry.status === "waiting" || entry.status === "contacted") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateMutation.mutate({ id: entry.id, status: "booked" })}
                        disabled={updateMutation.isPending}
                        data-testid={`button-booked-${entry.id}`}
                      >
                        Mark Booked
                      </Button>
                    )}
                    {entry.status !== "cancelled" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateMutation.mutate({ id: entry.id, status: "cancelled" })}
                        disabled={updateMutation.isPending}
                        data-testid={`button-cancel-${entry.id}`}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(entry.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${entry.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function WaitlistManage() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <WaitlistContent />
      </div>
    </SidebarProvider>
  );
}
