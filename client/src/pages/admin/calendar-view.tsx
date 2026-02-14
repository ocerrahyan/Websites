import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  ChevronLeft, ChevronRight, LogOut, Check, X, Clock,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Appointment, Client, Service } from "@shared/schema";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";

function CalendarContent() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "day">("week");
  const { logout } = useAuth();
  const { toast } = useToast();

  const { data: appointments, isLoading } = useQuery<Appointment[]>({ queryKey: ["/api/appointments"] });
  const { data: clients } = useQuery<Client[]>({ queryKey: ["/api/clients"] });
  const { data: services } = useQuery<Service[]>({ queryKey: ["/api/services"] });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/appointments/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({ title: "Appointment updated" });
    },
  });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return appointments?.filter((a) => a.date === dateStr) || [];
  };

  const hours = Array.from({ length: 11 }, (_, i) => i + 8);

  const navigateWeek = (direction: number) => {
    setCurrentDate((d) => addDays(d, direction * 7));
  };

  const navigateDay = (direction: number) => {
    setCurrentDate((d) => addDays(d, direction));
  };

  return (
    <div className="flex flex-col flex-1">
      <header className="h-14 flex items-center justify-between gap-4 px-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <h1 className="font-serif text-lg text-foreground">Calendar</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => view === "week" ? navigateWeek(-1) : navigateDay(-1)}
              data-testid="button-prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-serif text-lg text-foreground min-w-[200px] text-center">
              {view === "week"
                ? `${format(weekDays[0], "MMM d")} - ${format(weekDays[6], "MMM d, yyyy")}`
                : format(currentDate, "EEEE, MMMM d, yyyy")
              }
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => view === "week" ? navigateWeek(1) : navigateDay(1)}
              data-testid="button-next"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} data-testid="button-today">
              Today
            </Button>
            <Select value={view} onValueChange={(v: "week" | "day") => setView(v)}>
              <SelectTrigger className="w-[100px]" data-testid="select-view">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-[500px] rounded-md" />
        ) : view === "week" ? (
          <Card className="p-0 overflow-auto">
            <div className="grid grid-cols-8 min-w-[800px]">
              <div className="border-b p-2" />
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`border-b border-l p-2 text-center cursor-pointer ${
                    isSameDay(day, new Date()) ? "bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    setCurrentDate(day);
                    setView("day");
                  }}
                >
                  <p className="text-xs text-muted-foreground">{format(day, "EEE")}</p>
                  <p className={`text-sm font-medium ${
                    isSameDay(day, new Date()) ? "text-primary" : "text-foreground"
                  }`}>
                    {format(day, "d")}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    {getAppointmentsForDay(day).length}
                  </Badge>
                </div>
              ))}
              {hours.map((hour) => (
                <div key={hour} className="contents">
                  <div className="border-b p-2 text-xs text-muted-foreground text-right pr-3">
                    {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
                  </div>
                  {weekDays.map((day) => {
                    const dayAppts = getAppointmentsForDay(day).filter((a) => {
                      const h = parseInt(a.startTime.split(":")[0]);
                      const isPM = a.startTime.includes("PM");
                      const hour24 = isPM && h !== 12 ? h + 12 : !isPM && h === 12 ? 0 : h;
                      return hour24 === hour;
                    });
                    return (
                      <div key={`${day.toISOString()}-${hour}`} className="border-b border-l p-1 min-h-[50px]">
                        {dayAppts.map((appt) => {
                          const service = services?.find((s) => s.id === appt.serviceId);
                          const client = clients?.find((c) => c.id === appt.clientId);
                          return (
                            <div
                              key={appt.id}
                              className="text-xs p-1 rounded bg-primary/10 text-foreground mb-1 truncate"
                              title={`${client?.firstName} - ${service?.name}`}
                            >
                              {client?.firstName} - {service?.name?.substring(0, 10)}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {getAppointmentsForDay(currentDate).length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No appointments for this day</p>
              </div>
            ) : (
              getAppointmentsForDay(currentDate).map((appt) => {
                const service = services?.find((s) => s.id === appt.serviceId);
                const client = clients?.find((c) => c.id === appt.clientId);
                return (
                  <Card key={appt.id} className="p-4" data-testid={`appt-${appt.id}`}>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-medium text-foreground">
                          {client ? `${client.firstName} ${client.lastName}` : "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {service?.name} | {appt.startTime} - {appt.endTime}
                        </p>
                        {appt.notes && <p className="text-xs text-muted-foreground mt-1">{appt.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          appt.status === "confirmed" ? "default" :
                          appt.status === "completed" ? "secondary" :
                          appt.status === "cancelled" ? "destructive" : "outline"
                        }>
                          {appt.status}
                        </Badge>
                        {appt.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateStatusMutation.mutate({ id: appt.id, status: "confirmed" })}
                              data-testid={`button-confirm-${appt.id}`}
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateStatusMutation.mutate({ id: appt.id, status: "cancelled" })}
                              data-testid={`button-cancel-${appt.id}`}
                            >
                              <X className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                        {appt.status === "confirmed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: appt.id, status: "completed" })}
                            data-testid={`button-complete-${appt.id}`}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminCalendar() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <CalendarContent />
      </div>
    </SidebarProvider>
  );
}
