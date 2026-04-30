# IRWAA

IRWAA is an Islamic knowledge, Quran learning, fatwa, e-book, and charity platform built with Next.js.

Live site: [https://irwaa.site](https://irwaa.site)

Share this link with others to view the current live output:

```text
https://irwaa.site
```

## What IRWAA Provides

IRWAA brings the main parts of an Islamic community platform into one website:

- Quran reading and learning
- Tafseer browsing
- Islamic articles and research
- Fatwas and public guidance
- E-books and reading resources
- Courses and structured learning
- Prayer and Qibla tools
- Donations and community causes
- Member dashboard and saved content
- Admin dashboard for managing the site

## Main User Features

### Mobile Experience

- Mobile app-style top bar and bottom navigation
- Mobile dashboard homepage
- Quick access to Quran, Articles, Fatwas, E-books, Prayer/Qibla, Courses, Donate, and Profile
- Continue reading card for Quran
- Recently viewed content
- Last used feature highlighting
- Safe-area support for modern phones

### Quran

- Quran hub with Surah search
- Compact mobile Surah grid
- Continue reading support using local storage
- Quran reader with Arabic text, translation, and recitation
- Sticky mobile audio player
- Tafseer entry points

### Articles

- Article directory with featured articles
- Search and topic filtering
- Category tabs on mobile
- Image-led mobile article cards
- Related content on article pages

### Fatwas

- Search-first fatwa listing
- Category chips on mobile
- Floating Ask Fatwa button
- Fatwa detail pages
- Public fatwa request form

### E-Books

- E-book library
- Search-first mobile layout
- Category filters
- Compact mobile book cards
- E-book detail pages

### Unified Search

- Search across Quran, Articles, Fatwas, and Books
- Grouped results by content type
- Tabs and filters
- Clickable results with correct routing

### Donations

- Campaign discovery
- Donation pages
- Stripe checkout flow
- Donation success handling
- Admin donation visibility

### Admin

- Manage articles
- Manage fatwas
- Manage campaigns
- Manage images
- Manage courses
- Manage Quran/Tafseer content
- Manage site settings
- Review inbox items and subscribers

## Tech Stack

- Next.js 15
- React 18
- App Router
- Supabase for database, auth, and storage
- Stripe for payments
- Bootstrap 5
- Sass/SCSS
- Vercel deployment

The main production app is the root Next.js project.

The `backend/` directory contains an older Express backend kept for reference and legacy compatibility. The current site primarily runs through the Next.js app and Supabase.

## Project Structure

```text
src/app                 Next.js App Router pages and API routes
src/components          Shared UI, mobile UI, admin UI, and content components
src/components/mobile   Mobile app shell, cards, filters, dashboard, and navigation
src/context             Auth, language, settings, audio, readability, personalization
src/lib                 Supabase helpers, content utilities, SQL upgrades, site settings
src/styles              Shared SCSS modules
public                  Static assets
backend                 Legacy Express backend
frontend                Older frontend snapshot kept in the repo
tests                   Playwright tests
```

## Local Development

### Requirements

- Node.js 20 or 22
- Supabase project
- Stripe account if testing payments

### Install

```bash
npm install
```

### Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_SITE_URL=https://irwaa.site
NEXT_PUBLIC_API_URL=https://api.irwaa.com
```

Useful notes:

- `NEXT_PUBLIC_SITE_URL` should be `https://irwaa.site` in production.
- Supabase Auth callback URLs should include `https://irwaa.site/auth/callback`.
- Supabase reset password redirects should point to the live domain.
- Stripe webhook endpoint should point to `/api/stripe/webhook` on the live site.
- Some content/admin features require SQL upgrades from `src/lib/sql`.

### Run Locally

```bash
npm run dev
```

Local URL:

```text
http://localhost:3000
```

## Production Deployment

The live site is deployed on Vercel:

```text
https://irwaa.site
```

Recommended production environment values:

```env
NEXT_PUBLIC_SITE_URL=https://irwaa.site
FRONTEND_URL=https://irwaa.site
```

Before deploying:

1. Confirm Supabase environment variables are set in Vercel.
2. Confirm Stripe live keys are set if accepting real donations.
3. Confirm Supabase Auth redirects use the live domain.
4. Confirm admin site settings are correct.
5. Run a production build locally.

```bash
npm run build
```

Deploy:

```bash
vercel deploy --prod
```

## Personalization

The mobile experience uses local storage for lightweight personalization:

- Last Quran reading position
- Recently viewed Articles, Fatwas, and E-books
- Last opened feature
- Language preference

This keeps the mobile experience fast and useful even before a visitor logs in.

## Current Status

IRWAA is a live Islamic platform at:

[https://irwaa.site](https://irwaa.site)

The site currently includes public content browsing, mobile-first navigation, Quran learning, fatwas, e-books, donations, personalization, and admin management.
