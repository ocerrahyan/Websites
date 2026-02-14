import {
  users, clients, services, appointments, products, books, paintings, messages,
  subscribers, inspirationalMessages,
  prayerRequests, tips, reviews, waitlistEntries, favoriteServices,
  styleInspirations, chatMessages, adminNotifications, revenueRecords,
  type User, type InsertUser,
  type Client, type InsertClient,
  type Service, type InsertService,
  type Appointment, type InsertAppointment,
  type Product, type InsertProduct,
  type Book, type InsertBook,
  type Painting, type InsertPainting,
  type Message, type InsertMessage,
  type Subscriber, type InsertSubscriber,
  type InspirationalMessage, type InsertInspirationalMessage,
  type PrayerRequest, type InsertPrayerRequest,
  type Tip, type InsertTip,
  type Review, type InsertReview,
  type WaitlistEntry, type InsertWaitlistEntry,
  type FavoriteService, type InsertFavoriteService,
  type StyleInspiration, type InsertStyleInspiration,
  type ChatMessage, type InsertChatMessage,
  type AdminNotification, type InsertAdminNotification,
  type RevenueRecord, type InsertRevenueRecord,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  getClientByEmail(email: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, data: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<void>;

  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, data: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<void>;

  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointmentsByClient(clientId: string): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, data: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<void>;

  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;

  getBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: string, data: Partial<InsertBook>): Promise<Book | undefined>;
  deleteBook(id: string): Promise<void>;

  getPaintings(): Promise<Painting[]>;
  getPainting(id: string): Promise<Painting | undefined>;
  createPainting(painting: InsertPainting): Promise<Painting>;
  updatePainting(id: string, data: Partial<InsertPainting>): Promise<Painting | undefined>;
  deletePainting(id: string): Promise<void>;

  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  getSubscribers(): Promise<Subscriber[]>;
  getActiveSubscribers(): Promise<Subscriber[]>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  updateSubscriber(id: string, data: Partial<InsertSubscriber>): Promise<Subscriber | undefined>;
  deleteSubscriber(id: string): Promise<void>;

  getInspirationalMessages(): Promise<InspirationalMessage[]>;
  getInspirationalMessage(id: string): Promise<InspirationalMessage | undefined>;
  createInspirationalMessage(msg: InsertInspirationalMessage): Promise<InspirationalMessage>;
  updateInspirationalMessage(id: string, data: Partial<InsertInspirationalMessage>): Promise<InspirationalMessage | undefined>;
  deleteInspirationalMessage(id: string): Promise<void>;

  getPrayerRequests(): Promise<PrayerRequest[]>;
  createPrayerRequest(data: InsertPrayerRequest): Promise<PrayerRequest>;
  updatePrayerRequest(id: string, data: Partial<InsertPrayerRequest>): Promise<PrayerRequest | undefined>;

  getTips(): Promise<Tip[]>;
  createTip(data: InsertTip): Promise<Tip>;

  getReviews(): Promise<Review[]>;
  getApprovedReviews(): Promise<Review[]>;
  createReview(data: InsertReview): Promise<Review>;
  updateReview(id: string, data: Partial<InsertReview>): Promise<Review | undefined>;

  getWaitlistEntries(): Promise<WaitlistEntry[]>;
  createWaitlistEntry(data: InsertWaitlistEntry): Promise<WaitlistEntry>;
  updateWaitlistEntry(id: string, data: Partial<InsertWaitlistEntry>): Promise<WaitlistEntry | undefined>;
  deleteWaitlistEntry(id: string): Promise<void>;

  getFavoriteServices(sessionId: string): Promise<FavoriteService[]>;
  createFavoriteService(data: InsertFavoriteService): Promise<FavoriteService>;
  deleteFavoriteService(id: string): Promise<void>;

  getStyleInspirations(): Promise<StyleInspiration[]>;
  createStyleInspiration(data: InsertStyleInspiration): Promise<StyleInspiration>;
  updateStyleInspiration(id: string, data: Partial<InsertStyleInspiration>): Promise<StyleInspiration | undefined>;

  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  getAllChatSessions(): Promise<ChatMessage[]>;
  createChatMessage(data: InsertChatMessage): Promise<ChatMessage>;
  markChatMessagesRead(sessionId: string): Promise<void>;

  getAdminNotifications(): Promise<AdminNotification[]>;
  getUnreadNotificationCount(): Promise<number>;
  createAdminNotification(data: InsertAdminNotification): Promise<AdminNotification>;
  markNotificationRead(id: string): Promise<AdminNotification | undefined>;
  markAllNotificationsRead(): Promise<void>;

  getRevenueRecords(): Promise<RevenueRecord[]>;
  getRevenueByDateRange(startDate: string, endDate: string): Promise<RevenueRecord[]>;
  createRevenueRecord(data: InsertRevenueRecord): Promise<RevenueRecord>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.joinedAt));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClientByEmail(email: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.email, email));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async updateClient(id: string, data: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db.update(clients).set(data).where(eq(clients.id, id)).returning();
    return client || undefined;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async updateService(id: string, data: Partial<InsertService>): Promise<Service | undefined> {
    const [service] = await db.update(services).set(data).where(eq(services.id, id)).returning();
    return service || undefined;
  }

  async deleteService(id: string): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments).orderBy(desc(appointments.createdAt));
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async getAppointmentsByClient(clientId: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.clientId, clientId));
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.date, date));
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async updateAppointment(id: string, data: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [appointment] = await db.update(appointments).set(data).where(eq(appointments.id, id)).returning();
    return appointment || undefined;
  }

  async deleteAppointment(id: string): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getBooks(): Promise<Book[]> {
    return await db.select().from(books).orderBy(books.sortOrder);
  }

  async getBook(id: string): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book || undefined;
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const [book] = await db.insert(books).values(insertBook).returning();
    return book;
  }

  async updateBook(id: string, data: Partial<InsertBook>): Promise<Book | undefined> {
    const [book] = await db.update(books).set(data).where(eq(books.id, id)).returning();
    return book || undefined;
  }

  async deleteBook(id: string): Promise<void> {
    await db.delete(books).where(eq(books.id, id));
  }

  async getPaintings(): Promise<Painting[]> {
    return await db.select().from(paintings).orderBy(paintings.sortOrder);
  }

  async getPainting(id: string): Promise<Painting | undefined> {
    const [painting] = await db.select().from(paintings).where(eq(paintings.id, id));
    return painting || undefined;
  }

  async createPainting(insertPainting: InsertPainting): Promise<Painting> {
    const [painting] = await db.insert(paintings).values(insertPainting).returning();
    return painting;
  }

  async updatePainting(id: string, data: Partial<InsertPainting>): Promise<Painting | undefined> {
    const [painting] = await db.update(paintings).set(data).where(eq(paintings.id, id)).returning();
    return painting || undefined;
  }

  async deletePainting(id: string): Promise<void> {
    await db.delete(paintings).where(eq(paintings.id, id));
  }

  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.sentAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getSubscribers(): Promise<Subscriber[]> {
    return await db.select().from(subscribers).orderBy(desc(subscribers.subscribedAt));
  }

  async getActiveSubscribers(): Promise<Subscriber[]> {
    return await db.select().from(subscribers).where(eq(subscribers.isActive, true));
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [sub] = await db.select().from(subscribers).where(eq(subscribers.email, email));
    return sub || undefined;
  }

  async createSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    const [sub] = await db.insert(subscribers).values(insertSubscriber).returning();
    return sub;
  }

  async updateSubscriber(id: string, data: Partial<InsertSubscriber>): Promise<Subscriber | undefined> {
    const [sub] = await db.update(subscribers).set(data).where(eq(subscribers.id, id)).returning();
    return sub || undefined;
  }

  async deleteSubscriber(id: string): Promise<void> {
    await db.delete(subscribers).where(eq(subscribers.id, id));
  }

  async getInspirationalMessages(): Promise<InspirationalMessage[]> {
    return await db.select().from(inspirationalMessages).orderBy(desc(inspirationalMessages.createdAt));
  }

  async getInspirationalMessage(id: string): Promise<InspirationalMessage | undefined> {
    const [msg] = await db.select().from(inspirationalMessages).where(eq(inspirationalMessages.id, id));
    return msg || undefined;
  }

  async createInspirationalMessage(insertMsg: InsertInspirationalMessage): Promise<InspirationalMessage> {
    const [msg] = await db.insert(inspirationalMessages).values(insertMsg).returning();
    return msg;
  }

  async updateInspirationalMessage(id: string, data: Partial<InsertInspirationalMessage>): Promise<InspirationalMessage | undefined> {
    const [msg] = await db.update(inspirationalMessages).set(data).where(eq(inspirationalMessages.id, id)).returning();
    return msg || undefined;
  }

  async deleteInspirationalMessage(id: string): Promise<void> {
    await db.delete(inspirationalMessages).where(eq(inspirationalMessages.id, id));
  }

  async getPrayerRequests(): Promise<PrayerRequest[]> {
    return await db.select().from(prayerRequests).orderBy(desc(prayerRequests.createdAt));
  }

  async createPrayerRequest(data: InsertPrayerRequest): Promise<PrayerRequest> {
    const [result] = await db.insert(prayerRequests).values(data).returning();
    return result;
  }

  async updatePrayerRequest(id: string, data: Partial<InsertPrayerRequest>): Promise<PrayerRequest | undefined> {
    const [result] = await db.update(prayerRequests).set(data).where(eq(prayerRequests.id, id)).returning();
    return result || undefined;
  }

  async getTips(): Promise<Tip[]> {
    return await db.select().from(tips).orderBy(desc(tips.createdAt));
  }

  async createTip(data: InsertTip): Promise<Tip> {
    const [result] = await db.insert(tips).values(data).returning();
    return result;
  }

  async getReviews(): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async getApprovedReviews(): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.isApproved, true)).orderBy(desc(reviews.createdAt));
  }

  async createReview(data: InsertReview): Promise<Review> {
    const [result] = await db.insert(reviews).values(data).returning();
    return result;
  }

  async updateReview(id: string, data: Partial<InsertReview>): Promise<Review | undefined> {
    const [result] = await db.update(reviews).set(data).where(eq(reviews.id, id)).returning();
    return result || undefined;
  }

  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    return await db.select().from(waitlistEntries).orderBy(desc(waitlistEntries.createdAt));
  }

  async createWaitlistEntry(data: InsertWaitlistEntry): Promise<WaitlistEntry> {
    const [result] = await db.insert(waitlistEntries).values(data).returning();
    return result;
  }

  async updateWaitlistEntry(id: string, data: Partial<InsertWaitlistEntry>): Promise<WaitlistEntry | undefined> {
    const [result] = await db.update(waitlistEntries).set(data).where(eq(waitlistEntries.id, id)).returning();
    return result || undefined;
  }

  async deleteWaitlistEntry(id: string): Promise<void> {
    await db.delete(waitlistEntries).where(eq(waitlistEntries.id, id));
  }

  async getFavoriteServices(sessionId: string): Promise<FavoriteService[]> {
    return await db.select().from(favoriteServices).where(eq(favoriteServices.sessionId, sessionId)).orderBy(desc(favoriteServices.createdAt));
  }

  async createFavoriteService(data: InsertFavoriteService): Promise<FavoriteService> {
    const [result] = await db.insert(favoriteServices).values(data).returning();
    return result;
  }

  async deleteFavoriteService(id: string): Promise<void> {
    await db.delete(favoriteServices).where(eq(favoriteServices.id, id));
  }

  async getStyleInspirations(): Promise<StyleInspiration[]> {
    return await db.select().from(styleInspirations).orderBy(desc(styleInspirations.createdAt));
  }

  async createStyleInspiration(data: InsertStyleInspiration): Promise<StyleInspiration> {
    const [result] = await db.insert(styleInspirations).values(data).returning();
    return result;
  }

  async updateStyleInspiration(id: string, data: Partial<InsertStyleInspiration>): Promise<StyleInspiration | undefined> {
    const [result] = await db.update(styleInspirations).set(data).where(eq(styleInspirations.id, id)).returning();
    return result || undefined;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(chatMessages.createdAt);
  }

  async getAllChatSessions(): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).orderBy(desc(chatMessages.createdAt));
  }

  async createChatMessage(data: InsertChatMessage): Promise<ChatMessage> {
    const [result] = await db.insert(chatMessages).values(data).returning();
    return result;
  }

  async markChatMessagesRead(sessionId: string): Promise<void> {
    await db.update(chatMessages).set({ isRead: true }).where(eq(chatMessages.sessionId, sessionId));
  }

  async getAdminNotifications(): Promise<AdminNotification[]> {
    return await db.select().from(adminNotifications).orderBy(desc(adminNotifications.createdAt)).limit(50);
  }

  async getUnreadNotificationCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(adminNotifications).where(eq(adminNotifications.isRead, false));
    return Number(result[0]?.count || 0);
  }

  async createAdminNotification(data: InsertAdminNotification): Promise<AdminNotification> {
    const [result] = await db.insert(adminNotifications).values(data).returning();
    return result;
  }

  async markNotificationRead(id: string): Promise<AdminNotification | undefined> {
    const [result] = await db.update(adminNotifications).set({ isRead: true }).where(eq(adminNotifications.id, id)).returning();
    return result || undefined;
  }

  async markAllNotificationsRead(): Promise<void> {
    await db.update(adminNotifications).set({ isRead: true }).where(eq(adminNotifications.isRead, false));
  }

  async getRevenueRecords(): Promise<RevenueRecord[]> {
    return await db.select().from(revenueRecords).orderBy(desc(revenueRecords.createdAt));
  }

  async getRevenueByDateRange(startDate: string, endDate: string): Promise<RevenueRecord[]> {
    return await db.select().from(revenueRecords).where(and(gte(revenueRecords.date, startDate), lte(revenueRecords.date, endDate))).orderBy(desc(revenueRecords.date));
  }

  async createRevenueRecord(data: InsertRevenueRecord): Promise<RevenueRecord> {
    const [result] = await db.insert(revenueRecords).values(data).returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
