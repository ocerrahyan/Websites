import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Check } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { bookAppointment } from "@/lib/appointment-storage";
import { addAdminNotification } from "@/lib/prayer-storage";
import { logVisitorAction } from "@/lib/activity-logger";
import type { Service } from "@shared/schema";
import { format } from "date-fns";

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
];

export default function Booking() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [bookingComplete, setBookingComplete] = useState(false);
  const { toast } = useToast();

  const { data: services, isLoading } = useQuery<Service[]>({ queryKey: ["/api/services"] });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const serviceName = selected?.name || "Unknown Service";
      const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

      // Try original API first (works when real backend is running)
      const res = await apiRequest("POST", "/api/appointments/book", {
        serviceId: selectedService,
        date: dateStr,
        startTime: selectedTime,
        ...formData,
      });

      // Also save to PHP backend so admin can see on any device
      await bookAppointment({
        serviceId: selectedService,
        serviceName,
        date: dateStr,
        startTime: selectedTime,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes,
      });

      // Add admin notification
      addAdminNotification({
        type: "appointment",
        title: `New booking: ${formData.firstName} ${formData.lastName}`,
        message: `${serviceName} on ${selectedDate ? format(selectedDate, "MMMM d, yyyy") : dateStr} at ${selectedTime}`,
      });

      // Log the booking action
      logVisitorAction("appointment_booked", {
        service: serviceName,
        date: dateStr,
        time: selectedTime,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
      }, "booking");

      return res.json();
    },
    onSuccess: () => {
      setBookingComplete(true);
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const selected = services?.find((s) => s.id === selectedService);

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="font-serif text-2xl text-foreground mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground mb-6">
              Your appointment for <span className="font-medium text-foreground">{selected?.name}</span> on{" "}
              <span className="font-medium text-foreground">
                {selectedDate && format(selectedDate, "MMMM d, yyyy")}
              </span>{" "}
              at <span className="font-medium text-foreground">{selectedTime}</span> has been confirmed.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              A confirmation will be sent to {formData.email}
            </p>
            <Link href="/">
              <Button className="w-full" data-testid="button-return-home">Return Home</Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-lg text-foreground">Alis'</span>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2">Book an Appointment</p>
          <h1 className="font-serif text-3xl text-foreground">Schedule Your Visit</h1>
        </motion.div>

        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${s < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="font-serif text-xl text-foreground mb-4">Choose a Service</h2>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-md" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {services?.filter(s => s.isActive && ["Shampoo & Blowdry", "Signature Haircut & Style", "Full Color Treatment"].includes(s.name)).map((service) => (
                  <Card
                    key={service.id}
                    className={`p-4 cursor-pointer hover-elevate ${
                      selectedService === service.id ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedService(service.id)}
                    data-testid={`option-service-${service.id}`}
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="font-medium text-foreground">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {service.duration} min
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            <Button
              className="w-full mt-6"
              disabled={!selectedService}
              onClick={() => setStep(2)}
              data-testid="button-next-step"
            >
              Continue
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="font-serif text-xl text-foreground mb-4">Pick a Date & Time</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="mx-auto"
                />
              </Card>
              <Card className="p-4">
                <h3 className="font-medium text-foreground mb-3">Available Times</h3>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className="text-xs"
                      data-testid={`button-time-${time.replace(/\s/g, "-")}`}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </Card>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(1)} data-testid="button-prev-step">
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(3)}
                data-testid="button-next-step"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="font-serif text-xl text-foreground mb-4">Your Details</h2>
            <Card className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">First Name</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Your first name"
                    data-testid="input-first-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Last Name</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Your last name"
                    data-testid="input-last-name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@email.com"
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Notes (optional)</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Anything we should know for your appointment?"
                  data-testid="input-notes"
                />
              </div>
            </Card>

            <Card className="p-5 mt-4">
              <h3 className="font-medium text-foreground mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Service</span>
                  <span className="text-foreground font-medium">{selected?.name}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-foreground">{selectedDate && format(selectedDate, "MMMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Time</span>
                  <span className="text-foreground">{selectedTime}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-foreground">{selected?.duration} min</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <p className="text-sm text-muted-foreground">Contact Alis' for pricing details</p>
                </div>
              </div>
            </Card>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(2)} data-testid="button-prev-step">
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!formData.firstName || !formData.lastName || !formData.email || bookMutation.isPending}
                onClick={() => bookMutation.mutate()}
                data-testid="button-confirm-booking"
              >
                {bookMutation.isPending ? "Confirming..." : "Confirm Booking"}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
