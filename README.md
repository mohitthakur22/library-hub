# StudySpace Library Hub

Full-stack library & coworking space management for a 40-cubicle study hall. Built for students with fixed or rotational seating, payment tracking, visual seat booking, and admin tools.

## Tech Stack

**Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, Framer Motion, TanStack Query, Zustand, React Router v7, React Hook Form + Zod, Recharts, Radix UI

**Backend:** Node.js, Express 5, TypeScript, Prisma, SQLite, JWT auth

## Features

- Animated dark-mode landing page with bento-style sections
- Student auth (email/password, OTP verification, Google OAuth demo, forgot password)
- Interactive 40-seat hall map (drag to explore, color-coded status)
- Seat conflict detection & admin resolution panel
- Fixed / rotational / day pass / combo plans
- Student dashboard (seat info, streak, payments, notifications)
- Admin dashboard (stats, revenue charts, student/seat/payment management)
- QR code check-in on profile
- Payment tracking (ready for Razorpay/Stripe integration via `externalId`)

## Quick Start

### 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Set up database

```bash
cd server
npx prisma db push
npm run db:seed
```

### 3. Run development servers

**Terminal 1 — API (port 3001):**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Demo Accounts

| Role    | Email                   | Password    |
|---------|-------------------------|-------------|
| Admin   | admin@libraryhub.com    | admin123    |
| Student | student@demo.com        | student123  |

### Auth troubleshooting

| Problem | Fix |
|---------|-----|
| Login/signup spins forever | Start API: `cd server && npm run dev` (must run on port 3001) |
| "Cannot connect to server" | Run both `server` and `client` dev servers |
| OTP not in Gmail | Dev uses a **test inbox** — use the code on screen or the **email preview link** on verify page |
| Google button missing | Add `VITE_GOOGLE_CLIENT_ID` to `client/.env` (see below) |

**Google Sign-In:** Copy `client/.env.example` → `client/.env`, add your [Google OAuth Client ID](https://console.cloud.google.com/apis/credentials) (Web app, origin `http://localhost:5173`).

**Real email OTP:** Configure SMTP in `server/.env` (Gmail app password example in comments there).

## Project Structure

```
library-hub/
├── client/          # React frontend
│   └── src/
│       ├── pages/       # Landing, auth, dashboard, booking, admin
│       ├── components/  # UI, SeatMap, layouts
│       ├── store/       # Zustand auth
│       └── lib/         # API client, utils
└── server/          # Express API
    ├── prisma/      # Schema & seed
    └── src/routes/  # REST endpoints
```

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | Student registration |
| `POST /api/auth/login` | Login |
| `GET /api/seats?date=` | Seat availability map |
| `POST /api/seats/book` | Book a seat |
| `GET /api/users/dashboard` | Student dashboard data |
| `GET /api/admin/stats` | Admin overview |
| `POST /api/payments/:id/pay` | Record payment |

## Environment Variables

`server/.env`:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret"
PORT=3001
CLIENT_URL=http://localhost:5173
```

## Online Payments (Future)

The `Payment` model includes `externalId` and `paymentMethod` fields. Hook your payment gateway webhook to `PATCH /api/payments/:id/status` or extend `POST /api/payments/:id/pay`.
