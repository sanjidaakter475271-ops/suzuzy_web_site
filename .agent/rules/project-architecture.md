---
description: Royal Suzuky monorepo architecture — tech stack, file locations, and component interconnections.
globs: **/*
alwaysApply: true
---

# PROJECT ARCHITECTURE — Royal Suzuky

## Monorepo Structure

This is a **multi-app monorepo** for a motorcycle dealership management system. There is **NO workspace manager** (no Turborepo, Nx, or pnpm workspaces). Each app is independent with its own `node_modules`.

```
d:\suzuky\
├── apps/portal/          → Admin/Dealer web dashboard (Next.js 16)
├── apps/realtime/        → Socket.io realtime server (Node.js)
├── servicestuff/         → Technician mobile app (Vite + Capacitor)
├── prisma/               → (inside apps/portal) — shared schema
├── supabase/             → Supabase config
└── render.yaml           → Deployment blueprint (Render.com)
```

## Component Details

### 1. `apps/portal` — Admin/Dealer Dashboard
| Layer         | Technology |
|---------------|-----------|
| Framework     | **Next.js 16** (App Router) |
| Database ORM  | **Prisma 7** with `@prisma/adapter-pg` (Supabase PostgreSQL) |
| Auth          | Custom **JWT** via `jose` — cookie: `access_token` |
| State (client)| **Zustand** stores in `src/stores/` |
| Data fetching | **TanStack Query** + **TanStack Table** |
| UI library    | **shadcn/ui** (Radix primitives), `lucide-react` icons |
| CSS           | **Tailwind CSS v4** |
| Animations    | **Framer Motion** |
| Validation    | **Zod v4** |
| Realtime      | **socket.io-client** connecting to realtime server |

**Key paths:**
- API routes: `src/app/api/v1/{module}/route.ts`
- Auth system: `src/lib/auth/` (14 files: jwt, roles, session, permissions, etc.)
- Prisma client: `src/lib/prisma/client.ts`
- Middleware: `src/middleware.ts` (route guards) + `src/middlewares/` (API helpers)
- Stores: `src/stores/` (Zustand)
- Types: `src/types/`

**Role-based routing:**
- `/super-admin/*` → Super Admin
- `/admin/showroom/*` → Showroom roles
- `/admin/service/*` → Service roles
- `/dealer/*` → Dealer roles
- `/sales-admin/*` → Sales Admin
- `/service-admin/*` → Service admin pages

### 2. `apps/realtime` — Socket.io Server
| Layer       | Technology |
|-------------|-----------|
| Runtime     | **Node.js 18+** (CommonJS) |
| WebSocket   | **Socket.io 4** |
| Auth        | **jsonwebtoken** (JWT verification) |

- Single file: `server.js`
- Health check: `GET /` or `GET /health`
- Broadcast endpoint: `POST /broadcast` (server-to-server)
- Port: `3001` (default)
- Rooms: `job:{id}`, `dealer:{id}`, `user:{id}`, `technician:{id}`

### 3. `servicestuff` — Technician Mobile App
| Layer       | Technology |
|-------------|-----------|
| Build tool  | **Vite 6** |
| Framework   | **React 19** with **react-router-dom v7** |
| Mobile      | **Capacitor 7** (Android target) |
| Auth        | JWT stored in **Capacitor Preferences** |
| API client  | **Axios** → `portal/api/v1/technician/*` |
| Realtime    | **socket.io-client** → realtime server |
| AI features | **Google GenAI** (Gemini) |

**Key paths:**
- Pages: `pages/` (Dashboard, MyJobs, JobCardDetail, etc.)
- Components: `components/` (BarcodeScanner, PartsSelectionModal, etc.)
- Services: `services/` (api.ts, socket.ts, offline.ts, etc.)
- Auth: `lib/auth.tsx` (AuthProvider) + `lib/auth-client.ts`
- Types: `types.ts`

## How Components Interconnect

```
┌──────────────────┐       API calls        ┌──────────────────┐
│  servicestuff    │ ────────────────────▶  │  portal (API)    │
│  (mobile app)    │  /api/v1/technician/*   │  (Next.js)       │
│                  │                         │                  │
│  socket.io-client│ ◁───────────────────── │  socket.io-client│
└────────┬─────────┘         ▲               └────────┬─────────┘
         │                   │                        │
         │    WebSocket      │    HTTP POST           │ HTTP POST
         │                   │    /broadcast           │ /broadcast
         ▼                   │                        ▼
    ┌──────────────────────────────────────────────────────┐
    │              realtime (Socket.io Server)              │
    │              Rooms: job, dealer, user, technician     │
    └──────────────────────────────────────────────────────┘
```

- **Portal → Realtime**: Portal API routes POST to `REALTIME_URL/broadcast` to emit events.
- **Realtime → Mobile**: Mobile socket client listens for events on technician rooms.
- **Mobile → Portal**: All data operations go through Portal API endpoints.
- **Auth flow**: Mobile authenticates via Portal's `/api/auth/login`, gets JWT, stores in Capacitor Preferences, sends as `Bearer` token.

## Deployment (Render.com)
- Portal: Docker container (standalone Next.js), port 3000
- Realtime: Docker container, port 3001
- Region: Singapore
- Config: `render.yaml` at repo root

## CRITICAL WARNINGS

> [!CAUTION]
> The Prisma schema (`prisma/schema.prisma`) is ~192KB. NEVER try to read or rewrite it entirely — only search for specific models.

> [!WARNING]
> Always use `getCurrentUser()` from `@/lib/auth/get-user.ts` in API routes — it enriches JWT with `dealerId` from the database. Using JWT payload alone misses the `dealerId`.

> [!IMPORTANT]
> This project uses **Prisma 7** with the **client engine** + **pg adapter**. The `PrismaClient` constructor MUST receive an `adapter` parameter. See `src/lib/prisma/client.ts`.
