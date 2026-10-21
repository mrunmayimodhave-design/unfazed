# Unfazed — Major Project Specification
**SaaS Platform for Therapists in India**
*Based on Unlox Major Project - Web Development Specification*

---

## 1. Project Overview
Unfazed is a SaaS platform for therapists in India to run their private practice end-to-end — client acquisition, scheduling, payments, clinical notes, and business analytics — all through one branded link they share with clients (e.g., `unfazed.in/dr-sharma` or `localhost:5173/dr-sharma`).

### 1.1 Core Platform Components
| Component | Description | Users |
|---|---|---|
| **Therapist Dashboard** | Practice management hub: calendar, clients, notes, billing, analytics | Therapists |
| **Client Portal** | Branded page: intake, booking, payment, chat, shared notes | Clients |
| **Entitlement / Subscription Layer** | Tier-based feature gating, config-driven, no hardcoded values | System-wide |
| **Communication Layer** | Real-time chat + automated notifications | Both |

---

## 2. System Architecture
The system follows a standard three-tier architecture:
- **Frontend**: React (split into two experiences — Therapist Dashboard and Client Portal), styled with modern Tailwind CSS and rich interactive UX.
- **Backend**: Node.js + Express API layer, modularized routes, controllers, middleware, and services.
- **Database**: MongoDB (Mongoose) as primary datastore.
- **Core Services**:
  - Dedicated **Entitlement Service** sits alongside the API as the single source of truth for feature access.
  - **Razorpay** for payment processing & webhook callbacks.
  - **Socket.io** for real-time messaging between therapist and client.
  - **Notification Service** for domain-driven events (email via Nodemailer, WhatsApp stubbed logging/queuing).
  - **Invoice Service** for GST-compliant PDF invoice generation with PDFKit.

### 2.1 Architectural Principles to Follow
1. **Centralize entitlement checks**: No route or component should check subscription tier strings directly — everything goes through one Entitlement Service function (`canAccess(therapistId, featureKey)`).
2. **Separate private vs. shared data at the API layer**: Private clinical notes must NEVER be exposed on client-facing routes.
3. **Configuration over hardcoding**: Treat all monetary values, tier limits, and feature flags as database-driven configuration.
4. **Isolate third-party integrations**: Keep Razorpay, email/WhatsApp notifications behind cleanly defined service interfaces.

---

## 3. Folder Structure Setup
Two separate projects — backend API and frontend client — in sibling folders inside the root project directory:

```
unfazed/
|-- PROJECT_REQUIREMENTS.md
|-- README.md
|-- unfazed-backend/
|   |-- src/
|   |   |-- config/
|   |   |   |-- db.js
|   |   |   `-- razorpay.js
|   |   |-- models/
|   |   |   |-- Therapist.js
|   |   |   |-- Client.js
|   |   |   |-- Session.js
|   |   |   |-- SessionNote.js
|   |   |   |-- Availability.js
|   |   |   |-- Payment.js
|   |   |   |-- Package.js
|   |   |   |-- ClientPackage.js
|   |   |   |-- Lead.js
|   |   |   `-- SubscriptionTierConfig.js
|   |   |-- controllers/
|   |   |   |-- authController.js
|   |   |   |-- therapistController.js
|   |   |   |-- clientController.js
|   |   |   |-- schedulingController.js
|   |   |   |-- paymentController.js
|   |   |   |-- noteController.js
|   |   |   `-- analyticsController.js
|   |   |-- routes/
|   |   |   |-- authRoutes.js
|   |   |   |-- therapistRoutes.js
|   |   |   |-- clientRoutes.js
|   |   |   |-- schedulingRoutes.js
|   |   |   |-- paymentRoutes.js
|   |   |   |-- noteRoutes.js
|   |   |   `-- analyticsRoutes.js
|   |   |-- middleware/
|   |   |   |-- authMiddleware.js
|   |   |   |-- entitlementMiddleware.js
|   |   |   `-- errorHandler.js
|   |   |-- services/
|   |   |   |-- entitlementService.js
|   |   |   |-- notificationService.js
|   |   |   |-- invoiceService.js
|   |   |   `-- leadDistributionService.js
|   |   |-- sockets/
|   |   |   `-- chatSocket.js
|   |   |-- utils/
|   |   |   `-- generateSlug.js
|   |   `-- app.js
|   |-- server.js
|   |-- seed.js
|   |-- .env
|   |-- .env.example
|   |-- .gitignore
|   `-- package.json
|
|-- unfazed-frontend/
|   |-- public/
|   |-- src/
|   |   |-- api/
|   |   |   `-- axiosInstance.js
|   |   |-- components/
|   |   |   |-- common/       # Navbar, Button, Modal, Loader, UpgradeModal
|   |   |   |-- profile/      # Hero, About, ServiceCard
|   |   |   |-- scheduling/   # Calendar, SlotPicker
|   |   |   |-- crm/          # ClientTable, ClientCard
|   |   |   |-- payments/     # CheckoutForm, InvoiceView
|   |   |   |-- notes/        # NoteEditor, SoapTemplate
|   |   |   |-- chat/         # ChatWindow, MessageBubble
|   |   |   `-- analytics/    # RevenueChart, StatCard
|   |   |-- pages/
|   |   |   |-- therapist/
|   |   |   |   |-- Dashboard.jsx
|   |   |   |   |-- Clients.jsx
|   |   |   |   |-- Schedule.jsx
|   |   |   |   |-- Notes.jsx
|   |   |   |   `-- Analytics.jsx
|   |   |   |-- client/
|   |   |   |   |-- BookingPage.jsx
|   |   |   |   |-- ClientPortal.jsx
|   |   |   |   `-- Payment.jsx
|   |   |   `-- auth/
|   |   |       |-- Login.jsx
|   |   |       `-- Register.jsx
|   |   |-- context/
|   |   |   `-- AuthContext.jsx
|   |   |-- hooks/
|   |   |   `-- useEntitlement.js
|   |   |-- routes/
|   |   |   `-- AppRoutes.jsx
|   |   |-- utils/
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- .env
|   |-- .env.example
|   |-- .gitignore
|   |-- package.json
|   `-- vite.config.js
```

---

## 4. Module Roadmap Specifications

### Module 1: Foundations — Auth, Profile & the Branded Link
- Therapist schema (`email`, `password_hash`, `name`, `slug`, `bio`, `specializations[]`, `languages[]`, `hourly_rate`, `title`, `phone`, `avatar`).
- Signup/login with bcrypt password hashing and JWT authentication.
- Public profile page at `/:slug` (Hero section, about, specializations, service cards, booking CTA).
- Automatic slug generation with uniqueness validation.
- Open Graph meta tags for social shareability.

### Module 2: Scheduling System
- Availability schema (weekly schedule template: day of week, slots, buffer time, session durations 30/45/60/90 mins, timezone, overrides, blocked slots).
- Therapist UI: define weekly slots, buffer time, durations.
- Client UI: visual calendar and slot picker converted to local client timezone.
- Double-booking prevention and instant confirmation logic.
- Waitlist support (join when full, stub notification).

### Module 3: Client CRM & Intake
- Client schema referencing Therapist (`therapist_id`).
- Client list view: sortable and filterable table (name, last session, status, tags).
- Individual client profile view aggregating session history, payment history, and clinical notes.
- Intake form (demographics, presenting concern, medical/mental health history).
- Digital consent capture with timestamp and auditable audit trail.

### Module 4: Payments & Packages
- Razorpay integration (test mode) for advance payment at booking.
- Payment schema (`gateway_transaction_id`, `platform_fee`, `net_amount`, `status`, `invoice_number`).
- Session packages (3/6/12 sessions) with per-session rate and expiry tracking.
- Auto-generate GST-style invoice PDF after successful payment.
- Razorpay webhook handler for secure server-to-server payment verification.

### Module 5: Clinical Documentation
- SessionNote schema with strict `type`: `'private'` vs `'shared'`.
- Strict API serialization rule: private notes are NEVER returned on any client-facing route.
- Rich-text note editor (TipTap).
- Structured clinical templates: SOAP (Subjective, Objective, Assessment, Plan) and DAP (Data, Assessment, Plan).

### Module 6: Communication (Chat + Notifications)
- In-app real-time chat between therapist and client via Socket.io.
- Read receipts and typing indicator state.
- Event-driven NotificationService firing on domain events (`booking_confirmed`, `24h_reminder`, `post_session_followup`).
- Stubbed WhatsApp queue/logging layer + Nodemailer email integration for live notifications.

### Module 7: Subscription Tiers, Entitlements & Analytics
- Database-driven `SubscriptionTierConfig` (Starter, Pro, Enterprise) with active client caps, allowed note templates, analytics depth, and custom branding flags.
- Unified `EntitlementService.canAccess(therapistId, featureKey)`: single source of truth for all gating.
- Gated feature checks across active-client cap, SOAP/DAP templates, and advanced analytics.
- Upgrade modal UI triggered whenever a gated limit is reached.
- Analytics Dashboard: revenue trends, active client counts, no-show rates powered by MongoDB aggregation pipelines.
