---
description: Rules for developing the servicestuff technician mobile app (Vite + Capacitor).
globs: servicestuff/**/*
alwaysApply: false
---

# MOBILE DEVELOPMENT RULES — servicestuff (Technician App)

## Technology Stack
- **Vite 6** + **React 19** + **TypeScript**
- **Capacitor 7** for native mobile (Android)
- **react-router-dom v7** for routing
- **Axios** for API calls → Portal's `/api/v1/technician/*`
- **Socket.io-client** for realtime events
- **Capacitor Preferences** for persistent storage (auth tokens)

## Architecture Overview

```
servicestuff/
├── pages/          → Full page components (routes)
├── components/     → Reusable UI components
├── services/       → API client, socket, offline, media, location
├── lib/            → Auth context, env config, router
├── types.ts        → All TypeScript interfaces/enums
└── App.tsx         → Root component with router
```

## MANDATORY RULES

### 1. API Calls — Always through `TechnicianAPI`
All API calls go through `services/api.ts` which is pre-configured with:
- Base URL: `{PORTAL_URL}/api/v1/technician`
- Auto-attached Bearer token from Preferences
- 401 response interceptor (clears token)

```typescript
// ✅ CORRECT — use the pre-built API client
import { TechnicianAPI } from '../services/api';
const { data } = await TechnicianAPI.getJobs({ status: 'in_progress' });

// ❌ WRONG — never call fetch/axios directly
const res = await fetch(`${portalUrl}/api/v1/technician/jobs`);
```

### 2. Auth Token Management
- Stored in **Capacitor Preferences** (not localStorage!)
- Key: `auth_token`
- Set automatically by `auth-client.ts` on login
- Cleared on logout or 401 response
- Read by API interceptor before every request

```typescript
import { Preferences } from '@capacitor/preferences';

// Reading
const { value } = await Preferences.get({ key: 'auth_token' });

// Writing
await Preferences.set({ key: 'auth_token', value: token });

// Deleting
await Preferences.remove({ key: 'auth_token' });
```

### 3. Types — All in `types.ts`
All shared TypeScript interfaces live in `types.ts` at the project root. Do NOT create inline types.

Key types to know:
- `User` — current user (id, name, email, role, staff_id)
- `JobCard` — full job card with nested vehicle, tasks, parts, photos
- `JobStatus` — enum: pending → in_progress → completed → qc_requested → verified
- `RequisitionGroup` — grouped parts request with items
- `PartsRequest` — individual part in a requisition
- `DashboardStats` — dashboard metrics
- `TechnicianProfile` — technician profile with stats

### 4. Adding New Pages
1. Create page component in `pages/NewPage.tsx`
2. Add route to `App.tsx` router
3. Add route path to `RoutePath` enum in `types.ts`
4. Add navigation link in `components/Sidebar.tsx`

### 5. API Response Shape — MUST match `types.ts`
When the portal API returns data, the shape MUST match the TypeScript types in `types.ts`. If there's a mismatch, fix the API (not the type).

Common mismatches that have caused bugs:
- `requisitions` endpoint returning flat items vs grouped `RequisitionGroup[]`
- `jobs` endpoint missing nested `vehicle` or `tasks` data
- Price fields returning Prisma Decimal objects instead of numbers

### 6. Socket.io — Use `SocketService` singleton
```typescript
import { SocketService } from '../services/socket';

const socket = SocketService.getInstance();
await socket.connect(staffId);

socket.on('requisition:status_changed', (data) => {
    // Handle event
});

// Cleanup on unmount
socket.off('requisition:status_changed');
```

### 7. Offline Support
- User profile cached via `OfflineService` on login
- If portal is unreachable, cached profile is used
- Background sync not yet implemented — data must be re-fetched when online

### 8. Environment Configuration
Environment variables use `VITE_` prefix:
- `VITE_PORTAL_API_URL` — Portal URL (default: localhost:3000, prod: render URL)
- `VITE_REALTIME_URL` — Realtime server URL (default: localhost:3001)
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key
- `VITE_GEMINI_API_KEY` — Google Gemini API key

Set in `.env.local` (gitignored).
