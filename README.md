<p align="center">
  <img src="frontend/public/assets/images/logo.png" alt="IRWA Logo" width="200"/>
</p>

<h1 align="center">🌟 IRWA - Charity Crowdfunding Platform</h1>

<p align="center">
  <strong>Empower Change, One Donation at a Time</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-documentation">API Docs</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Express-5.x-green?style=for-the-badge&logo=express" alt="Express"/>
  <img src="https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Stripe-Payments-purple?style=for-the-badge&logo=stripe" alt="Stripe"/>
</p>

---

## 📖 About The Project

**IRWA** is a modern, full-stack charity crowdfunding platform that connects donors with meaningful causes. Built with cutting-edge technologies, it provides a seamless experience for both campaign creators and donors, featuring secure payment processing through Stripe.

Whether you're raising funds for education, healthcare, environmental causes, or community projects, IRWA makes it easy to create impactful campaigns and receive donations from supporters worldwide.

---

## ✨ Features

### 🎯 Core Features

| Feature | Description |
|---------|-------------|
| **Campaign Management** | Create, edit, and manage fundraising campaigns with rich media support |
| **Secure Donations** | Process donations securely through Stripe payment integration |
| **User Authentication** | JWT-based authentication with role-based access control |
| **Campaign Discovery** | Search, filter by category, and paginate through campaigns |
| **Real-time Progress** | Track donation progress with visual progress bars |
| **Admin Dashboard** | Comprehensive admin panel for campaign and user management |

### 🎨 UI/UX Features

- **Responsive Design** - Fully optimized for desktop, tablet, and mobile devices
- **Beautiful Animations** - Smooth AOS (Animate on Scroll) animations
- **Custom Cursor** - Interactive custom cursor for enhanced UX
- **Dynamic Components** - Testimonials, team sections, blog, and event listings
- **Multiple Page Layouts** - 5 unique homepage variations

### 🔐 Security Features

- **Password Hashing** - Bcrypt encryption for secure password storage
- **JWT Authentication** - Secure token-based authentication
- **Protected Routes** - Role-based route protection
- **Input Validation** - Server-side validation for all inputs

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **React 18** | UI component library |
| **Bootstrap 5** | CSS framework |
| **SASS** | Advanced styling |
| **Axios** | HTTP client |
| **AOS** | Scroll animations |
| **React Slick** | Carousel/slider components |
| **Stripe.js** | Payment processing client |

### Backend

| Technology | Purpose |
|------------|---------|
| **Express 5** | Node.js web framework |
| **PostgreSQL** | Relational database |
| **JWT** | Authentication tokens |
| **Bcrypt** | Password hashing |
| **Multer** | File upload handling |
| **Stripe API** | Payment processing |
| **CORS** | Cross-origin resource sharing |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **pnpm**
- **Stripe Account** (for payment processing)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/charifund.git
cd charifund
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure your `.env` file:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/charifund
JWT_SECRET=your_super_secret_jwt_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

```bash
# Start the backend server
node server.js

# Or use nodemon for development
npx nodemon server.js
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

Configure your `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

```bash
# Start the development server
npm run dev
```

#### 4. Database Setup

Create the PostgreSQL database and run the schema:

```sql
-- Create database
CREATE DATABASE charifund;

-- Connect and create tables
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    goal_amount DECIMAL(12, 2) NOT NULL,
    raised_amount DECIMAL(12, 2) DEFAULT 0,
    image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Donations table
CREATE TABLE donations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    campaign_id INTEGER REFERENCES campaigns(id),
    amount DECIMAL(12, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    stripe_payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:5000
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and get JWT token |

### Campaign Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/campaigns` | Get all campaigns (with search, filter, pagination) |
| `GET` | `/campaigns/:id` | Get campaign by ID |
| `POST` | `/campaigns` | Create new campaign (Admin) |
| `PUT` | `/campaigns/:id` | Update campaign (Admin) |
| `DELETE` | `/campaigns/:id` | Delete campaign (Admin) |

### Donation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/donations` | Process a donation |
| `GET` | `/donations/my-donations` | Get user's donation history |

### Stripe Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/stripe/create-checkout-session` | Create Stripe checkout session |
| `POST` | `/stripe/webhook` | Handle Stripe webhooks |

### Upload Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload/image` | Upload campaign images |

---

## 📁 Project Structure

```
charifund/
├── 📂 backend/
│   ├── 📂 src/
│   │   ├── 📂 config/        # Database configuration
│   │   ├── 📂 controllers/   # Route controllers
│   │   ├── 📂 middleware/    # Auth & upload middleware
│   │   ├── 📂 models/        # Database models
│   │   └── 📂 routes/        # API routes
│   ├── 📂 uploads/           # Uploaded files
│   ├── server.js             # Entry point
│   └── package.json
│
├── 📂 frontend/
│   ├── 📂 public/            # Static assets
│   │   └── 📂 assets/        # Images, icons, fonts
│   ├── 📂 src/
│   │   ├── 📂 app/           # Next.js App Router pages
│   │   │   ├── 📂 admin/     # Admin dashboard
│   │   │   ├── 📂 donation/  # Donation pages
│   │   │   ├── 📂 login/     # Authentication
│   │   │   └── ...           # Other pages
│   │   ├── 📂 components/    # Reusable components
│   │   ├── 📂 context/       # React context providers
│   │   ├── 📂 hooks/         # Custom React hooks
│   │   ├── 📂 helper/        # Utility functions
│   │   └── 📂 utils/         # API utilities
│   └── package.json
│
└── README.md
```

---

## 🎯 Available Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Main landing page with featured campaigns |
| About Us | `/about-us` | Organization information |
| Our Causes | `/our-causes` | Browse all campaigns |
| Cause Details | `/cause-details/:id` | Individual campaign page |
| Donate | `/donate-us` | Donation page |
| Events | `/events` | Upcoming events |
| Blog | `/blog-grid` | Blog articles |
| Team | `/our-team` | Team members |
| Contact | `/contact-us` | Contact form |
| Login | `/login` | User authentication |
| Register | `/register` | User registration |
| Admin | `/admin` | Admin dashboard |
| Dashboard | `/dashboard` | User dashboard |

---

## 📊 Environment Variables

### Backend (.env)

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/charifund
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm run lint
npm run build
```

---

## 🚢 Deployment

### Backend (Node.js)

```bash
# Build for production
npm run build

# Start production server
NODE_ENV=production node server.js
```

### Frontend (Next.js)

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker (Optional)

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

---

## 📅 Development History

A step-by-step record of how this project was built.

### Phase 1: Project Foundation
- [x] Initialize Next.js 15 frontend with App Router
- [x] Set up Express.js backend with modular structure
- [x] Design PostgreSQL database schema (`users`, `campaigns`, `donations`)
- [x] Configure project structure (controllers, routes, middleware, models)

### Phase 2: Authentication System
- [x] Implement user registration with bcrypt password hashing
- [x] Implement JWT-based login authentication
- [x] Create auth middleware for protected routes
- [x] Add role-based access control (admin vs user)

### Phase 3: Campaign Management
- [x] Build campaign CRUD operations (Create, Read, Update, Delete)
- [x] Implement admin-only campaign creation/editing
- [x] Add campaign image upload functionality (Multer)
- [x] Create campaign listing with progress tracking

### Phase 4: Payment Integration
- [x] Integrate Stripe checkout sessions
- [x] Implement donation processing flow
- [x] Add Stripe webhook handling for payment confirmation
- [x] Create donation history tracking

### Phase 5: Discovery System
- [x] Add search functionality for campaigns
- [x] Implement category-based filtering
- [x] Add pagination for campaign listings
- [x] Create `useCampaigns` hook for URL-synced state

### Phase 6: Frontend Pages & UI
- [x] Build responsive layouts with Bootstrap 5
- [x] Add AOS scroll animations
- [x] Create multiple homepage variations (5 layouts)
- [x] Implement all static pages (About, Team, Blog, Events, Contact)
- [x] Build admin dashboard interface
- [x] Create user dashboard with donation history

### 🔮 Future Enhancements (Planned)
- [ ] Email notifications for donations
- [ ] Social media sharing for campaigns
- [ ] Campaign updates/comments system
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact

**Project Link:** [https://github.com/yourusername/charifund](https://github.com/yourusername/charifund)

---

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js](https://expressjs.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [Bootstrap](https://getbootstrap.com/)
- [PostgreSQL](https://www.postgresql.org/)

---

<p align="center">
  Made with ❤️ for a better world
</p>

<p align="center">
  ⭐ Star this repo if you find it helpful!
</p>
