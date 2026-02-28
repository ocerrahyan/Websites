import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ArrowLeft, LogOut, Calendar, Clock, Scissors, CheckCircle, XCircle,
  CalendarPlus, Download, Star, Sparkles, ArrowRight,
} from "lucide-react";
import { useClientAuth } from "@/lib/client-auth";
import { useQuery } from "@tanstack/react-query";
import type { Service } from "@shared/schema";

const APPOINTMENTS_KEY = "alis-client-appointments";

interface Appointment {
  id: string;
  serviceName: string;
  serviceCategory?: string;
  date: string;
  time: string;
  status: "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
}

function getAppointments(clientId: string): Appointment[] {
  try {
    const all = JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || "{}");
    return all[clientId] || [];
  } catch {
    return [];
  }
}

// Generate ICS calendar file
function generateICS(appt: Appointment): string {
  const d = appt.date.replace(/-/g, "");
  const [h, m] = parseTime(appt.time);
  const startDT = `${d}T${h}${m}00`;
  const endH = String(parseInt(h) + 1).padStart(2, "0");
  const endDT = `${d}T${endH}${m}00`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Alis Salon//EN",
    "BEGIN:VEVENT",
    `DTSTART:${startDT}`,
    `DTEND:${endDT}`,
    `SUMMARY:${appt.serviceName} at Alis' Salon`,
    "LOCATION:Alis' Salon",
    `DESCRIPTION:Your appointment for ${appt.serviceName}`,
    `UID:${appt.id}@alissimplyelegant.com`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function parseTime(time: string): [string, string] {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return ["09", "00"];
  let hours = parseInt(match[1]);
  const mins = match[2];
  if (match[3]?.toUpperCase() === "PM" && hours < 12) hours += 12;
  if (match[3]?.toUpperCase() === "AM" && hours === 12) hours = 0;
  return [String(hours).padStart(2, "0"), mins];
}

function downloadICS(appt: Appointment) {
  const ics = generateICS(appt);
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `alis-appointment-${appt.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function getGoogleCalUrl(appt: Appointment): string {
  const d = appt.date.replace(/-/g, "");
  const [h, m] = parseTime(appt.time);
  const startDT = `${d}T${h}${m}00`;
  const endH = String(parseInt(h) + 1).padStart(2, "0");
  const endDT = `${d}T${endH}${m}00`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(appt.serviceName + " at Alis' Salon")}&dates=${startDT}/${endDT}&location=${encodeURIComponent("Alis' Salon")}&details=${encodeURIComponent("Your appointment for " + appt.serviceName)}`;
}

function AppointmentsNavbar() {
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

// Simple recommendations based on service categories
function getRecommendations(appointments: Appointment[], allServices: Service[]): Service[] {
  if (appointments.length === 0 || allServices.length === 0) return allServices.slice(0, 3);

  const usedCategories = new Set(appointments.map((a) => a.serviceCategory).filter(Boolean));
  const usedNames = new Set(appointments.map((a) => a.serviceName.toLowerCase()));

  // Recommend services in same categories but not already booked
  const sameCat = allServices.filter(
    (s) => usedCategories.has(s.category) && !usedNames.has(s.name.toLowerCase())
  );

  // Also recommend popular services from other categories
  const otherCat = allServices.filter(
    (s) => !usedCategories.has(s.category) && !usedNames.has(s.name.toLowerCase())
  );

  return [...sameCat.slice(0, 2), ...otherCat.slice(0, 1)].slice(0, 3);
}

export default function PortalAppointments() {
  const { client, isAuthenticated, isLoading } = useClientAuth();
  const [, setLocation] = useLocation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { data: services } = useQuery<Service[]>({ queryKey: ["/api/services"] });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) setLocation("/client/login");
  }, [isLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (client) setAppointments(getAppointments(client.id));
  }, [client]);

  if (isLoading || !client) return null;

  const upcoming = appointments.filter((a) => a.status === "confirmed");
  const past = appointments.filter((a) => a.status === "completed" || a.status === "cancelled");
  const recommendations = getRecommendations(appointments, services || []);

  return (
    <div className="min-h-screen bg-background">
      <AppointmentsNavbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2">Your Schedule</p>
          <h1 className="font-serif text-3xl text-foreground">My Appointments</h1>
        </motion.div>

        {appointments.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-10 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-serif text-xl text-foreground mb-2">No Appointments Yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Your upcoming and past appointments will appear here once you book your first visit.
              </p>
              <Link href="/booking">
                <Button><Scissors className="w-4 h-4 mr-2" /> Book Your First Appointment</Button>
              </Link>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <div>
                <h2 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Upcoming
                </h2>
                <div className="space-y-3">
                  {upcoming.map((appt) => (
                    <Card key={appt.id} className="p-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                        <div>
                          <h3 className="font-medium text-foreground">{appt.serviceName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appt.date).toLocaleDateString("en-US", {
                              weekday: "long", month: "long", day: "numeric", year: "numeric",
                            })} at {appt.time}
                          </p>
                        </div>
                        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400">Confirmed</Badge>
                      </div>
                      {/* Calendar Sync Buttons */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <span className="text-xs text-muted-foreground mr-1">Add to Calendar:</span>
                        <a href={getGoogleCalUrl(appt)} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            <CalendarPlus className="w-3 h-3 mr-1" /> Google
                          </Button>
                        </a>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => downloadICS(appt)}>
                          <Download className="w-3 h-3 mr-1" /> Apple / Outlook
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Service History
                </h2>
                <div className="space-y-3">
                  {past.map((appt) => (
                    <Card key={appt.id} className="p-4 opacity-80">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="font-medium text-foreground">{appt.serviceName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appt.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                          </p>
                          {appt.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">Notes: {appt.notes}</p>
                          )}
                        </div>
                        <Badge className={appt.status === "completed" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}>
                          {appt.status === "completed" ? "Completed" : "Cancelled"}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10">
            <h2 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Recommended for You
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recommendations.map((svc) => (
                <Card key={svc.id} className="p-4 hover:border-primary/30 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Star className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm truncate">{svc.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{svc.description}</p>
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="secondary" className="text-[10px]">{svc.category}</Badge>
                        <span className="text-xs text-muted-foreground">{svc.duration}min</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="text-center mt-4">
              <Link href="/booking">
                <Button variant="outline" size="sm">
                  Book a Service <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
