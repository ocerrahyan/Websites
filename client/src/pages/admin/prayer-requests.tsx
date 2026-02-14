import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Lock, LogOut, CheckCircle, Mail, Phone, User } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PrayerRequest } from "@shared/schema";

function PrayerRequestsContent() {
  const { logout } = useAuth();
  const { toast } = useToast();

  const { data: prayerRequests, isLoading } = useQuery<PrayerRequest[]>({
    queryKey: ["/api/prayer-requests"],
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/prayer-requests/${id}`, { isRead: true });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayer-requests"] });
      toast({ title: "Marked as read" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const sorted = prayerRequests
    ? [...prayerRequests].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
    : [];

  const unreadCount = sorted.filter((r) => !r.isRead).length;

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <h1 className="font-serif text-lg text-foreground">Prayer Requests</h1>
          {unreadCount > 0 && (
            <Badge variant="secondary" data-testid="badge-unread-count">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <p className="text-muted-foreground text-sm" data-testid="text-total-count">
            {sorted.length} prayer request{sorted.length !== 1 ? "s" : ""} received
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-5 w-1/3 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        ) : !sorted.length ? (
          <div className="text-center py-16">
            <Lock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No prayer requests yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((request) => (
              <Card
                key={request.id}
                className={`p-5 ${!request.isRead ? "bg-primary/5" : ""}`}
                data-testid={`card-prayer-request-${request.id}`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-medium text-foreground text-sm" data-testid={`text-name-${request.id}`}>
                          {request.name}
                        </span>
                      </div>
                      {!request.isRead && (
                        <Badge variant="default" className="text-xs" data-testid={`badge-unread-${request.id}`}>
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
                      {request.email && (
                        <span className="flex items-center gap-1" data-testid={`text-email-${request.id}`}>
                          <Mail className="w-3 h-3" /> {request.email}
                        </span>
                      )}
                      {request.phone && (
                        <span className="flex items-center gap-1" data-testid={`text-phone-${request.id}`}>
                          <Phone className="w-3 h-3" /> {request.phone}
                        </span>
                      )}
                      {request.createdAt && (
                        <span data-testid={`text-date-${request.id}`}>
                          {new Date(request.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-foreground text-sm whitespace-pre-wrap leading-relaxed" data-testid={`text-content-${request.id}`}>
                      {request.content}
                    </p>
                  </div>
                  {!request.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markReadMutation.mutate(request.id)}
                      disabled={markReadMutation.isPending}
                      data-testid={`button-mark-read-${request.id}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      Mark as Read
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminPrayerRequests() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <PrayerRequestsContent />
      </div>
    </SidebarProvider>
  );
}
