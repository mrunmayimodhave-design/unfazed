# Unfazed — SaaS Platform for Therapists in India
> **Professional Therapist Practice Management OS**  
> *Built strictly in accordance with Unlox Major Project Web Development Specifications*

---

## 🌟 Overview
**Unfazed** is a full-stack SaaS platform designed for private-practice therapists in India to manage their entire client lifecycle end-to-end:
- **Client Acquisition**: Shareable branded practice link (e.g. `localhost:5173/dr-ananya-roy`).
- **Timezone-Aware Scheduling**: Double-booking prevention, automated buffers, and visual slot picker.
- **Client CRM & Digital Consent**: Structured intake documentation and timestamped, auditable consent records.
- **Razorpay Payments & GST Invoices**: Auto-generated 18% GST tax invoices with SAC code 999312 and multi-session package bundles.
- **Clinical Documentation Split**: Strict API-level separation between private therapist notes (SOAP / DAP) and shared client takeaways.
- **Real-Time Communication**: In-app Socket.io chat with typing indicators and read receipts.
- **Centralized Entitlement Service**: Database-driven feature gating (Starter, Pro, Enterprise) with upgrade triggers.
- **Practice Intelligence**: MongoDB aggregation pipelines computing retention, revenue trends, and no-show rates.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS v4, Lucide React, React Router v7 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas / In-Memory Dev MongoDB with Mongoose |
| **Authentication** | JWT (JSON Web Tokens) & bcryptjs |
| **Rich Text Clinical Notes** | TipTap (StarterKit) with SOAP & DAP templates |
| **Practice Analytics** | Recharts & MongoDB Aggregation Framework |
| **Real-time Messaging** | Socket.IO & Socket.IO Client |
| **Payments & Invoicing** | Razorpay Node SDK, Razorpay Checkout Modal & PDFKit |
| **Event Notifications** | Nodemailer & WhatsApp Business Event Queue Stub |

---

## 📂 Project Structure

```
unfazed/
├── PROJECT_REQUIREMENTS.md       # Primary specification document
├── README.md                     # Comprehensive setup and run guide
├── unfazed-backend/              # Express + Mongoose REST API & Socket.io server
│   ├── src/
│   │   ├── config/               # db.js (Atlas & In-Memory fallback), razorpay.js
│   │   ├── controllers/          # auth, therapist, client, scheduling, payment, note, analytics
│   │   ├── middleware/           # authMiddleware (JWT), entitlementMiddleware, errorHandler
│   │   ├── models/               # Therapist, Client, Session, SessionNote, Availability, Payment, Package, SubscriptionTierConfig, ChatMessage
│   │   ├── routes/               # Modular API routes
│   │   ├── services/             # entitlementService, notificationService, invoiceService, leadDistributionService
│   │   ├── sockets/              # chatSocket.js (Socket.io handlers)
│   │   └── utils/                # generateSlug.js
│   ├── seed.js                   # Realistic database seeder
│   ├── server.js                 # HTTP + WebSocket entry point
│   ├── .env                      # Environment configuration
│   └── package.json
│
└── unfazed-frontend/             # Vite + React + Tailwind CSS client
    ├── src/
    │   ├── api/                  # axiosInstance with Bearer token interceptor
    │   ├── components/
    │   │   ├── common/           # Navbar, Button, Modal, Loader, UpgradeModal
    │   │   ├── profile/          # Hero, About, ServiceCard, ContactModal
    │   │   ├── scheduling/       # SlotPicker, Calendar
    │   │   ├── crm/              # ClientTable, ClientDetailsModal, IntakeFormModal
    │   │   ├── notes/            # NoteEditor (TipTap), SoapTemplate
    │   │   ├── payments/         # CheckoutForm, InvoiceView
    │   │   ├── chat/             # ChatWindow, MessageBubble
    │   │   └── analytics/        # RevenueChart, StatCard
    │   ├── context/              # AuthContext (therapist session & global upgrade modal)
    │   ├── hooks/                # useEntitlement (frontend tier checks)
    │   ├── pages/
    │   │   ├── therapist/        # Dashboard, Clients, Schedule, Notes, Analytics
    │   │   ├── client/           # BookingPage (/:slug), ClientPortal (/portal/:clientId), Payment
    │   │   └── auth/             # Login, Register
    │   ├── routes/               # AppRoutes (with ProtectedRoute guard)
    │   └── App.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+ or v20+) and **npm**
- (Optional) **MongoDB Atlas** connection string (if omitted, backend automatically launches an embedded in-memory MongoDB instance for instant local development without cloud setup!).
- (Optional) **Razorpay Test Account** (if omitted, a simulated instant-checkout mode is built in).

---

### 2. Backend Setup & Run

Open a terminal in `unfazed-backend`:

```bash
cd unfazed-backend

# 1. Install dependencies
npm install

# 2. Seed database with realistic clinical data
npm run seed

# 3. Start development server (Port 5000)
npm run dev
```

> **API Server Running**: `http://localhost:5000`  
> **Health Check**: `http://localhost:5000/api/health`

---

### 3. Frontend Setup & Run

Open a separate terminal in `unfazed-frontend`:

```bash
cd unfazed-frontend

# 1. Install dependencies
npm install

# 2. Start Vite development server (Port 5173)
npm run dev
```

> **Frontend Application Running**: `http://localhost:5173`

---

## 🔑 Demo Credentials & Test Portals

Once you run `npm run seed`, the database is populated with realistic test data:

### Therapist Dashboard
- **URL**: [http://localhost:5173/login](http://localhost:5173/login)
- **Email**: `dr.ananya@unfazed.in`
- **Password**: `Password123!`
- *(A 1-click **"Auto-fill"** pill is provided right on the login screen for instant testing!)*

### Public Branded Practice Link
- **URL**: [http://localhost:5173/dr-ananya-roy](http://localhost:5173/dr-ananya-roy)
- Features: Clinical bio, RCI licensure, packaged bundles (3/6/12 sessions), and live slot booking.

### Client Portal View
- **URL**: [http://localhost:5173/portal/6ad92862fc88f424d03e0b49](http://localhost:5173/portal/6ad92862fc88f424d03e0b49)
- Features: Video session links, strictly shared clinical takeaway notes (private notes are excluded at API level), instant GST PDF invoice downloads, and live chat.

---

## 🛡️ Key Architectural Highlights

1. **Centralized Entitlement Service (`EntitlementService.js`)**:
   - Routes and controllers never inspect plan tier strings directly. All feature checks execute through `EntitlementService.canAccess(therapistId, featureKey)`.
   - Tier caps dynamically control active clients, SOAP/DAP templates, and analytics depth.
   - Upgrade modal automatically prompts the user when limits are encountered.

2. **Strict Private vs. Shared Clinical Separation**:
   - Client portal endpoints explicitly query `{ type: 'shared' }` and use serializers that prevent private clinical notes from leaking to clients.

3. **In-Memory Dev Fallback**:
   - The application starts and seeds immediately without requiring manual MongoDB installation.
   - Setting `MONGO_URI` in `unfazed-backend/.env` switches seamlessly to MongoDB Atlas.

---

## 📜 License
ISC License — Unfazed Team
