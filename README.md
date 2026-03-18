<p align="center">
  <img src="public/assets/images/logo.png" alt="IRWA Logo" width="200"/>
</p>

<h1 align="center">🌟 IRWA - Charity Crowdfunding Platform</h1>

<p align="center">
  <strong>Empower Change, One Donation at a Time</strong>
</p>

<p align="center">
  <a href="#about-the-project">About</a> •
  <a href="#features">Features</a> •
  <a href="#backend-architecture">Backend Architecture</a> •
  <a href="#recent-updates">Recent Updates</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Express-5.x-green?style=for-the-badge&logo=express" alt="Express"/>
  <img src="https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Stripe-Payments-purple?style=for-the-badge&logo=stripe" alt="Stripe"/>
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase"/>
</p>

---

## 📖 About The Project

**IRWA** (formerly ChariFund) is a modern, fully-featured, full-stack charity crowdfunding platform that connects donors with meaningful causes. Built with Next.js 15, Supabase, and Node/Express, it provides a seamless and secure experience for both campaign creators and generous donors worldwide.

Whether you're raising funds for education, healthcare, environmental clauses, or community projects, IRWA makes it easy to broadcast impactful campaigns and securely process donations. The platform natively hooks into **Stripe Checkout** to handle international payment workflows effortlessly.

---

## 🆕 Recent Updates & Fixes (March 2026)

The project has recently undergone massive restructuring and stabilization to adapt for Vercel deployment:

* **Brand Transition:** The repository, dynamic configurations, variables and UI strings have been fully transitioned from *ChariFund* to **IRWA**.
* **Next.js 15 Build Fixes:** Removed deprecated `appDir` config flags, completely resolved deeply nested file alias issues (`jsconfig.json` resolution limits), and fully reconstructed the root project directory to absorb isolated `frontend/` logic.
* **Component Architecture Merger:** Dozens of vital components (`FooterOne`, `BreadcrumbOne`, `CauseSliderTwo`, etc.) alongside `public/assets` UI packages were merged strictly into the root source, fixing 404 Vercel hydration fails.
* **Supabase Client Hardening:** Addressed lethal static compilation crashes connected to server components trying to invoke missing Environment Variables (`NEXT_PUBLIC_API_URL` & `NEXT_PUBLIC_SUPABASE_URL`) during static Next hooks. Images now fallback properly without fatal null-pointer build logs.
* **UX Broken Link Fixes:** Re-mapped scattered UI paths (e.g. repointing `/donate-us` -> `/donation`, and dynamically jumping `/our-causes` to `/#campaigns`).

---

## ✨ Features

### 🎯 Core Platform Features
- **Campaign Management:** Full creation, editing, and deployment workflows for complex charities.
- **Secure Donations:** Processing logic completely authenticated through Stripe encrypted webhook sessions.
- **Dynamic Site Layout:** Multi-page layout with custom `Preloaders`, `Server/Client Providers`, and context hooks.
- **Server-Side Data Logic:** Leveraging Supabase API capabilities merged securely into Next.JS Server Components.
- **Administrative Control:** Deeply protected dashboards to supervise total network flow, metrics, fatwas, site settings, and team tracking. 

---

## 🏗️ Backend Architecture

The backend of this ecosystem comprises a robust Express.js & PostgreSQL framework handling independent processes alongside native Next.js API Routes:

### Controller Functions & Their Behaviors

1. **`authController.js`**
   - Handles new user module registration.
   - Performs BCrypt password hashing logic.
   - Generates secure JSON Web Tokens (JWT) for session management.
   - Authenticates and identifies valid scopes mapping users to Role-Based Access Controls (RBAC).

2. **`campaignController.js`**
   - Controls the fundamental CRUD (Create/Read/Update/Delete) pipeline for live charities.
   - Parses complex JSON payloads encompassing numerical goal targets, image linking maps, and boolean validation rules.
   - Handles advanced queries like dynamic category filtering and draft/live status logic.

3. **`donationController.js`**
   - Securely registers real-world payload transfers.
   - Parses parameters to attribute user donations securely or flag them as fully anonymous pledges in the SQL Database.
   - Iterates numerical logic to aggregate total goals mapping onto live Front-End visual progress bars.

4. **`stripeController.js`**
   - Direct low-level programmatic interface with Stripe API.
   - Bootstraps real-time Checkout Sessions calculating raw pricing algorithms on the fly.
   - Parses and embeds deeply nested donation metadata so asynchronous transaction trails never decouple from the donor.

5. **`uploadController.js`**
   - Handles the edge network configuration endpoints routing static local images dynamically via Multer forms to safe blob environments.

### Route Network Logic (`/routes`)
- **`adminRoutes.js`**: Enforces strict verification policies to expose secure administrative statistics exclusively to dashboard admins.
- **`stripeRoutes.js`**: Protects the pivotal Webhook interceptor; responsible for listening to third-party bank-settlement POST hooks and securely modifying local transaction flags *only* when cleared.
- Others matching respective controllers: *`authRoutes`, `campaignRoutes`, `donationRoutes`*.

---

## 🛠️ Tech Stack

### Frontend Architecture
* **Next.js 15 (App Router)** - Handling intensive Server-Side Rendering (SSR) and SEO optimizations.
* **React 18** - UI component-driven rendering architecture.
* **AOS / Slick** - Advanced customized carousel states and deeply nested visual scroll animations.
* **SASS & Bootstrap 5** - Complex DOM hierarchical stylings overriding default classes safely.

### Backend Infrastructure
* **Express 5** - Extensible REST endpoints linking distinct modular microservices.
* **PostgreSQL / Supabase** - Master relational table data structuring and real-time backend-as-a-service wrappers.
* **Stripe SDK** - PCI-compliant vault hosting financial payment components safely offsite.
* **JWT & Bcrypt** - State-of-the-art authentication lifecycle encryption formats.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Supabase Account** or standard **PostgreSQL** instance
- **Stripe Account** for API / Webhook Keys

### Development Installation

```bash
# Clone the Repository
git clone https://github.com/mobashirsifat123/charity.git
cd charity

# Install global root dependencies
npm install

# Setup local credentials
# Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and STRIPE_SECRET_KEY inside .env

# Run Next.js development server
npm run dev
```

---

<p align="center">
  Made with ❤️ to empower change globally.
</p>
