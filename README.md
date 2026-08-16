# Pyrite

**Pyrite** — Corporate gifts, pens, keyrings, notebooks, and customised diaries. This monorepo combines a customer-facing Next.js storefront with a TanStack Start admin CMS, both powered by a shared Supabase backend.

Storefront + admin stay together: same catalog, routes, and APIs; Pyrite brand, logo, palette, and typography.

## Architecture

```
Admin Panel (TanStack Start)                    Storefront (Next.js 15)
        │                                              │
        │ Write (authenticated)                        │ Read (public API)
        ▼                                              ▼
   ┌─────────────────────────────────────────────────────────┐
   │                    Supabase                              │
   │    PostgreSQL (RLS)  │  Auth (JWT)  │  Storage (media)   │
   └─────────────────────────────────────────────────────────┘
```

- **Admin Panel** manages products, pages, diaries, media, navigation, SEO, and site settings
- **Storefront** renders customer-facing pages by fetching from admin's public REST API
- **Supabase** provides the database, authentication, and media storage

## Folder Structure

```
pyrite-app/
├── apps/
│   ├── admin/             # TanStack Start + React 19 admin CMS
│   │   ├── src/routes/    # Admin pages + public API endpoints
│   │   ├── src/components/# Admin shell + shadcn/ui components
│   │   ├── src/integrations/supabase/  # Supabase clients + auth
│   │   └── supabase/      # Database migrations
│   └── storefront/        # Next.js 15 App Router storefront
│       ├── src/app/       # Pages (home, shop, product, custom-design)
│       ├── src/components/# UI sections + product components
│       └── prisma/        # Prisma schema + migrations
├── packages/
│   └── shared-types/      # Shared TypeScript type definitions
└── docs/                  # Architecture, setup, API, deployment docs
```

## Quick Start

### Prerequisites
- **bun** (>= 1.0)
- **Node.js** (>= 18)
- **Supabase** project

### Setup

```bash
cd D:\GitClones\pyrite-app
bun install
cp .env.example .env  # Edit with your Supabase credentials
```

### Development

```bash
bun run dev              # Start both apps concurrently
bun run dev:storefront   # Storefront only (port 3000)
bun run dev:admin        # Admin only (port 5174)
```

### Build

```bash
bun run build            # Build both apps
bun run build:storefront # Storefront only
bun run build:admin      # Admin only
```

## Tech Stack

### Admin Panel (apps/admin)
- **Framework**: TanStack Start (React 19, Vite 8)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State**: TanStack React Query + React Hook Form + Zod

### Storefront (apps/storefront)
- **Framework**: Next.js 15 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4 — ivory + antique gold, Cinzel / Source Serif 4
- **ORM**: Prisma (PostgreSQL)

## API Overview

The admin panel exposes these public REST endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/public/products` | Product listing with category/featured filters |
| `GET /api/public/products/:slug` | Single product by slug |
| `GET /api/public/diaries` | Diary listing |
| `GET /api/public/content/page/:pageKey` | Page sections + SEO data |
| `GET /api/public/content/nav` | Navigation links (header + footer) |
| `GET /api/public/content/site-settings` | Global site settings |
