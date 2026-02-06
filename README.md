# Home Service Discovery Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-green?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-red?style=for-the-badge&logo=redis)](https://redis.io/)
[![Stripe](https://img.shields.io/badge/Stripe-purple?style=for-the-badge&logo=stripe)](https://stripe.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

A comprehensive home service discovery platform connecting users with local service providers.

[Features](#features) • [Architecture](#architecture) • [API Reference](#api-reference) • [Getting Started](#getting-started)

</div>

---

## Overview

JustServiceHub is a full-stack web application that enables users to discover, book, and review local service providers. The platform supports multiple user roles (customers, providers, administrators) and includes AI-powered service recommendations, real-time location tracking, and secure payment processing.

## Features

- **Service Discovery** - Browse and search services with AI-powered semantic search
- **Smart Booking** - Schedule appointments with real-time availability
- **Secure Payments** - Integrated Stripe payment processing
- **Location Tracking** - Real-time provider/customer location via Redis
- **AI Recommendations** - Personalized service suggestions using OpenAI
- **Review System** - Rate and review completed services
- **Admin Dashboard** - Comprehensive management interface

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│  Next.js 14 (App Router) + TypeScript + Tailwind CSS           │
│  ├── Authentication (JWT)                                        │
│  ├── Role-based Access Control                                  │
│  └── Real-time Maps (Leaflet)                                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                         API Layer                                │
│  Next.js API Routes + Middleware                                │
│  ├── Authentication (/api/auth)                                 │
│  ├── Services (/api/services)                                    │
│  ├── Bookings (/api/bookings)                                   │
│  ├── Payments (/api/payments)                                   │
│  └── Administration (/api/admin)                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                        Data Layer                                │
│  PostgreSQL (Prisma ORM)                                         │
│  ├── Users, Services, Bookings, Reviews                          │
│  └── Redis (Location Caching)                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── api/                     # Backend API routes
│   │   ├── admin/              # Admin management endpoints
│   │   ├── auth/               # Authentication endpoints
│   │   ├── bookings/           # Booking management
│   │   ├── location/           # Location tracking
│   │   ├── payments/           # Payment processing
│   │   ├── providers/          # Provider endpoints
│   │   ├── recommendations/    # AI recommendations
│   │   ├── reviews/            # Review management
│   │   └── services/           # Service management
│   ├── admin/                   # Admin dashboard page
│   ├── auth/                    # Login/Register pages
│   ├── dashboard/               # User dashboards
│   ├── profile/                 # User profile page
│   ├── recommendations/         # AI recommendations page
│   ├── services/               # Service browsing
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                  # React components
│   ├── admin/                  # Admin-specific components
│   ├── Layout.tsx              # Main layout
│   ├── LocationMap.tsx         # Map component
│   ├── PaymentForm.tsx         # Payment form
│   ├── ProfileComponent.tsx    # Profile display
│   └── ReviewModal.tsx         # Review modal
├── context/                    # React context providers
│   └── AuthContext.tsx         # Authentication context
└── lib/                        # Utility libraries
    ├── ai.ts                   # OpenAI integration
    ├── auth.ts                 # JWT authentication
    ├── prisma.ts              # Database client
    ├── redis.ts               # Redis client
    ├── security.ts            # Security utilities
    ├── stripe.ts              # Stripe configuration
    └── validation.ts          # Input validation
```

---

## User Roles

| Role       | Description      | Capabilities                                      |
| ---------- | ---------------- | ------------------------------------------------- |
| `user`     | Customer         | Browse services, create bookings, leave reviews   |
| `provider` | Service Provider | Manage services, handle bookings, track locations |
| `admin`    | Administrator    | Full system access, user/service management       |

---

## API Reference

### Authentication

| Endpoint             | Method  | Description        | Auth Required |
| -------------------- | ------- | ------------------ | ------------- |
| `/api/auth/login`    | POST    | User login         | No            |
| `/api/auth/register` | POST    | User registration  | No            |
| `/api/auth/profile`  | GET/PUT | Profile management | Yes           |

### Services

| Endpoint             | Method | Description                        | Auth Required  |
| -------------------- | ------ | ---------------------------------- | -------------- |
| `/api/services`      | GET    | List services (supports AI search) | No             |
| `/api/services`      | POST   | Create service                     | Provider/Admin |
| `/api/services/[id]` | GET    | Service details                    | No             |
| `/api/services/[id]` | PUT    | Update service                     | Owner/Admin    |
| `/api/services/[id]` | DELETE | Delete service                     | Owner/Admin    |

### Bookings

| Endpoint             | Method | Description        | Auth Required |
| -------------------- | ------ | ------------------ | ------------- |
| `/api/bookings`      | GET    | List user bookings | Yes           |
| `/api/bookings`      | POST   | Create booking     | Yes           |
| `/api/bookings/[id]` | GET    | Booking details    | Yes           |
| `/api/bookings/[id]` | PUT    | Update booking     | Yes           |
| `/api/bookings/[id]` | DELETE | Cancel booking     | Yes           |

### Payments

| Endpoint                              | Method | Description        | Auth Required |
| ------------------------------------- | ------ | ------------------ | ------------- |
| `/api/payments/create-payment-intent` | POST   | Initialize payment | Yes           |
| `/api/payments/confirm`               | POST   | Confirm payment    | Yes           |

### Admin

| Endpoint              | Method           | Description        | Auth Required |
| --------------------- | ---------------- | ------------------ | ------------- |
| `/api/admin/users`    | GET/PATCH/DELETE | User management    | Admin         |
| `/api/admin/services` | GET/PATCH/DELETE | Service management | Admin         |
| `/api/admin/bookings` | GET/PATCH/DELETE | Booking management | Admin         |
| `/api/admin/payments` | GET/POST         | Payment management | Admin         |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Stripe account
- OpenAI API key (optional, for recommendations)

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/homedb"
DIRECT_URL="postgresql://user:password@localhost:5432/homedb"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OpenAI (Optional)
OPENAI_API_KEY="sk-..."
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd home-service-discovery

# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Technology Stack

### Frontend Technologies

| Technology      | Purpose                         |
| --------------- | ------------------------------- |
| Next.js 14      | React framework with App Router |
| TypeScript      | Type safety                     |
| Tailwind CSS    | Utility-first styling           |
| React Context   | State management                |
| Leaflet         | Interactive maps                |
| Stripe Elements | Payment UI components           |

### Backend Technologies

| Technology         | Purpose                     |
| ------------------ | --------------------------- |
| Next.js API Routes | Backend API endpoints       |
| Prisma ORM         | Database ORM                |
| PostgreSQL         | Primary database            |
| Redis              | Location caching & sessions |
| JWT                | Token-based authentication  |
| Stripe             | Payment processing          |
| OpenAI             | AI recommendations          |

### DevOps

| Technology | Purpose           |
| ---------- | ----------------- |
| Docker     | Containerization  |
| Kubernetes | Orchestration     |
| Jest       | Testing framework |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under JUST License.

---

<div align="center">
Built with ❤️ using Next.js, Prisma, and Stripe
</div>
