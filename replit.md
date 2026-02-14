# Alis' Salon

## Overview
A comprehensive web application for a salon business called "Alis'" (with apostrophe at the END). The platform provides an elegant landing page for clients and a full admin dashboard for the salon owner to manage clients, appointments, services, and products. Includes 12 client engagement features built for modern salon management.

## Current State
- Fully functional with PostgreSQL database, Google Calendar integration, admin authentication
- Database is seeded with 8 services, 6 products, 5 sample clients, 4 books by Alis Cerrahyan, and 11 original paintings
- All API endpoints are working and tested
- Books feature: 4 published books by Alis Cerrahyan with real Amazon links, cover images, and award info
- Paintings feature: 11 original oil paintings by Alis Cerrahyan, linked to external gallery at alis.webador.com/page-2, with sold/available status tracking
- Inspirational Messages feature: AI-powered content generation, subscriber management, message compose/send/history
- CRM Features: Client tags system, visit history timeline, automated birthday messages, appointment reminders, AI-powered follow-up aftercare messages
- Dashboard enhanced with birthday widget, reminder queue, follow-up queue with glass-morphism effects
- 12 new client engagement features fully implemented (see Client Engagement Features section)

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript, Vite, TanStack Query, wouter routing, shadcn/ui, Tailwind CSS, framer-motion
- **Backend**: Express.js, PostgreSQL with Drizzle ORM
- **Integrations**: Google Calendar (appointment sync), Stripe (tip payments), express-session (admin auth), OpenAI via Replit AI Integrations (inspirational message generation, birthday greetings, aftercare tips)

### Design System
- **Fonts**: Playfair Display (serif/headings), Inter (sans-serif/body)
- **Colors**: Rose/pink primary (hsl 340 82% 42%), warm neutrals
- **Dark mode**: Full dark mode support via ThemeProvider
- **Styling**: Luxury salon aesthetic with subtle animations, glass-morphism effects (bg-card/80 backdrop-blur-sm border border-border/50)

### Database Tables
- `users` - Admin users
- `clients` - Salon clients with contact info, tags, preferences
- `services` - Salon services catalog
- `appointments` - Booked appointments with Google Calendar sync
- `products` - Retail products
- `books` - Published books by Alis Cerrahyan
- `paintings` - Original oil paintings
- `messages` - Client messaging
- `subscribers` - Inspirational message subscribers
- `inspirational_messages` - AI-generated inspirational messages
- `prayer_requests` - Private prayer requests from clients
- `tips` - Client tips (Stripe card + Zelle)
- `reviews` - Client reviews with star ratings and admin approval
- `waitlist_entries` - Waitlist for fully booked time slots
- `favorite_services` - Client favorite services (localStorage session)
- `style_inspirations` - Style inspiration board submissions
- `chat_messages` - Live chat messages between clients and admin
- `admin_notifications` - Admin notification center entries
- `revenue_records` - Revenue tracking across all streams

### Key Files
- `shared/schema.ts` - Database schema (all tables above)
- `server/routes.ts` - All API endpoints (35+ routes including CRM and engagement features)
- `server/storage.ts` - Database access layer (IStorage interface + DatabaseStorage)
- `server/googleCalendar.ts` - Google Calendar sync
- `server/seed.ts` - Initial data seeding
- `client/src/App.tsx` - Frontend routing and providers
- `client/src/pages/landing.tsx` - Landing page
- `client/src/pages/booking.tsx` - Multi-step booking flow
- `client/src/pages/admin/dashboard.tsx` - Admin dashboard with CRM widgets
- `client/src/pages/admin/client-detail.tsx` - Client profile page
- `client/src/components/admin-sidebar.tsx` - Admin navigation sidebar
- `client/src/components/chat-widget.tsx` - Floating live chat widget
- `client/src/components/admin-notification-bell.tsx` - Admin notification bell with badge

### Pages
- `/` - Landing page (hero, services, products, membership, about, contact, approved reviews)
- `/services` - Services catalog with favorite heart toggles
- `/shop` - Product storefront (links to Amazon)
- `/books` - Published books by Alis Cerrahyan (links to Amazon)
- `/paintings` - Original paintings gallery by Alis Cerrahyan (links to alis.webador.com)
- `/booking` - Multi-step appointment booking
- `/membership` - Membership tier signup (Bronze/Silver/Gold/Platinum)
- `/subscribe` - Public subscriber signup page for inspirational messages
- `/prayer-request` - Private prayer request submission form
- `/tip` - Tip page with Stripe card payment and Zelle instructions
- `/reviews` - Public reviews page with star ratings and submission form
- `/waitlist` - Join waitlist form with service preferences
- `/style-board` - Style inspiration board with image URL submissions
- `/admin` - Admin dashboard (protected)
- `/admin/clients` - Client management with tag filtering
- `/admin/clients/:id` - Client profile (tags, visit history timeline, notes/preferences)
- `/admin/calendar` - Calendar view with week/day views
- `/admin/services` - Service CRUD
- `/admin/products` - Product CRUD
- `/admin/books` - Books CRUD
- `/admin/paintings` - Paintings CRUD
- `/admin/messages` - Email/SMS messaging
- `/admin/inspirational` - Inspirational messages with AI generation
- `/admin/prayer-requests` - Private prayer request inbox
- `/admin/reviews` - Review moderation (approve/reject)
- `/admin/waitlist` - Waitlist management
- `/admin/style-board` - Style inspiration submissions review
- `/admin/chat` - Live chat inbox
- `/admin/revenue` - Revenue dashboard with charts
- `/admin/daily-summary` - Daily closing summary

### Client Engagement Features
1. **Prayer Requests** - Private submission form at `/prayer-request`, admin inbox at `/admin/prayer-requests`
2. **Tipping** - Stripe card payments + Zelle instructions at `/tip`, tips recorded in database
3. **Reviews & Testimonials** - Star ratings + text reviews at `/reviews`, admin approval flow, approved reviews shown on landing page
4. **Waitlist** - Join waitlist with service preferences at `/waitlist`, admin manages at `/admin/waitlist`
5. **Favorite Services** - Heart toggle on services page, uses localStorage sessionId
6. **Style Inspiration Board** - Image URL + description submissions at `/style-board`, admin review
7. **Live Chat Widget** - Floating chat bubble on all public pages, admin inbox at `/admin/chat`, uses localStorage sessionId, auto-refresh every 5s
8. **Revenue Dashboard** - All revenue streams (services, products, books, paintings, tips, memberships) with bar charts at `/admin/revenue`
9. **Daily Closing Summary** - Today's stats + tomorrow's schedule at `/admin/daily-summary`
10. **Admin Notification Center** - Bell icon with unread count badge, auto-refresh every 30s, notifications for prayer requests, new clients, reviews, waitlist entries, chat messages, tips, style inspirations, bookings
11. **SMS Confirmations** - Backend infrastructure ready, requires TWILIO_SID, TWILIO_TOKEN, TWILIO_PHONE env vars
12. **Appointment Rescheduling** - Backend API route for self-service rescheduling

### Admin Access
- Username + password authentication via session-based auth
- Default credentials: username "admin", password "admin" (set ADMIN_USERNAME and ADMIN_PASSWORD env vars to change)
- Session managed via express-session with SESSION_SECRET

### Membership Tiers
- Bronze (free): Priority booking, birthday special, updates
- Silver ($29/mo): 10% off, consultations, early access
- Gold ($59/mo): 20% off, monthly treatment, VIP scheduling
- Platinum ($99/mo): 30% off, unlimited consultations, personal styling

## User Preferences
- Business name is "Alis'" with apostrophe at END (NOT "Ali's")
- Modern, sleek, luxurious salon aesthetic
- Fully responsive design
- SMS/email via manual API keys (not Twilio/SendGrid connectors)
- Emphasize 45+ years of experience
