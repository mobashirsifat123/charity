# Changelog

All notable changes to the ChariFund project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.1.0] - 2026-02-08

### Security & Admin Dashboard Hardening

#### Added
- **Backend Tests**
  - Jest + Supertest for API testing
  - Admin endpoint security tests (401/403/200 verification)
  - Test command: `npm test`

- **Admin Campaign Management**
  - Campaign list page (`/admin/campaigns`)
  - Edit campaign page (`/admin/campaigns/[id]/edit`)
  - DELETE `/campaigns/:id` endpoint
  - PUT `/campaigns/:id` endpoint

#### Changed
- **Route Standardization**
  - `/admin/create-campaign` → `/admin/campaigns/new` (with redirect for backward compatibility)
  - Consistent admin route pattern: `/admin/campaigns/*`

- **AdminGuard Improvements**
  - Shows "Not Authorized" message before redirect
  - Shows "Authentication Required" for logged-out users
  - Prevents API calls until auth confirmed

#### Security
- Verified middleware chain: `verifyToken → requireAdmin` on all admin-only routes
- 401 for missing/invalid token
- 403 for non-admin users
- 404 for non-existent campaigns

---

## [1.0.0] - 2026-02-08

### 🎉 Initial Release

**ChariFund** - A full-stack charity crowdfunding platform.

### Added

#### Backend
- **Authentication System**
  - User registration with bcrypt password hashing
  - JWT-based login authentication
  - Auth middleware for protected routes
  - Role-based access control (admin/user)

- **Campaign Management**
  - Full CRUD operations for campaigns
  - Admin-only access for create/update/delete
  - Image upload support via Multer
  - Campaign status tracking (active/completed)

- **Donation System**
  - Donation processing with amount tracking
  - User donation history
  - Campaign raised amount updates

- **Stripe Integration**
  - Checkout session creation
  - Webhook handling for payment confirmation
  - Secure payment processing

- **API Endpoints**
  - `/auth/*` - Authentication routes
  - `/campaigns/*` - Campaign management
  - `/donations/*` - Donation handling
  - `/stripe/*` - Payment processing
  - `/upload/*` - File uploads

#### Frontend
- **Pages**
  - Home (5 layout variations)
  - About Us
  - Our Causes (campaign listing)
  - Cause Details (individual campaign)
  - Donate page
  - Events listing
  - Blog grid
  - Team page
  - Contact form
  - Login/Register
  - Admin Dashboard
  - User Dashboard

- **Features**
  - Campaign discovery with search
  - Category-based filtering
  - Pagination
  - Real-time donation progress bars
  - Responsive design (mobile/tablet/desktop)

- **UI/UX**
  - Bootstrap 5 styling
  - SASS for custom styles
  - AOS scroll animations
  - React Slick carousels
  - Custom cursor effects

#### Database
- **Schema**
  - `users` table with role support
  - `campaigns` table with goal/raised tracking
  - `donations` table with Stripe payment IDs

---

## How to Update This File

When making changes to the project, add entries under a new version header:

```markdown
## [1.1.0] - YYYY-MM-DD

### Added
- New feature description

### Changed
- Modified feature description

### Fixed
- Bug fix description

### Removed
- Removed feature description
```
