# Royal Suzuky — Full Project File Index
> Use this as your navigation map. Every key file and folder is listed here.

---

## APPS OVERVIEW

| App | Path | URL | Purpose |
|-----|------|-----|---------|
| portal | `apps/portal` | localhost:3000 | Admin/Dealer/Service web dashboard (Next.js 16) |
| realtime | `apps/realtime` | localhost:3001 | Socket.io event relay server (Node.js) |
| storefront | `apps/storefront` | — | Customer-facing storefront (Next.js) |
| servicestuff | `servicestuff/` | localhost:5173 | Technician mobile app (Vite + Capacitor) |

---

## apps/portal — File Map

### API Routes (`src/app/api/`)
```
api/
├── auth/                         → Login, logout, register, me, OTP, MFA
├── v1/
│   ├── workshop/
│   │   ├── jobs/[id]/            → Job card CRUD
│   │   ├── requisitions/[id]/    → Parts requisitions
│   │   ├── invoices/             → Service invoices
│   │   ├── inventory/            → Parts inventory
│   │   ├── appointments/         → Scheduling
│   │   ├── attendance/           → Staff attendance
│   │   ├── staff/                → Staff management
│   │   ├── qc/                   → Quality control
│   │   ├── finance/              → Financial data
│   │   ├── sales/                → Sales records
│   │   ├── scheduling/           → Job scheduling
│   │   ├── settings/             → Workshop settings
│   │   ├── warranty/             → Warranty claims
│   │   ├── escalation/           → Job escalations
│   │   ├── analytics/            → Workshop analytics
│   │   ├── overview/             → Workshop overview
│   │   ├── create-job/           → Job card creation
│   │   └── qr-code/              → QR code generation
│   ├── technician/
│   │   ├── jobs/                 → Mobile: job list & detail
│   │   ├── dashboard/            → Mobile: dashboard stats
│   │   ├── attendance/           → Mobile: clock in/out
│   │   ├── breaks/               → Mobile: break tracking
│   │   ├── requisitions/         → Mobile: parts requests
│   │   ├── products/             → Mobile: parts catalog
│   │   ├── categories/           → Mobile: parts categories
│   │   ├── profile/              → Mobile: technician profile
│   │   ├── location/             → Mobile: GPS tracking
│   │   ├── notifications/        → Mobile: push notifications
│   │   ├── push-tokens/          → Mobile: FCM token registration
│   │   └── reports/              → Mobile: performance reports
│   ├── customer/
│   │   ├── vehicles/             → Customer vehicles
│   │   ├── records/              → Service history
│   │   ├── appointments/         → Book appointments
│   │   ├── track/                → Live job tracking
│   │   ├── search/               → Customer search
│   │   └── feedback/             → Feedback submission
│   ├── dashboard/
│   │   └── stats/                → Dashboard KPIs
│   └── [entity]/                 → Generic entity API
```

### Pages (`src/app/`)
```
app/
├── (auth)/                       → Login, register pages
├── (auth-service)/               → Service auth pages
├── admin/
│   ├── dashboard/                → Admin dashboard
│   ├── inventory/                → Stock, products, parts-issue, adjustments
│   ├── crm/                      → Customers, vehicles, complaints, reminders
│   ├── finance/                  → Cashbook, expenses, deposits, reports
│   ├── pos/                      → Counter-sell, invoices, quotations, billing
│   ├── catalog/                  → Product catalog
│   ├── analytics/                → Analytics
│   ├── orders/                   → Orders
│   ├── transactions/             → Transactions
│   ├── users-service/            → User management
│   ├── settings/                 → Admin settings
│   ├── settings-service/         → Service settings
│   └── ...
├── service-admin/
│   ├── (dashboard)/              → Service admin dashboard
│   ├── customer/                 → Service customer management
│   └── pos/                      → Service POS
├── super-admin/
│   ├── dashboard/
│   ├── dealers/
│   ├── orders/
│   ├── payments/
│   ├── roles-units/
│   └── users/
├── dealer/
│   ├── dashboard/
│   ├── analytics/
│   ├── finance/
│   ├── marketing/
│   ├── notifications/
│   ├── orders/
│   ├── pos/
│   ├── products/
│   ├── purchase/
│   ├── reports/
│   ├── sales/
│   ├── settings/
│   ├── stock/
│   ├── sub-users/
│   ├── subscription/
│   └── vendors/
└── customer/                     → Customer portal pages
```

### Key Source Files (`src/`)
```
src/
├── lib/
│   ├── auth/
│   │   ├── get-user.ts           ← ALWAYS use this in API routes
│   │   ├── get-technician.ts     ← For technician-only routes
│   │   ├── jwt.ts                ← JWT sign/verify
│   │   ├── roles.ts              ← All role definitions
│   │   ├── permissions.ts        ← Permission matrix
│   │   ├── session.ts            ← Session utilities
│   │   └── middleware.ts         ← Auth middleware helper
│   ├── prisma/
│   │   └── client.ts             ← PrismaClient with pg adapter (REQUIRED)
│   ├── socket-server.ts          ← broadcastEvent() helper
│   ├── socket.ts                 ← Portal socket client
│   └── utils.ts                  ← General utilities
├── stores/
│   ├── authStore.ts
│   ├── workshopStore.ts
│   ├── inventoryStore.ts
│   ├── posStore.ts
│   ├── crmStore.ts
│   ├── customerStore.ts
│   └── appointmentStore.ts
├── types/
│   ├── index.ts                  ← Re-exports all types
│   ├── workshop.ts               ← Workshop types
│   ├── inventory.ts              ← Inventory types
│   ├── finance.ts                ← Finance types
│   ├── crm.ts                    ← CRM types
│   └── pos.ts                    ← POS types
├── components/
│   ├── ui/                       ← shadcn/ui components
│   ├── workshop/                 ← Workshop UI components
│   ├── dashboard/                ← Dashboard widgets
│   ├── layout/                   ← Layout components
│   └── ...
├── middleware.ts                  ← Route protection
└── middlewares/                   ← API middleware helpers
```

### Config Files
```
apps/portal/
├── prisma.config.ts               ← DB connection (Prisma 7) — NOT schema.prisma
├── prisma/schema.prisma           ← Data models (~192KB, DO NOT rewrite fully)
├── .env                           ← Base env vars (DATABASE_URL, DIRECT_URL)
├── .env.local                     ← Local overrides (JWT_SECRET, etc.)
├── next.config.ts
└── tailwind.config.mjs / postcss.config.mjs
```

---

## apps/realtime — File Map
```
apps/realtime/
├── server.js                      ← Entire server (single file)
├── package.json
└── Dockerfile
```
- Health: `GET /health`
- Broadcast: `POST /broadcast` (called by portal API after mutations)
- Rooms: `job:{id}`, `dealer:{id}`, `user:{id}`, `technician:{id}`

---

## apps/storefront — File Map
```
apps/storefront/src/
├── app/
│   ├── (main)/                    ← Public storefront pages
│   └── dealers/                   ← Dealer-specific pages
├── components/
├── hooks/
└── lib/
```

---

## servicestuff (Mobile App) — File Map
```
servicestuff/
├── pages/
│   ├── Dashboard.tsx
│   ├── MyJobs.tsx
│   ├── JobCardDetail.tsx
│   ├── Requisitions.tsx
│   ├── Attendance.tsx
│   ├── Performance.tsx
│   ├── WorkHistory.tsx
│   ├── Notifications.tsx
│   ├── Profile.tsx
│   ├── Settings.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Splash.tsx
│   └── Welcome.tsx
├── components/
│   ├── TopBar.tsx
│   ├── BottomBar.tsx
│   ├── Sidebar.tsx
│   ├── BarcodeScanner.tsx
│   ├── PartsSelectionModal.tsx
│   ├── RequisitionCart.tsx
│   ├── DashboardJobCards.tsx
│   ├── LocationTracker.tsx
│   └── ...
├── services/
│   ├── api.ts                     ← TechnicianAPI — ALL API calls go here
│   ├── socket.ts                  ← SocketService singleton
│   ├── offline.ts                 ← Offline cache
│   ├── biometric.ts               ← Biometric auth
│   ├── location.ts                ← GPS tracking
│   ├── media.ts                   ← Camera/media
│   └── geminiService.ts           ← AI features
├── lib/
│   ├── auth.tsx                   ← AuthProvider context
│   └── auth-client.ts             ← Login/logout logic
├── types.ts                       ← ALL shared types (RoutePath, JobCard, etc.)
└── App.tsx                        ← Router root
```

---

## Quick Reference — Where to Look for What

| I need to... | Go to |
|---|---|
| Add/fix an API endpoint | `apps/portal/src/app/api/v1/{module}/route.ts` |
| Fix auth in API | `apps/portal/src/lib/auth/get-user.ts` |
| Fix Prisma client | `apps/portal/src/lib/prisma/client.ts` |
| Add/fix mobile page | `servicestuff/pages/{Page}.tsx` |
| Add mobile API call | `servicestuff/services/api.ts` |
| Add/fix mobile types | `servicestuff/types.ts` |
| Fix realtime events | `apps/realtime/server.js` + `apps/portal/src/lib/socket-server.ts` |
| Fix portal types | `apps/portal/src/types/{module}.ts` |
| Fix role/permission | `apps/portal/src/lib/auth/roles.ts` + `permissions.ts` |
| Change DB schema | `apps/portal/prisma/schema.prisma` → `npx prisma db push` → `npx prisma generate` |
| Fix DB connection | `apps/portal/prisma.config.ts` + `.env` |
| Fix Zustand store | `apps/portal/src/stores/{module}Store.ts` |
