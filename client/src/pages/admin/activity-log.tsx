import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  LogOut, RefreshCw, Search, Shield, ChevronLeft, ChevronRight,
  User, UserCheck, Eye, ShieldAlert,
} from "lucide-react";
import { fetchActivityLogs, type ActivityLogResponse } from "@/lib/activity-logger";

function ActivityLogContent() {
  const { logout } = useAuth();
  const [isOsheen, setIsOsheen] = useState(false);
  const [logs, setLogs] = useState<ActivityLogResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  // Check if current admin is osheenadmin
  useEffect(() => {
    const adminUser = localStorage.getItem("alis-admin-username");
    setIsOsheen(adminUser?.toLowerCase() === "osheenadmin");
  }, []);

  const adminAuth = "osheenadmin:Turbohyetrident1!";

  const loadLogs = useCallback(async () => {
    if (!isOsheen) return;
    setIsLoading(true);
    const result = await fetchActivityLogs({
      adminAuth,
      date,
      page,
      perPage: 50,
      user: userFilter,
      action: actionFilter,
      search,
    });
    setLogs(result);
    setIsLoading(false);
  }, [isOsheen, date, page, search, userFilter, actionFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case "admin": return <Shield className="w-3.5 h-3.5 text-red-500" />;
      case "client": return <UserCheck className="w-3.5 h-3.5 text-blue-500" />;
      default: return <Eye className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const getUserTypeBadge = (type: string) => {
    switch (type) {
      case "admin": return <Badge variant="destructive" className="text-[10px]">Admin</Badge>;
      case "client": return <Badge variant="default" className="text-[10px]">Client</Badge>;
      default: return <Badge variant="secondary" className="text-[10px]">Visitor</Badge>;
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("login")) return "text-green-600 dark:text-green-400";
    if (action.includes("logout")) return "text-amber-600 dark:text-amber-400";
    if (action.includes("register")) return "text-blue-600 dark:text-blue-400";
    if (action.includes("booked") || action.includes("submitted")) return "text-purple-600 dark:text-purple-400";
    if (action.includes("failed")) return "text-red-600 dark:text-red-400";
    if (action === "page_view") return "text-muted-foreground";
    return "text-foreground";
  };

  const formatTime = (timestamp: string) => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return timestamp;
    }
  };

  if (!isOsheen) {
    return (
      <div className="flex flex-col flex-1">
        <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="font-serif text-lg text-foreground">Activity Log</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              Activity logs are restricted to Osheen Cerrahyan only.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="font-serif text-lg text-foreground">Activity Log</h1>
          <Badge variant="outline" className="text-[10px] ml-1">Osheen Only</Badge>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                <Select value={date} onValueChange={(v) => { setDate(v); setPage(1); }}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={new Date().toISOString().split("T")[0]}>Today</SelectItem>
                    {logs?.availableDates?.filter(d => d !== new Date().toISOString().split("T")[0]).map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">User Type</label>
                <Select value={actionFilter || "__all__"} onValueChange={(v) => { setActionFilter(v === "__all__" ? "" : v); setPage(1); }}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Actions</SelectItem>
                    <SelectItem value="page_view">Page Views</SelectItem>
                    <SelectItem value="login">Logins</SelectItem>
                    <SelectItem value="register">Registrations</SelectItem>
                    <SelectItem value="logout">Logouts</SelectItem>
                    <SelectItem value="appointment_booked">Bookings</SelectItem>
                    <SelectItem value="prayer_request_submitted">Prayers</SelectItem>
                    <SelectItem value="profile_update">Profile Updates</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs text-muted-foreground mb-1 block">Search</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search logs..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" onClick={handleSearch}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button variant="outline" size="icon" onClick={loadLogs} title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Stats */}
          {logs && (
            <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
              <span>{logs.total} entries for {logs.date}</span>
              {logs.totalPages > 1 && (
                <span>| Page {logs.page} of {logs.totalPages}</span>
              )}
            </div>
          )}

          {/* Log Entries */}
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-14 rounded-md bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : !logs?.entries?.length ? (
            <div className="text-center py-16">
              <Eye className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No activity recorded for this date</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {logs.entries.map((entry) => (
                <Card key={entry.id} className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getUserTypeIcon(entry.userType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">
                          {formatTime(entry.timestamp)}
                        </span>
                        {getUserTypeBadge(entry.userType)}
                        <span className="text-sm font-medium text-foreground truncate">
                          {entry.userName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-sm font-medium ${getActionColor(entry.action)}`}>
                          {entry.action.replace(/_/g, " ")}
                        </span>
                        {entry.page && (
                          <span className="text-xs text-muted-foreground">
                            on {entry.page}
                          </span>
                        )}
                      </div>
                      {entry.details && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[600px]">
                          {entry.details}
                        </p>
                      )}
                      {entry.ip && (
                        <span className="text-[10px] text-muted-foreground/60 font-mono">
                          IP: {entry.ip}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {logs && logs.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {logs.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= logs.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default function AdminActivityLog() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <ActivityLogContent />
      </div>
    </SidebarProvider>
  );
}
