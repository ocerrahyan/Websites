# Alis' Salon - Local Setup Guide

## Prerequisites
- Node.js 20+ 
- PostgreSQL database
- npm

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/alis_salon
   SESSION_SECRET=your-secret-key-here
   ```

   Optional environment variables:
   ```
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin
   STRIPE_SECRET_KEY=sk_test_...
   TWILIO_SID=your-twilio-sid
   TWILIO_TOKEN=your-twilio-token
   TWILIO_PHONE=+1234567890
   ```

3. **Set up the database**
   ```bash
   npm run db:push
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5000`

## Admin Access
- Default username: `admin`
- Default password: `admin`
- Change via ADMIN_USERNAME and ADMIN_PASSWORD environment variables

## Deployment Notes

- The app serves both frontend and backend from a single Express server on port 5000
- For production, build the frontend first: `npx vite build client` then start the server
- The frontend is a React/Vite SPA that gets served by the Express backend
- All API routes are under `/api/`

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, PostgreSQL, Drizzle ORM
- **Auth**: Session-based with express-session
