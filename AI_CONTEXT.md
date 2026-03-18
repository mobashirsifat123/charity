# AI / Development Context Guide for IRWA (formerly ChariFund)

This document is specifically designed to provide absolute clarity to LLMs, autonomous coding agents, and future developers regarding the structural history, technical quirks, routing paradigms, and infrastructure choices of the IRWA project.

## 1. Project Paradigm Shift (The Merge)

**Critical Context:** The project originally possessed a split monolithic footprint. It had a root Express/Node backend, and an entirely nested Next.js frontend directory at `./frontend/`. 
To support seamless Vercel deployment, the `frontend/` directory was **merged directly into the root level** of the repository.

* **Consequence:** The root directory now primarily behaves as a Next.js 15 (App Router) project via `package.json`, `next.config.js`, and `src/`. The remaining backend services are securely siloed strictly inside `./backend/`. 
* **Warning for AI:** When modifying "frontend" React code, always target the root `./src/` directory. Do NOT modify or restore files inside the legacy `./frontend/` nested directory—it is deprecated entirely.

## 2. Path Aliasing & File Resolution

To mitigate deep relative nesting (`../../../`), this project heavily utilizes path aliasing mapped in `jsconfig.json`.
* `@/*` resolves dynamically to `src/*`.
* Example: `import FooterOne from '@/components/FooterOne'` equates to `src/components/FooterOne.jsx`.

**Warning for AI:** If components throw "Module Not Found" during Next builds, explicitly verify `jsconfig.json` exists in the root, and that components exist within `src/components/...` rather than `frontend/src/...`.

## 3. Database & Environmental Nuances (Supabase Issue)

The backend database layer utilizes Supabase (PostgreSQL). Next.js leverages Server Components (`async function()`) and Server API routes (`app/api/`) which execute Supabase SDK calls during the *build* step (Static Generation).

* **The Crash Context:** Previously, `createClient(process.env.NEXT_PUBLIC_SUPABASE_URL)` would crash Next.js builds violently because the environment variable was null during static Vercel compilation without actual runtime payload.
* **The Fix:** All instances of `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and Supabase Service Role Keys across `/lib`, `/api`, and `CauseDetails` have been padded with `|| ""` or fallback dummy URL strings. 
* **Rule for AI:** When spinning up new external Fetch or Supabase requests on Server components, ALWAYS apply a short-circuit string evaluation `|| 'https://placeholder.supabase.co'` so the compiler does not fail gracefully.

## 4. UI Library Mapping

The frontend diverges from typical purely Tailwind architectures. 
* It uses **Bootstrap 5** for structural flex-grids (`container`, `row`, `col-lg-6`).
* It uses **SASS/SCSS** (`src/app/globals.scss`) for intricate style overrides.
* It uses **AOS (Animate on Scroll)** heavily via data-attributes (`data-aos="fade-up"`). 
* Ensure that the `ClientProviders.jsx` or root `layout.jsx` imports `InitializeAOS` globally.

## 5. Stripe Webhook Architectural Flow

The payment ecosystem is decentralized intentionally.
1. Local Next.js UI captures user donation intention.
2. Next.js API Route (`/api/stripe/create-checkout-session`) sends payload to Stripe.
3. Stripe processes financial parameters, redirects the user upon success.
4. **Crucial Step:** Stripe pings the external backend Node instance (`backend/src/controllers/stripeController.js` or Next `webhook/route.js`) with an authenticated Webhook confirming the settlement.
5. The Webhook uses the embedded metadata (`campaignId`, `donationAmount`) to mutate the Supabase `donations` and `campaigns` tables.

* **Rule for AI:** Do NOT update campaign goal integers locally upon UI checkout success. Only update goals safely from within a validated Stripe `checkout.session.completed` webhook event.

## 6. Static Asset Loading

Assets such as preloader logos and campaign placeholder images live strictly inside `./public/assets/`. Because of the Next.js `<img>` and `remotePatterns` strict image protocol, dynamic images stored in Supabase Storage require exact whitelisting in `next.config.js`. DO NOT wipe the `.supabase.co` remote pattern from config, or all dynamic images will throw 400 errors.

## 7. Branding Strings

The project name is "IRWA". Old strings like `ChariFund` or `info@charifund.org` have been scrubbed recursively using `sed` commands across all layouts, site contexts, and database seed payloads. Any new UI generation should align with the "IRWA" nomenclature.