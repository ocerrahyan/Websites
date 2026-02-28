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
import { Lock, LogOut, CheckCircle, Mail, Phone, User, ChevronDown, ChevronUp, Clock, HandHeart, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { markPrayerRequestRead, fetchAllPrayerRequests, type AdminPrayerRequest } from "@/lib/prayer-storage";

function PrayerRequestsContent() {
  const { logout } = useAuth();
  const { toast } = useToast();

  const [prayerRequests, setPrayerRequests] = useState<AdminPrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshRequests = useCallback(async () => {
    const data = await fetchAllPrayerRequests();
    setPrayerRequests(data);
    setIsLoading(false);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshRequests();
    setIsRefreshing(false);
    toast({ title: "Refreshed", description: "Prayer requests updated." });
  };

  useEffect(() => {
    refreshRequests();
    // Poll for new requests every 5 seconds
    const interval = setInterval(refreshRequests, 5000);
    return () => clearInterval(interval);
  }, [refreshRequests]);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markPrayerRequestRead(id);
    await refreshRequests();
    toast({ title: "Marked as read" });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
            <Badge variant="destructive" data-testid="badge-unread-count">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleManualRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
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
            {unreadCount > 0 && ` · ${unreadCount} unread`}
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
            <HandHeart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No prayer requests yet</p>
            <p className="text-xs text-muted-foreground mt-2">Prayer requests from clients will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((request) => {
              const isExpanded = expandedId === request.id;
              const preview = request.content.length > 80
                ? request.content.substring(0, 80) + "..."
                : request.content;

              return (
                <Card
                  key={request.id}
                  className={`overflow-hidden transition-all cursor-pointer hover:shadow-md ${
                    !request.isRead ? "bg-primary/5 border-primary/20" : ""
                  }`}
                  onClick={() => toggleExpand(request.id)}
                  data-testid={`card-prayer-request-${request.id}`}
                >
                  {/* Header Row - Always Visible */}
                  <div className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      !request.isRead ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <HandHeart className={`w-5 h-5 ${!request.isRead ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm">
                          {request.name}
                        </span>
                        {!request.isRead && (
                          <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                            New
                          </Badge>
                        )}
                      </div>
                      {!isExpanded && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {preview}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-muted-foreground hidden sm:flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {request.createdAt && new Date(request.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t pt-4">
                          {/* Contact Info */}
                          <div className="flex flex-wrap gap-4 mb-4 text-xs text-muted-foreground">
                            {request.email && (
                              <a href={`mailto:${request.email}`} className="flex items-center gap-1.5 hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                                <Mail className="w-3.5 h-3.5" /> {request.email}
                              </a>
                            )}
                            {request.phone && (
                              <a href={`tel:${request.phone}`} className="flex items-center gap-1.5 hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                                <Phone className="w-3.5 h-3.5" /> {request.phone}
                              </a>
                            )}
                            {request.createdAt && (
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(request.createdAt).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>

                          {/* Full Message */}
                          <div className="bg-muted/50 rounded-lg p-4 mb-4">
                            <p className="text-foreground text-sm whitespace-pre-wrap leading-relaxed">
                              {request.content}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {!request.isRead && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => handleMarkRead(request.id, e)}
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                Mark as Read
                              </Button>
                            )}
                            {request.isRead && (
                              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Read
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
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
