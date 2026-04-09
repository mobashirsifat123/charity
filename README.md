# IRWA

IRWA is a modern Islamic knowledge and charity platform built with Next.js. Visitors can discover campaigns, donate securely, read articles, browse fatwas, explore e-books, submit new fatwa questions, and subscribe to updates. Admins can manage content, media, donations, and site settings from one dashboard.

## What The Website Does

- Shows fundraising campaigns with progress tracking and donation links
- Publishes articles, fatwas, and e-books with search, filters, and detail pages
- Lets visitors submit fatwa requests and newsletter subscriptions
- Supports English and Arabic with RTL support for Arabic
- Gives users a dashboard for donation history and saved content
- Gives admins a control panel for campaigns, articles, fatwas, team members, inbox items, donations, images, and site copy

## Main Features

- Campaign discovery with search, pagination, and progress bars
- Stripe checkout flow for donations
- Article library with categories, tags, featured items, and related content
- Fatwa library with categories, filters, and request submission
- Unified search across articles and fatwas
- Newsletter signup storage
- Admin inbox for fatwa requests and subscribers
- Fatwa request to draft-fatwa conversion inside admin
- Image upload and media management
- Editable site settings and site-builder style content editing

## Tech Stack

### Main App

- Next.js 15
- React 18
- App Router
- Supabase for database, auth, and storage
- Stripe for payments
- Bootstrap 5 and Sass for UI styling
- AOS and React Slick for animations and sliders

### Supporting Legacy Backend

- Express 5
- PostgreSQL via `pg`
- JWT, bcrypt, multer, cors

The main live app logic is in the root Next.js project. The `backend/` folder contains an older standalone Express API that is still kept in the repository.

## Development History

- Started as **ChariFund**, a charity crowdfunding project
- Added campaign management, donations, authentication, and admin tooling
- Migrated data and uploads toward Supabase/Postgres and Supabase Storage
- Expanded beyond fundraising to include articles, fatwas, newsletter subscriptions, and fatwa requests
- Rebranded from **ChariFund** to **IRWA**
- Recent work focused on merging app files into the root project and fixing deployment/build issues for Vercel

## Project Structure

- `src/app` - Next.js routes, pages, and API routes
- `src/components` - reusable UI and admin components
- `src/context` - auth, language, and site settings providers
- `src/lib` - Supabase helpers, content utilities, settings, and SQL upgrades
- `public` - static assets
- `backend` - legacy Express API
- `frontend` - older copied frontend snapshot kept in the repo

## Getting Started

### Requirements

- Node.js 20 or 22
- A Supabase project
- A Stripe account for payments

### Install

```bash
npm install
```

### Environment Variables

Create `.env.local` in the project root and add the values used by the current Next.js app:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5050
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
```

Notes:

- `NEXT_PUBLIC_API_URL` is mainly useful when older image or backend paths are still in use.
- `localhost:5000` is commonly occupied by AirPlay/AirTunes on macOS, so `5050` is the safer local default.
- `STRIPE_WEBHOOK_SECRET` is strongly recommended for verified Stripe webhooks.
- Some advanced content features expect the SQL upgrade in `src/lib/sql/content-platform-upgrade.sql`.

### Run The App

```bash
npm run dev
```

Open `http://localhost:3000`.

### Optional Legacy Backend

If you still need the standalone Express API:

```bash
cd backend
npm install
npm run dev
```

## Quick Summary

IRWA is no longer just a donation site. It is a combined Islamic publishing, learning, and charity platform with a bilingual public website and a full admin back office.

## Deployment Checklist

Before you point your domain at the app, make sure all of these are finished:

1. Set every required environment variable from `.env.example` in your hosting platform.
2. Replace all Stripe test keys with live keys for production.
3. Set `NEXT_PUBLIC_SITE_URL` and `FRONTEND_URL` to your real domain, for example `https://irwa.org`.
4. If you are using the legacy Express backend, set `DATABASE_URL` or the `DB_*` variables in the backend environment.
5. In Supabase Auth:
   - enable Google provider if you want Google sign-in
   - add your production callback URL, for example `https://your-domain.com/auth/callback`
   - add your reset-password redirect URL if needed
6. In Stripe:
   - add the production webhook endpoint for `/api/stripe/webhook`
   - set `STRIPE_WEBHOOK_SECRET`
7. In the admin panel, review the editable site settings so your live contact details, social links, and footer content are correct.

## Production Notes

- The Next.js app can build successfully even when external content services fail temporarily because some sections fall back gracefully.
- The legacy backend intentionally returns `503` for database-backed routes if `DATABASE_URL` is not configured. That is an environment issue, not a frontend build failure.
- The site is designed so future content, contact information, and many structural homepage changes can be managed from the admin interface without code edits.
