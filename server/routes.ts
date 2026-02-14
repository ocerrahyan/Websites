import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { createCalendarEvent, deleteCalendarEvent, getCalendarEvents } from "./googleCalendar";
import { insertClientSchema, insertServiceSchema, insertAppointmentSchema, insertProductSchema, insertBookSchema, insertPaintingSchema, insertMessageSchema, insertSubscriberSchema, insertInspirationalMessageSchema, insertPrayerRequestSchema, insertTipSchema, insertReviewSchema, insertWaitlistEntrySchema, insertFavoriteServiceSchema, insertStyleInspirationSchema, insertChatMessageSchema, insertRevenueRecordSchema } from "@shared/schema";
import OpenAI from "openai";
import Stripe from "stripe";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";
if (!process.env.ADMIN_PASSWORD) {
  console.warn("Warning: ADMIN_PASSWORD not set. Using default credentials. Set ADMIN_USERNAME and ADMIN_PASSWORD environment variables for production.");
}

function requireAdmin(req: any, res: any, next: any) {
  if (req.session?.isAdmin) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

async function createNotification(type: string, title: string, message?: string, referenceId?: string) {
  await storage.createAdminNotification({ type, title, message: message || null, referenceId: referenceId || null, isRead: false });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "alis-salon-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
      },
    })
  );

  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      (req.session as any).isAdmin = true;
      return res.json({ authenticated: true });
    }
    return res.status(401).json({ message: "Invalid username or password" });
  });

  app.get("/api/admin/session", (req, res) => {
    res.json({ authenticated: !!(req.session as any)?.isAdmin });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/clients", requireAdmin, async (req, res) => {
    const clients = await storage.getClients();
    res.json(clients);
  });

  // Upcoming birthdays (must be before :id route)
  app.get("/api/clients/upcoming-birthdays", requireAdmin, async (req, res) => {
    try {
      const allClients = await storage.getClients();
      const today = new Date();
      const upcoming = allClients
        .filter((c) => c.birthdate)
        .map((c) => {
          const [year, month, day] = c.birthdate!.split("-").map(Number);
          const birthday = new Date(today.getFullYear(), month - 1, day);
          if (birthday < today) birthday.setFullYear(today.getFullYear() + 1);
          const daysUntil = Math.ceil((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return { ...c, daysUntil };
        })
        .filter((c) => c.daysUntil <= 30)
        .sort((a, b) => a.daysUntil - b.daysUntil);
      res.json(upcoming);
    } catch (error: any) {
      res.json([]);
    }
  });

  app.get("/api/clients/:id", requireAdmin, async (req, res) => {
    const client = await storage.getClient(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  });

  app.post("/api/clients", requireAdmin, async (req, res) => {
    try {
      const data = insertClientSchema.parse(req.body);
      const client = await storage.createClient(data);
      res.json(client);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/clients/:id", requireAdmin, async (req, res) => {
    try {
      const client = await storage.updateClient(req.params.id, req.body);
      if (!client) return res.status(404).json({ message: "Client not found" });
      res.json(client);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/clients/:id", requireAdmin, async (req, res) => {
    await storage.deleteClient(req.params.id);
    res.json({ success: true });
  });

  // Client appointment history
  app.get("/api/clients/:id/appointments", requireAdmin, async (req, res) => {
    const appts = await storage.getAppointmentsByClient(req.params.id);
    res.json(appts);
  });

  // Generate birthday message via AI
  app.post("/api/ai/generate-birthday", requireAdmin, async (req, res) => {
    try {
      if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI integration is not configured." });
      }
      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });
      const { clientName } = req.body;
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are Alis Cerrahyan, a warm and caring salon owner with 45+ years of experience. Write a heartfelt, personal birthday message for a valued client. Keep it to 2-3 sentences. Be warm but professional." },
          { role: "user", content: `Write a birthday message for ${clientName || "a valued client"}.` },
        ],
        max_tokens: 200,
        temperature: 0.8,
      });
      res.json({ content: response.choices[0]?.message?.content || "Happy Birthday from Alis'!" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate follow-up aftercare message via AI
  app.post("/api/ai/generate-followup", requireAdmin, async (req, res) => {
    try {
      if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI integration is not configured." });
      }
      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });
      const { clientName, serviceName } = req.body;
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are Alis Cerrahyan, a legendary hairstylist with 45+ years of experience. Write a warm follow-up message with specific aftercare tips based on the service performed. Keep it to 3-4 sentences. Be caring and professional." },
          { role: "user", content: `Write a follow-up aftercare message for ${clientName || "a client"} who just had a ${serviceName || "salon service"}.` },
        ],
        max_tokens: 250,
        temperature: 0.7,
      });
      res.json({ content: response.choices[0]?.message?.content || "Thank you for visiting Alis'!" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reminder queue - appointments needing reminders (upcoming, not yet reminded)
  app.get("/api/reminders/pending", requireAdmin, async (req, res) => {
    try {
      const allAppts = await storage.getAppointments();
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 2);
      const todayStr = today.toISOString().split("T")[0];
      const tomorrowStr = tomorrow.toISOString().split("T")[0];
      const pending = allAppts.filter((a) => {
        const isPending = a.status === "pending" || a.status === "confirmed";
        const isUpcoming = a.date >= todayStr && a.date <= tomorrowStr;
        const notReminded = !a.reminderSent;
        return isPending && isUpcoming && notReminded;
      });
      res.json(pending);
    } catch (error: any) {
      res.json([]);
    }
  });

  // Mark reminder as sent
  app.post("/api/appointments/:id/remind", requireAdmin, async (req, res) => {
    try {
      const appt = await storage.updateAppointment(req.params.id, { reminderSent: true } as any);
      if (!appt) return res.status(404).json({ message: "Appointment not found" });
      res.json(appt);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Follow-up queue - completed appointments without follow-up
  app.get("/api/followups/pending", requireAdmin, async (req, res) => {
    try {
      const allAppts = await storage.getAppointments();
      const pending = allAppts.filter((a) => a.status === "completed" && !a.followUpSent);
      res.json(pending);
    } catch (error: any) {
      res.json([]);
    }
  });

  // Mark follow-up as sent
  app.post("/api/appointments/:id/followup", requireAdmin, async (req, res) => {
    try {
      const appt = await storage.updateAppointment(req.params.id, { followUpSent: true } as any);
      if (!appt) return res.status(404).json({ message: "Appointment not found" });
      res.json(appt);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/services", async (req, res) => {
    const services = await storage.getServices();
    res.json(services);
  });

  app.post("/api/services", requireAdmin, async (req, res) => {
    try {
      const data = insertServiceSchema.parse(req.body);
      const service = await storage.createService(data);
      res.json(service);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/services/:id", requireAdmin, async (req, res) => {
    try {
      const service = await storage.updateService(req.params.id, req.body);
      if (!service) return res.status(404).json({ message: "Service not found" });
      res.json(service);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/services/:id", requireAdmin, async (req, res) => {
    await storage.deleteService(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/appointments", requireAdmin, async (req, res) => {
    const appointments = await storage.getAppointments();
    res.json(appointments);
  });

  app.post("/api/appointments/book", async (req, res) => {
    try {
      const { firstName, lastName, email, phone, serviceId, date, startTime, notes } = req.body;

      if (!firstName || !lastName || !email || !serviceId || !date || !startTime) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      let client = await storage.getClientByEmail(email);
      if (!client) {
        client = await storage.createClient({
          firstName,
          lastName,
          email,
          phone: phone || null,
          membershipTier: "bronze",
          notes: null,
          allergies: null,
          preferredServices: null,
          birthdate: null,
          avatarUrl: null,
          stripeCustomerId: null,
        });
      }

      const service = await storage.getService(serviceId);
      if (!service) return res.status(404).json({ message: "Service not found" });

      const durationMinutes = service.duration;
      const endTime = calculateEndTime(startTime, durationMinutes);

      let googleCalendarEventId = null;
      try {
        googleCalendarEventId = await createCalendarEvent({
          summary: `${firstName} ${lastName} - ${service.name}`,
          description: `Client: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nService: ${service.name}\nNotes: ${notes || 'None'}`,
          startTime,
          endTime,
          date,
        });
      } catch (calError) {
        console.log('Google Calendar sync skipped:', calError instanceof Error ? calError.message : 'unavailable');
      }

      const appointment = await storage.createAppointment({
        clientId: client.id,
        serviceId,
        date,
        startTime,
        endTime,
        status: "pending",
        notes: notes || null,
        googleCalendarEventId,
      });

      await createNotification("new_booking", "New Booking", `${firstName} ${lastName} booked ${service.name} on ${date} at ${startTime}`, appointment.id);

      res.json(appointment);
    } catch (error: any) {
      console.error("Booking error:", error);
      res.status(500).json({ message: error.message || "Failed to create booking" });
    }
  });

  app.patch("/api/appointments/:id", requireAdmin, async (req, res) => {
    try {
      const appointment = await storage.updateAppointment(req.params.id, req.body);
      if (!appointment) return res.status(404).json({ message: "Appointment not found" });

      if (req.body.status === "cancelled" && appointment.googleCalendarEventId) {
        try {
          await deleteCalendarEvent(appointment.googleCalendarEventId);
        } catch (err) {
          console.log('Google Calendar delete skipped');
        }
      }

      res.json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/appointments/:id", requireAdmin, async (req, res) => {
    const appointment = await storage.getAppointment(req.params.id);
    if (appointment?.googleCalendarEventId) {
      try {
        await deleteCalendarEvent(appointment.googleCalendarEventId);
      } catch (err) {
        console.log('Google Calendar delete skipped');
      }
    }
    await storage.deleteAppointment(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    await storage.deleteProduct(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/books", async (req, res) => {
    const books = await storage.getBooks();
    res.json(books);
  });

  app.post("/api/books", requireAdmin, async (req, res) => {
    try {
      const data = insertBookSchema.parse(req.body);
      const book = await storage.createBook(data);
      res.json(book);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/books/:id", requireAdmin, async (req, res) => {
    try {
      const book = await storage.updateBook(req.params.id, req.body);
      if (!book) return res.status(404).json({ message: "Book not found" });
      res.json(book);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/books/:id", requireAdmin, async (req, res) => {
    await storage.deleteBook(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/paintings", async (req, res) => {
    const paintings = await storage.getPaintings();
    res.json(paintings);
  });

  app.post("/api/paintings", requireAdmin, async (req, res) => {
    try {
      const data = insertPaintingSchema.parse(req.body);
      const painting = await storage.createPainting(data);
      res.json(painting);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/paintings/:id", requireAdmin, async (req, res) => {
    try {
      const painting = await storage.updatePainting(req.params.id, req.body);
      if (!painting) return res.status(404).json({ message: "Painting not found" });
      res.json(painting);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/paintings/:id", requireAdmin, async (req, res) => {
    await storage.deletePainting(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/messages", requireAdmin, async (req, res) => {
    const msgs = await storage.getMessages();
    res.json(msgs);
  });

  app.post("/api/messages", requireAdmin, async (req, res) => {
    try {
      const data = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(data);
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/membership/signup", async (req, res) => {
    try {
      const { firstName, lastName, email, phone, tier } = req.body;

      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      let client = await storage.getClientByEmail(email);
      if (client) {
        client = await storage.updateClient(client.id, { membershipTier: tier || "bronze" });
        await createNotification("new_member", "Membership Update", `${firstName} ${lastName} updated to ${tier || "bronze"} membership`, client!.id);
        return res.json(client);
      }

      client = await storage.createClient({
        firstName,
        lastName,
        email,
        phone: phone || null,
        membershipTier: tier || "bronze",
        notes: null,
        allergies: null,
        preferredServices: null,
        birthdate: null,
        avatarUrl: null,
        stripeCustomerId: null,
      });

      await createNotification("new_member", "New Member Signup", `${firstName} ${lastName} signed up for ${tier || "bronze"} membership`, client.id);

      res.json(client);
    } catch (error: any) {
      console.error("Membership signup error:", error);
      res.status(500).json({ message: error.message || "Signup failed" });
    }
  });

  app.get("/api/calendar/events", requireAdmin, async (req, res) => {
    try {
      const { timeMin, timeMax } = req.query;
      const events = await getCalendarEvents(
        timeMin as string || new Date().toISOString(),
        timeMax as string || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      );
      res.json(events);
    } catch (error: any) {
      res.json([]);
    }
  });

  // Subscriber routes
  app.get("/api/subscribers", requireAdmin, async (req, res) => {
    const subs = await storage.getSubscribers();
    res.json(subs);
  });

  app.post("/api/subscribers", async (req, res) => {
    try {
      const data = insertSubscriberSchema.parse(req.body);
      const existing = await storage.getSubscriberByEmail(data.email);
      if (existing) {
        const updated = await storage.updateSubscriber(existing.id, { ...data, isActive: true });
        return res.json(updated);
      }
      const sub = await storage.createSubscriber(data);
      res.json(sub);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/subscribers/:id", requireAdmin, async (req, res) => {
    try {
      const { isActive, frequency, channel } = req.body;
      const allowed: Record<string, any> = {};
      if (typeof isActive === "boolean") allowed.isActive = isActive;
      if (frequency && ["daily", "weekly"].includes(frequency)) allowed.frequency = frequency;
      if (channel && ["email", "sms", "both"].includes(channel)) allowed.channel = channel;
      const sub = await storage.updateSubscriber(req.params.id, allowed);
      if (!sub) return res.status(404).json({ message: "Subscriber not found" });
      res.json(sub);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/subscribers/:id", requireAdmin, async (req, res) => {
    await storage.deleteSubscriber(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/subscribers/unsubscribe", async (req, res) => {
    try {
      const { email, subscriberId } = req.body;
      if (!email || !subscriberId) {
        return res.status(400).json({ message: "Email and subscriber ID are required" });
      }
      const sub = await storage.getSubscriberByEmail(email);
      if (!sub || sub.id !== subscriberId) {
        return res.status(404).json({ message: "Subscriber not found" });
      }
      await storage.updateSubscriber(sub.id, { isActive: false });
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Inspirational Messages routes
  app.get("/api/inspirational-messages", requireAdmin, async (req, res) => {
    const msgs = await storage.getInspirationalMessages();
    res.json(msgs);
  });

  app.post("/api/inspirational-messages", requireAdmin, async (req, res) => {
    try {
      const data = insertInspirationalMessageSchema.parse(req.body);
      const msg = await storage.createInspirationalMessage(data);
      res.json(msg);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/inspirational-messages/:id", requireAdmin, async (req, res) => {
    try {
      const msg = await storage.updateInspirationalMessage(req.params.id, req.body);
      if (!msg) return res.status(404).json({ message: "Message not found" });
      res.json(msg);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/inspirational-messages/:id", requireAdmin, async (req, res) => {
    await storage.deleteInspirationalMessage(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/inspirational-messages/:id/send", requireAdmin, async (req, res) => {
    try {
      const msg = await storage.getInspirationalMessage(req.params.id);
      if (!msg) return res.status(404).json({ message: "Message not found" });
      const activeSubs = await storage.getActiveSubscribers();
      await storage.updateInspirationalMessage(req.params.id, { status: "sent", sentAt: new Date() } as any);
      res.json({ success: true, recipientCount: activeSubs.length });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI Content Generation
  app.post("/api/ai/generate-message", requireAdmin, async (req, res) => {
    try {
      if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI integration is not configured. Please set up OpenAI integration." });
      }

      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const { topic, type, customPrompt } = req.body;

      let systemPrompt = `You are Alis Cerrahyan, a legendary hairstylist and author with over 45 years of experience in the beauty industry. You are known for your wisdom, warmth, and ability to inspire others. You write inspirational messages for your salon subscribers.`;

      let userPrompt = "";

      if (type === "gospel" || type === "sermon") {
        systemPrompt += ` You also draw from spiritual wisdom and gospel teachings to uplift and encourage people.`;
        userPrompt = `Write an inspiring ${type === "gospel" ? "gospel-themed" : "sermon-style"} message${topic ? ` about "${topic}"` : ""}. Include a relevant scripture or spiritual insight. Keep it warm, personal, and about 2-3 paragraphs. Make it feel like it comes from someone who deeply cares about their community.`;
      } else if (type === "book-inspired") {
        systemPrompt += ` You are also the author of "Behind the Chair: A Hairdresser's Life", "The Golden Scissors", "Beauty Beyond Borders", and "Wisdom in the Mirror".`;
        userPrompt = `Write an inspirational message inspired by themes from your books${topic ? `, focusing on "${topic}"` : ""}. Draw from your 45+ years of experience in the beauty industry. Keep it warm and personal, about 2-3 paragraphs.`;
      } else {
        userPrompt = customPrompt || `Write a short, warm inspirational message${topic ? ` about "${topic}"` : ""} for salon clients. Keep it personal and uplifting, about 2-3 paragraphs. Include beauty or self-care wisdom.`;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.8,
      });

      const content = response.choices[0]?.message?.content || "Unable to generate message.";

      let suggestedSubject = "";
      if (type === "gospel" || type === "sermon") {
        suggestedSubject = topic ? `${type === "gospel" ? "Gospel" : "Sermon"}: ${topic}` : `${type === "gospel" ? "Gospel Message" : "Sunday Sermon"} from Alis'`;
      } else if (type === "book-inspired") {
        suggestedSubject = topic ? `From My Books: ${topic}` : "Wisdom from Behind the Chair";
      } else {
        suggestedSubject = topic ? `Inspiration: ${topic}` : "A Message from Alis'";
      }

      res.json({ content, subject: suggestedSubject });
    } catch (error: any) {
      console.error("AI generation error:", error);
      res.status(500).json({ message: error.message || "Failed to generate message" });
    }
  });

  // Prayer Requests
  app.post("/api/prayer-requests", async (req, res) => {
    try {
      const data = insertPrayerRequestSchema.parse(req.body);
      const pr = await storage.createPrayerRequest(data);
      await createNotification("prayer_request", "New Prayer Request", `Prayer request from ${data.name}`, pr.id);
      res.json(pr);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/prayer-requests", requireAdmin, async (req, res) => {
    const prs = await storage.getPrayerRequests();
    res.json(prs);
  });

  app.patch("/api/prayer-requests/:id", requireAdmin, async (req, res) => {
    try {
      const pr = await storage.updatePrayerRequest(req.params.id, req.body);
      if (!pr) return res.status(404).json({ message: "Prayer request not found" });
      res.json(pr);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Tips
  app.post("/api/tips/create-payment-intent", async (req, res) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(503).json({ message: "Stripe is not configured" });
      }
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100),
        currency: "usd",
        metadata: { type: "tip" },
      });
      res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/tips", async (req, res) => {
    try {
      const data = insertTipSchema.parse(req.body);
      const tip = await storage.createTip(data);
      await createNotification("tip", "New Tip Received", `${data.clientName} sent a $${data.amount} tip via ${data.method}`, tip.id);
      const today = new Date().toISOString().split("T")[0];
      await storage.createRevenueRecord({ type: "tip", description: `Tip from ${data.clientName}`, amount: data.amount, date: today, referenceId: tip.id });
      res.json(tip);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/tips", requireAdmin, async (req, res) => {
    const allTips = await storage.getTips();
    res.json(allTips);
  });

  // Reviews (all route must come before :id)
  app.post("/api/reviews", async (req, res) => {
    try {
      const data = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(data);
      await createNotification("review", "New Review Submitted", `${data.clientName} left a ${data.rating}-star review`, review.id);
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/reviews/all", requireAdmin, async (req, res) => {
    const allReviews = await storage.getReviews();
    res.json(allReviews);
  });

  app.get("/api/reviews", async (req, res) => {
    const approved = await storage.getApprovedReviews();
    res.json(approved);
  });

  app.patch("/api/reviews/:id", requireAdmin, async (req, res) => {
    try {
      const review = await storage.updateReview(req.params.id, req.body);
      if (!review) return res.status(404).json({ message: "Review not found" });
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Waitlist
  app.post("/api/waitlist", async (req, res) => {
    try {
      const data = insertWaitlistEntrySchema.parse(req.body);
      const entry = await storage.createWaitlistEntry(data);
      await createNotification("waitlist", "New Waitlist Entry", `${data.clientName} joined the waitlist`, entry.id);
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/waitlist", requireAdmin, async (req, res) => {
    const entries = await storage.getWaitlistEntries();
    res.json(entries);
  });

  app.patch("/api/waitlist/:id", requireAdmin, async (req, res) => {
    try {
      const entry = await storage.updateWaitlistEntry(req.params.id, req.body);
      if (!entry) return res.status(404).json({ message: "Waitlist entry not found" });
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/waitlist/:id", requireAdmin, async (req, res) => {
    await storage.deleteWaitlistEntry(req.params.id);
    res.json({ success: true });
  });

  // Favorite Services
  app.get("/api/favorites/:sessionId", async (req, res) => {
    const favs = await storage.getFavoriteServices(req.params.sessionId);
    res.json(favs);
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const data = insertFavoriteServiceSchema.parse(req.body);
      const fav = await storage.createFavoriteService(data);
      res.json(fav);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/favorites/:id", async (req, res) => {
    await storage.deleteFavoriteService(req.params.id);
    res.json({ success: true });
  });

  // Style Inspirations
  app.post("/api/style-inspirations", async (req, res) => {
    try {
      const data = insertStyleInspirationSchema.parse(req.body);
      const insp = await storage.createStyleInspiration(data);
      await createNotification("inspiration", "New Style Inspiration", `${data.clientName} submitted a style inspiration`, insp.id);
      res.json(insp);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/style-inspirations", requireAdmin, async (req, res) => {
    const insps = await storage.getStyleInspirations();
    res.json(insps);
  });

  app.patch("/api/style-inspirations/:id", requireAdmin, async (req, res) => {
    try {
      const insp = await storage.updateStyleInspiration(req.params.id, req.body);
      if (!insp) return res.status(404).json({ message: "Style inspiration not found" });
      res.json(insp);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Chat (sessions/all must come before :sessionId)
  app.get("/api/chat/sessions/all", requireAdmin, async (req, res) => {
    const allMessages = await storage.getAllChatSessions();
    const sessions: Record<string, any> = {};
    for (const msg of allMessages) {
      if (!sessions[msg.sessionId]) {
        sessions[msg.sessionId] = { sessionId: msg.sessionId, messages: [], lastMessage: msg, unreadCount: 0 };
      }
      sessions[msg.sessionId].messages.push(msg);
      if (!msg.isRead && msg.senderType === "client") {
        sessions[msg.sessionId].unreadCount++;
      }
    }
    res.json(Object.values(sessions));
  });

  app.get("/api/chat/:sessionId", async (req, res) => {
    const msgs = await storage.getChatMessages(req.params.sessionId);
    res.json(msgs);
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const data = insertChatMessageSchema.parse(req.body);
      const msg = await storage.createChatMessage(data);
      if (data.senderType === "client") {
        await createNotification("chat", "New Chat Message", `${data.senderName} sent a message`, msg.sessionId);
      }
      res.json(msg);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/chat/:sessionId/read", requireAdmin, async (req, res) => {
    await storage.markChatMessagesRead(req.params.sessionId);
    res.json({ success: true });
  });

  // Notifications
  app.get("/api/notifications/unread-count", requireAdmin, async (req, res) => {
    const count = await storage.getUnreadNotificationCount();
    res.json({ count });
  });

  app.get("/api/notifications", requireAdmin, async (req, res) => {
    const notifs = await storage.getAdminNotifications();
    res.json(notifs);
  });

  app.patch("/api/notifications/:id/read", requireAdmin, async (req, res) => {
    const notif = await storage.markNotificationRead(req.params.id);
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    res.json(notif);
  });

  app.post("/api/notifications/mark-all-read", requireAdmin, async (req, res) => {
    await storage.markAllNotificationsRead();
    res.json({ success: true });
  });

  // Revenue
  app.get("/api/revenue/summary", requireAdmin, async (req, res) => {
    try {
      const records = await storage.getRevenueRecords();
      const summary: Record<string, number> = {};
      let total = 0;
      for (const r of records) {
        const amt = parseFloat(r.amount);
        summary[r.type] = (summary[r.type] || 0) + amt;
        total += amt;
      }
      res.json({ byType: summary, total });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/revenue", requireAdmin, async (req, res) => {
    const { startDate, endDate } = req.query;
    if (startDate && endDate) {
      const records = await storage.getRevenueByDateRange(startDate as string, endDate as string);
      return res.json(records);
    }
    const records = await storage.getRevenueRecords();
    res.json(records);
  });

  app.post("/api/revenue", requireAdmin, async (req, res) => {
    try {
      const data = insertRevenueRecordSchema.parse(req.body);
      const record = await storage.createRevenueRecord(data);
      res.json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Appointment Rescheduling
  app.post("/api/appointments/:id/reschedule", async (req, res) => {
    try {
      const { newDate, newStartTime } = req.body;
      if (!newDate || !newStartTime) {
        return res.status(400).json({ message: "newDate and newStartTime are required" });
      }
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) return res.status(404).json({ message: "Appointment not found" });

      const service = await storage.getService(appointment.serviceId);
      if (!service) return res.status(404).json({ message: "Service not found" });

      const newEndTime = calculateEndTime(newStartTime, service.duration);
      const updated = await storage.updateAppointment(req.params.id, {
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
      });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Daily Summary
  app.get("/api/daily-summary", requireAdmin, async (req, res) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const todayAppts = await storage.getAppointmentsByDate(today);
      const tomorrowAppts = await storage.getAppointmentsByDate(tomorrow);
      const completedToday = todayAppts.filter(a => a.status === "completed").length;

      const todayRevenue = await storage.getRevenueByDateRange(today, today);
      const totalRevenue = todayRevenue.reduce((sum, r) => sum + parseFloat(r.amount), 0);

      res.json({
        todayCompletedAppointments: completedToday,
        todayTotalAppointments: todayAppts.length,
        todayRevenue: totalRevenue,
        tomorrowAppointments: tomorrowAppts,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // SMS (placeholder)
  app.post("/api/sms/send", requireAdmin, async (req, res) => {
    try {
      const { to, message } = req.body;
      if (!to || !message) {
        return res.status(400).json({ message: "to and message are required" });
      }
      if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN || !process.env.TWILIO_PHONE) {
        console.log(`[SMS Placeholder] To: ${to}, Message: ${message}`);
        return res.json({ success: true, placeholder: true, message: "SMS logged (Twilio not configured)" });
      }
      console.log(`[SMS] To: ${to}, Message: ${message}`);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/appointments/:id/send-confirmation", requireAdmin, async (req, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) return res.status(404).json({ message: "Appointment not found" });

      const client = await storage.getClient(appointment.clientId);
      if (!client) return res.status(404).json({ message: "Client not found" });

      const service = await storage.getService(appointment.serviceId);
      const message = `Hi ${client.firstName}, your appointment for ${service?.name || 'your service'} on ${appointment.date} at ${appointment.startTime} is confirmed. - Alis' Salon`;

      if (!client.phone) {
        return res.status(400).json({ message: "Client has no phone number" });
      }

      if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN || !process.env.TWILIO_PHONE) {
        console.log(`[SMS Placeholder] To: ${client.phone}, Message: ${message}`);
        return res.json({ success: true, placeholder: true, message: "Confirmation SMS logged (Twilio not configured)" });
      }

      console.log(`[SMS] To: ${client.phone}, Message: ${message}`);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [timePart, modifier] = startTime.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);
  if (!minutes && minutes !== 0) minutes = 0;

  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const totalMinutes = hours * 60 + minutes + durationMinutes;
  let endHour = Math.floor(totalMinutes / 60) % 24;
  const endMinute = totalMinutes % 60;

  const endModifier = endHour >= 12 ? 'PM' : 'AM';
  if (endHour > 12) endHour -= 12;
  if (endHour === 0) endHour = 12;

  return `${endHour}:${endMinute.toString().padStart(2, '0')} ${endModifier}`;
}
