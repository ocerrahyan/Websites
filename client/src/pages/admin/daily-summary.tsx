import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Calendar, CheckCircle2, DollarSign, Users, Send, ArrowRight, LogOut, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Client, Service } from "@shared/schema";
import { AdminNotificationBell } from "@/components/admin-notification-bell";

type DailySummaryData = {
  todayCompletedAppointments: number;
  todayTotalAppointments: number;
  todayRevenue: number;
  tomorrowAppointments: Array<{
    id: string;
    clientId: string;
    serviceId: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
  }>;
};

function DailySummaryContent() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const { data: summaryData, isLoading } = useQuery<DailySummaryData>({ queryKey: ["/api/daily-summary"] });
  const { data: clients } = useQuery<Client[]>({ queryKey: ["/api/clients"] });
  const { data: services } = useQuery<Service[]>({ queryKey: ["/api/services"] });

  const getClientName = (clientId: string) => {
    const client = clients?.find((c) => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : "Unknown";
  };

  const getServiceName = (serviceId: string) => {
    return services?.find((s) => s.id === serviceId)?.name || "Service";
  };

  const handleSendReport = () => {
    toast({ title: "Closing Report Sent", description: "Daily summary has been sent successfully." });
  };

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <h1 className="font-serif text-lg text-foreground">Daily Summary</h1>
        </div>
        <div className="flex items-center gap-2">
          <AdminNotificationBell />
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h2 className="font-serif text-2xl text-foreground mb-1">End of Day</h2>
          <p className="text-sm text-muted-foreground" data-testid="text-today-date">{dateStr}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <Card className="p-5 bg-card/80 backdrop-blur-sm border border-border/50" data-testid="card-today-overview">
            <h3 className="font-serif text-lg text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Today's Overview
            </h3>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 rounded-md" />
                <Skeleton className="h-10 rounded-md" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Appointments Completed</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground" data-testid="text-completed-appointments">
                    {summaryData?.todayCompletedAppointments || 0} / {summaryData?.todayTotalAppointments || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Revenue Earned</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground" data-testid="text-today-revenue">
                    ${(summaryData?.todayRevenue || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Appointments</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground" data-testid="text-total-appointments">
                    {summaryData?.todayTotalAppointments || 0}
                  </span>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-5 bg-card/80 backdrop-blur-sm border border-border/50" data-testid="card-tomorrow-schedule">
            <h3 className="font-serif text-lg text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" /> Tomorrow's Schedule
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 rounded-md" />
                <Skeleton className="h-12 rounded-md" />
              </div>
            ) : !summaryData?.tomorrowAppointments || summaryData.tomorrowAppointments.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No appointments scheduled for tomorrow</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {summaryData.tomorrowAppointments.map((appt) => (
                  <div key={appt.id} className="p-2 rounded-md bg-muted/50 flex items-center justify-between gap-2" data-testid={`tomorrow-appt-${appt.id}`}>
                    <div>
                      <p className="text-sm font-medium text-foreground">{getClientName(appt.clientId)}</p>
                      <p className="text-xs text-muted-foreground">{getServiceName(appt.serviceId)}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{appt.startTime}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5 bg-card/80 backdrop-blur-sm border border-border/50" data-testid="card-quick-actions">
            <h3 className="font-serif text-lg text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full justify-start" onClick={handleSendReport} data-testid="button-send-closing-report">
                <Send className="w-4 h-4 mr-2" /> Send Closing Report
              </Button>
              <Link href="/admin/calendar">
                <Button variant="outline" className="w-full justify-start" data-testid="link-view-calendar">
                  <Calendar className="w-4 h-4 mr-2" /> View Full Calendar <ArrowRight className="w-3 h-3 ml-auto" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function DailySummary() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <DailySummaryContent />
      </div>
    </SidebarProvider>
  );
}
