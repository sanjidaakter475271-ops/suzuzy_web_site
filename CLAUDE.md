# Royal Suzuky — Claude Code Project Rules


This file is automatically loaded by Claude Code. It imports all project rules and workflows from `.agent/`.

> **Full file map:** See [.agent/project-index.md](.agent/project-index.md) for every file and folder in the project.
> **Bug tracker:** See [.agent/bugs.md](.agent/bugs.md) — log and track all known bugs here.

---

## Project Architecture

This is a **multi-app monorepo** for a motorcycle dealership management system with **NO workspace manager** (no Turborepo, Nx, or pnpm workspaces). Each app is independent with its own `node_modules`.

```
d:\suzuzy_web_site\
├── apps/portal/          → Admin/Dealer web dashboard (Next.js 16)
├── apps/realtime/        → Socket.io realtime server (Node.js)
├── servicestuff-rn/      → Technician mobile app (React Native + Expo)
├── servicestuff/         → Legacy Technician mobile app (Capacitor - DEPRECATED)
└── render.yaml           → Deployment blueprint (Render.com)
```

### Tech Stack

| App | Key Tech |
|-----|----------|
| `apps/portal` | Next.js 16 (App Router), Prisma 7 + pg adapter, Supabase PostgreSQL, JWT auth (jose), Zustand, TanStack Query, shadcn/ui, Tailwind CSS v4, Zod v4 |
| `apps/realtime` | Node.js 18+, Socket.io 4, CommonJS |
| `servicestuff-rn` | React Native 0.81.5, Expo 54, React Native Reanimated 4.1.7, StyleSheet (NativeWind removed), Worklets 0.5.1 |
| `servicestuff` | (DEPRECATED) Vite 6, React 19, Capacitor 7 (Android) |

### CRITICAL WARNINGS

> The Prisma schema (`prisma/schema.prisma`) is ~192KB. NEVER try to read or rewrite it entirely — only search for specific models.

> Always use `getCurrentUser()` from `@/lib/auth/get-user.ts` in API routes — it enriches JWT with `dealerId` from the database. Using JWT payload alone misses the `dealerId`.

> This project uses **Prisma 7** with the **client engine** + **pg adapter**. The `PrismaClient` constructor MUST receive an `adapter` parameter.

---

## PRISMA 7 DATABASE RULES

> **CRITICAL**: This project uses **Prisma 7.4.0** with the **client engine** and **`@prisma/adapter-pg`**. Prisma 7 has BREAKING CHANGES from Prisma 5/6.

### Configuration Architecture

In Prisma 7, **ALL database connection URLs live in `prisma.config.ts`**, NOT in `schema.prisma`.

```typescript
// ✅ CORRECT — apps/portal/prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: env("DIRECT_URL"), // Use DIRECT_URL for CLI operations
  },
});
```

```prisma
// ✅ CORRECT — schema.prisma datasource block (Prisma 7)
datasource db {
  provider = "postgresql"
  schemas  = ["auth", "public"]
}
// ❌ WRONG — url/directUrl are REMOVED in Prisma 7
```

### Environment Variables

| Variable | Port | Used By |
|----------|------|---------|
| `DATABASE_URL` | `6543` | Runtime PrismaClient (pooled, transaction mode) |
| `DIRECT_URL` | `5432` | Prisma CLI (`db push`, `db pull`, `generate`) |

Password contains special chars (`Nazmul@2@@@`) — must be URL-encoded (`@` → `%40`).

**NEVER use the pooled connection (port 6543) for DDL operations.**

### CLI Commands (run from `apps/portal`)

```bash
npx prisma validate
npx prisma db push      # apply schema changes
npx prisma generate     # regenerate client types
npx prisma db pull      # introspect from DB
```

### Post-`db pull` Fixes (MANDATORY)

After every `npx prisma db pull`, remove `where` clauses from `@unique` in the `auth.users` model:

```prisma
// ❌ BROKEN — remove the `where(...)` part
email String? @unique(map: "users_email_partial_key", where: raw("..."))

// ✅ FIXED
email String? @unique(map: "users_email_partial_key")
```

Also remove `multiSchema` from `previewFeatures` if `db pull` re-adds it (it's now GA in Prisma 7).

### Generator Block

```prisma
// ✅ CORRECT — Prisma 7
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["partialIndexes"]  // multiSchema is GA — do NOT include it
}
```

### Runtime PrismaClient Setup

```typescript
// src/lib/prisma/client.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 20 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }); // adapter is REQUIRED in Prisma 7
```

### Decimal Field Handling

Prisma `Decimal` fields MUST be converted before sending to frontend:

```typescript
// ✅ CORRECT
const safe = data.map(d => ({ ...d, price: d.price ? Number(d.price) : 0 }));
return NextResponse.json(safe);

// ❌ WRONG — raw Prisma Decimal objects break JSON serialization
return NextResponse.json(data);
```

---

## API DEVELOPMENT RULES

All API routes live under `apps/portal/src/app/api/v1/{module}/route.ts`.

### Mandatory Rules

1. **Auth** — Always use `getCurrentUser()` from `@/lib/auth/get-user`:
   ```typescript
   const user = await getCurrentUser();
   // user = { userId, email, role, dealerId, fullName }
   ```

2. **Dealer scoping** — ALL queries MUST be scoped to `user.dealerId`:
   ```typescript
   // ✅ CORRECT
   const jobs = await prisma.service_job_cards.findMany({
       where: { dealer_id: user.dealerId },
   });
   ```

3. **Prisma Decimal → Number** — Convert ALL Decimal fields before responding.

4. **Zod validation** for POST/PATCH/PUT — use `safeParse`, return 400 on failure.

5. **Response shape** must match frontend types (`src/types/{module}.ts` or `servicestuff/types.ts`).

6. **Realtime event** after mutations:
   ```typescript
   await fetch(`${process.env.NEXT_PUBLIC_REALTIME_URL}/broadcast`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ event: 'domain:action', data: { dealer_id: user.dealerId, ...payload } })
   });
   ```

7. **Dynamic route params** (Next.js 16 — params is a Promise):
   ```typescript
   export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
       const { id } = await params;
   }
   ```

### API Module Organization

| Module | Path | Purpose |
|--------|------|---------|
| workshop | `/api/v1/workshop/*` | Job cards, requisitions, invoices, scheduling |
| technician | `/api/v1/technician/*` | Mobile app endpoints |
| customer | `/api/v1/customer/*` | Customer-facing |
| dashboard | `/api/v1/dashboard/*` | Stats/overview |
| auth | `/api/auth/*` | Login, register, me, logout |

---

## ERROR HANDLING & RESPONSE FORMAT

### Success Response
```typescript
return NextResponse.json({ success: true, data: result }, { status: 200 });
return NextResponse.json({ success: true, data: newRecord }, { status: 201 });
```

### Error Response
```typescript
// Validation
return NextResponse.json({ success: false, error: "Invalid input", details: zod.flatten() }, { status: 400 });
// Auth
return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
// Server
return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
```

**NEVER return raw Prisma error messages to the client.** Always log with `console.error("[TAG]", error)`.

### Prisma-specific errors
```typescript
import { Prisma } from "@prisma/client";
if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return NextResponse.json({ error: "Already exists." }, { status: 409 });
    if (error.code === 'P2025') return NextResponse.json({ error: "Not found." }, { status: 404 });
}
```

---

## AUTHENTICATION & RBAC RULES

- Method: JWT stored in HTTP-only cookies (`auth_token`)
- Middleware: `src/middleware.ts` protects routes
- **Never trust the client** — every secured route MUST call `getCurrentUser()` before DB operations
- Always scope data to `user.dealerId` (multi-tenant)
- Passwords MUST be hashed with bcrypt. Never return hashes. Use `jwt.verify` not `jwt.decode`.

---

## FRONTEND UI GUIDELINES (apps/portal)

- Default to **Server Components** — only use `"use client"` for state/hooks/interactions
- Styling: **Tailwind CSS** only — avoid custom CSS files
- Components: use existing `src/components/ui` (shadcn/ui), `cn()` for dynamic classNames, `lucide-react` for icons
- Forms: React Hook Form + Zod resolvers, always disable submit during `isSubmitting`
- Mutations: use `router.refresh()` after success, toast errors with `sonner`/`react-hot-toast`

---

## MOBILE DEVELOPMENT RULES (servicestuff-rn)

### Mandatory Rules

1. **Architecture**: Use **Expo Router** for file-based routing inside `app/`. **New Architecture (Fabric) MUST be enabled** (`newArchEnabled: true` in `app.json`) for Reanimated 4 compatibility.
2. **UI Components**: Always prefer native components (`View`, `Text`, `TouchableOpacity`, `TextInput`) over web elements. Use reusable UI primitives from `components/ui/` (e.g., `StatusBadge.tsx`, `Loading.tsx`).
3. **Performance**: Use **FlatList** for lists (Dashboard, MyJobs) with appropriate optimizations. Use `expo-image` for high-performance image caching.
4. **Styling**: Use standard **React Native StyleSheet.create** combined with the centralized theme in `constants/theme.ts`. NativeWind has been removed to ensure maximum stability and remove build-time patching complexity.
5. **Animations**: Use **Moti** or **React Native Reanimated**. 
   * **CRITICAL**: For Expo Go SDK 54, you MUST use `react-native-reanimated@4.1.7` with `react-native-worklets@0.5.1`. Version mismatch will cause `NullPointerException`.
   * **Babel Config**: Plugins for worklets and reanimated are now **automatically handled** by `babel-preset-expo` in SDK 54. Do NOT add them manually to `babel.config.js` to avoid `Duplicate plugin/preset detected` errors.
6. **Babel Config**: Plugins MUST NOT be manually listed if they are already provided by the preset. Ensure `babel.config.js` only contains the `module-resolver`.
7. **Entry File**: `import 'react-native-reanimated';` MUST be at the very top of `app/_layout.tsx`.
8. **API calls**: Use `TechnicianAPI` from `services/api.ts`.
9. **Auth**: Use `useAuth()` hook. Session is stored in **SecureStore** via `auth-client.ts`. Access token is synchronized with socket connection.
10. **Storage**: Use **MMKV** via `src/lib/storage.ts`. 
    * **Expo Go Compatibility**: To prevent the `NitroModules` crash in Expo Go (which lacks the native Nitro bridge), MMKV MUST be **lazy-loaded** using a conditional `require('react-native-mmkv')` inside a `try/catch` block.
11. **Native APIs**: Use Expo modules (e.g., `expo-camera`, `expo-location`, `expo-local-authentication`).
12. **Environment**: Config lives in `lib/env.ts` (proxied via `expo-constants`). Prioritize `EXPO_PUBLIC_` variables for production/dev overrides.

### Build & Deploy
- Use **GitHub Actions** for automated Android builds (`.github/workflows/android_build_rn.yml`).
- Use **EAS Build** for manual or local APK generation.
- Local dev: `npx expo start`.

### 🛡️ WINDOWS BUILD & TAILWIND v4 FIXES
- **NitroModules Crash**: If `expo start` fails with `The native "NitroModules" Turbo/Native-Module could not be found` in Expo Go, use **lazy loading** in `storage.ts` via `require('react-native-mmkv')` inside a `try/catch` block.
- **Babel Duplication**: If `Android Bundling failed` with `Duplicate plugin/preset detected` for `react-native-worklets` or `react-native-reanimated`, **REMOVE them manually** from `babel.config.js`. `babel-preset-expo@54` now handles their injection automatically.
- **Native Modules**: If `eas build` or `expo start` fails with `Cannot find module '...lightningcss.node'`, manually copy the binary from `node_modules/lightningcss-win32-x64-msvc/` to `node_modules/lightningcss/` and `node_modules/react-native-css-interop/node_modules/lightningcss/`. 
- **ESM Loader Bug**: If Metro fails with `ERR_UNSUPPORTED_ESM_URL_SCHEME` on Windows, ensure the patch in `metro-config/src/loadConfig.js` (using `pathToFileURL`) is applied via `patch-package`.

### ⚙️ EXPO MOBILE BUILD PROCESS (EAS)
1. **Interactive Build**: `npx eas-cli build --platform android --profile preview` (Follow terminal prompts for Keystore & Credentials).
2. **Local Build (Offline APK)**: `npx eas-cli build --platform android --profile preview --local` (Requires Android Studio/JRE installed locally).
3. **Automated (Git Push)**: Once GitHub is connected and the base directory is set to `servicestuff-rn`, any push to `main` triggers the EAS Workflow defined in `.eas/workflows/`.
4. **Environment Variables**: Add all `.env` secrets to the **Expo Dashboard > Settings > Secrets** tab.
5. **CI/CD Security**: For GitHub Actions, ensure `EXPO_TOKEN` is added to repository secrets. Use `EAS_SKIP_AUTO_FINGERPRINT=1` to speed up CI builds.

---

## WORKFLOWS

### Local Development
1. Terminal 1: `cd apps/realtime && npm start`
2. Terminal 2: `cd apps/portal && npm run dev`
3. Terminal 3: `cd servicestuff-rn && npx expo start`

### New API Route
1. Determine module (workshop/technician/customer/dashboard)
2. Check frontend type first (`src/types/{module}.ts` or `servicestuff/types.ts`)
3. Find Prisma model with `Grep`
4. Create `src/app/api/v1/{module}/{endpoint}/route.ts` using standard template
5. Add mobile API method to `servicestuff/services/api.ts` (if technician endpoint)
6. Emit realtime event (if mutation)
7. **AI Logic**: Move expensive AI SDK logic (like Gemini) to backend API (`/api/v1/technician/diagnose`) to reduce mobile app size and secure API keys.

### Prisma Schema Change
1. Edit only the specific model/section needed
2. `npx prisma validate`
3. `npx prisma db push` (read warnings carefully!)
4. `npx prisma generate`

### Database Migration (Production)
- Day-to-day: `npx prisma db push`
- For migration files: `npx prisma migrate diff --from-database-url $env:DATABASE_URL --to-schema-datamodel prisma\schema.prisma --script`

### Deploy to Render.com
1. `npx prisma generate && npm run build` (fix any errors)
2. `npx tsc --noEmit`
3. `git push origin main` (auto-deploys via `render.yaml`)
4. Verify: portal at `https://royal-suzuky-portal.onrender.com/`, realtime at `https://suzuky-realtime.onrender.com/health`

### New Mobile Page
1. Add to `RoutePath` enum in `servicestuff/types.ts`
2. Create `servicestuff/pages/NewPage.tsx`
3. Add `<Route>` in `servicestuff/App.tsx`
4. Add nav link in `servicestuff/components/Sidebar.tsx`
5. Add API method to `servicestuff/services/api.ts` if needed

### Debug API Issues
- **401**: Check Capacitor Preferences has `auth_token`; verify `getCurrentUser()` usage; check JWT_SECRET matches
- **Data mismatch**: Compare API response shape vs `servicestuff/types.ts` interface; check Decimal conversion and `include` clauses
- **500**: Check portal terminal logs; check Prisma model name; check `dealerId` is not null
- **Realtime not arriving**: Check `localhost:3001/health`; verify `/broadcast` POST; check routing keys in event data

---

## SERVICESTUFF DEEP MAP (Technician Mobile App)

> Complete file-by-file reference. Use this to find the EXACT file to fix any bug.

### Routing (App.tsx)

Uses `HashRouter` via `lib/router.tsx`. All routes wrapped in `ProtectedRoute` (redirects to LOGIN if no user).

| Route Path | Page Component | Props |
|---|---|---|
| `/splash` | `Splash` | — |
| `/welcome` | `Welcome` | — |
| `/login` | `Login` | `onLogin` |
| `/register` | `Register` | `onLogin` |
| `/` (dashboard) | `Dashboard` | `onMenuClick` |
| `/settings` | `Settings` | `onMenuClick, userName, onToggleTheme, isDark` |
| `/job/:id` | `JobCardDetail` | — (uses `useParams`) |
| `/my-jobs` | `MyJobs` | `onMenuClick` |
| `/profile` | `Profile` | `onMenuClick` |
| `/attendance` | `Attendance` | `onMenuClick` |
| `/performance` | `Performance` | `onMenuClick` |
| `/work-history` | `WorkHistory` | `onMenuClick` |
| `/notifications` | `Notifications` | `onMenuClick` |
| `/parts-request` | `Requisitions` | `onMenuClick` |

**Global wrappers** (rendered when authenticated):
- `PermissionManager` — requests camera + GPS permissions on first run
- `LocationTracker` — sends GPS every 5 min via REST + Socket
- `PushNotificationManager` — disabled (returns null, no Firebase)
- `OfflineBanner` — shows amber bar when `navigator.onLine` is false
- `BottomBar` — fixed bottom nav (hidden on job detail pages)

### Pages — What Each One Does & API Calls

| Page | File | API Calls | Socket Events | Key State |
|---|---|---|---|---|
| **Dashboard** | `pages/Dashboard.tsx` | `getDashboardStats()`, `getAttendanceStatus()`, `getJobs({limit:5})`, `clockIn()`, `clockOut()` | Listens: `job_cards:changed`, `order:update`, `inventory:changed`, `attendance:changed`, `attendance:shift_start`, `attendance:shift_end` | `tasks: JobCard[]`, `stats: DashboardStats`, `attendanceStatus: AttendanceStatus` |
| **MyJobs** | `pages/MyJobs.tsx` | `getJobs()` | Listens: `order:update`, `job_cards:changed`, `inventory:changed` | `jobs: JobCard[]`, tabs: all/pending/active/done, search filter |
| **JobCardDetail** | `pages/JobCardDetail.tsx` | `getJobDetail(id)`, `getPartsHistory()`, `updateJobStatus()`, `updateChecklist()`, `addNote()`, `requestQC()`, `uploadPhoto()` | Listens: `order:update`, `job_cards:changed`, `requisition:created/approved/rejected` | `job: JobCard`, tabs: summary/checklist/parts/photos/notes, `requisitions: PartsRequest[]` |
| **Attendance** | `pages/Attendance.tsx` | `getAttendanceStatus()`, `getAttendanceHistory()`, `clockIn()`, `clockOut()`, `startShift()`, `endShift()` | None | `status: AttendanceStatus`, `history: TechnicianAttendance[]`, live timer |
| **Requisitions** | `pages/Requisitions.tsx` | `getPartsHistory()` | None | `requisitions: RequisitionGroup[]`, search filter |
| **Profile** | `pages/Profile.tsx` | `getDashboardStats()`, `getProfile()` | None | `stats`, `profile`, logout button |
| **Performance** | `pages/Performance.tsx` | `getDashboardStats()` | None | `stats: DashboardStats`, offline fallback |
| **WorkHistory** | `pages/WorkHistory.tsx` | `getJobs({status: 'completed', limit: 50})` | None | `jobs: JobCard[]`, search filter |
| **Notifications** | `pages/Notifications.tsx` | `getNotifications()`, `markNotificationsRead()`, `deleteNotifications()` | Listens: socket notifications | `notifications: Notification[]` |
| **Login** | `pages/Login.tsx` | `signIn()` via AuthProvider | None | email/password, biometric auto-login, role check (`super_admin`, `service_admin`, `service_technician` only) |
| **Settings** | `pages/Settings.tsx` | `getProfile()`, `updateProfile()` | None | profile edit, dark mode toggle, biometric toggle, password change |
| **Splash/Welcome** | `pages/Splash.tsx`, `Welcome.tsx` | None | None | Onboarding flow, stores `servicemate_onboarded` in localStorage |

### Components — What Each One Does

| Component | File | Purpose | Used By |
|---|---|---|---|
| **TopBar** | `components/TopBar.tsx` | App header with back button, title, breadcrumbs, notification bell (checks unread via API + socket) | Every page |
| **BottomBar** | `components/BottomBar.tsx` | Fixed bottom nav: Home, Jobs, Work, Me, Set. Uses `framer-motion` layoutId for active indicator | App.tsx (hidden on job detail) |
| **Sidebar** | `components/Sidebar.tsx` | Slide-out drawer menu (Dashboard, My Jobs, Attendance, Parts, Work History, Performance, Settings, Logout) | Not currently used in App.tsx (replaced by BottomBar) |
| **BarcodeScanner** | `components/BarcodeScanner.tsx` | Native barcode scanning via `@capacitor-mlkit/barcode-scanning`. Downloads Google module if needed. Falls back to error on web. | Dashboard (attendance QR + VIN scan), Attendance (clock in/out QR) |
| **PartsSelectionModal** | `components/PartsSelectionModal.tsx` | 3-step modal: Category → Products → Cart. Uses `getCategories()`, `getProductsByCategory()`. Submits via `requestParts()` | JobCardDetail (parts tab) |
| **RequisitionCart** | `components/RequisitionCart.tsx` | Cart review UI for parts requisition. Shows items, quantities, prices, total. Submit button | PartsSelectionModal (step 3) |
| **DashboardJobCards** | `components/DashboardJobCards.tsx` | Lazy-loaded card list for recent tasks on dashboard. Uses `React.memo` for performance | Dashboard |
| **LocationTracker** | `components/LocationTracker.tsx` | Invisible component. Sends GPS every 5 min via `TechnicianAPI.updateLocation()` + `socket.emit('technician:location')` | App.tsx (after permissions) |
| **OfflineBanner** | `components/OfflineBanner.tsx` | Amber banner when offline. Uses `navigator.onLine` events | App.tsx (inside ProtectedRoute) |
| **PushNotificationManager** | `components/PushNotificationManager.tsx` | **DISABLED** — returns null. Firebase/FCM not used. Realtime via Socket.io instead | App.tsx |
| **PermissionManager** | `components/PermissionManager.tsx` | First-run permission request screen (Camera + GPS). Stores `permissions_requested` in Preferences | App.tsx (before LocationTracker) |
| **Skeleton** | `components/Skeleton.tsx` | Animated loading placeholders: `Skeleton`, `DashboardSkeleton`, `JobCardSkeleton`, `DetailSkeleton` | Dashboard, MyJobs, JobCardDetail |

### Services — Every API Method & Service

#### `services/api.ts` — TechnicianAPI (ALL endpoints)
Base URL: `{PORTAL_API_URL}/api/v1/technician`

| Method | HTTP | Endpoint | Used By |
|---|---|---|---|
| `getDashboardStats()` | GET | `/dashboard` | Dashboard, Profile, Performance |
| `getJobs(params?)` | GET | `/jobs` | Dashboard, MyJobs, WorkHistory |
| `getJobDetail(id)` | GET | `/jobs/{id}` | JobCardDetail |
| `updateJobStatus(id, status, location?)` | POST | `/jobs/{id}/status` | JobCardDetail |
| `logTime(jobId, eventType, location?)` | POST | `/jobs/{jobId}/time` | JobCardDetail |
| `logBreak(timeLogId, breakType)` | POST | `/breaks` | JobCardDetail |
| `updateChecklist(jobId, items)` | PATCH | `/jobs/{jobId}/checklist` | JobCardDetail |
| `addPartUsage(jobId, variantId, qty, price?)` | POST | `/jobs/{jobId}/parts` | JobCardDetail |
| `requestParts(jobId, items)` | POST | `/requisitions` | PartsSelectionModal |
| `getPartsHistory()` | GET | `/requisitions` | Requisitions, JobCardDetail |
| `updateRequisition(id, qty)` | PATCH | `/requisitions/{id}` | JobCardDetail |
| `deleteRequisition(id)` | DELETE | `/requisitions/{id}` | JobCardDetail |
| `getCategories()` | GET | `/categories` | PartsSelectionModal |
| `getProductsByCategory(catId)` | GET | `/products?categoryId={catId}` | PartsSelectionModal |
| `getProductDetail(id)` | GET | `/products/{id}` | PartsSelectionModal |
| `getProductVariants(productId)` | GET | `/products/{productId}/variants` | PartsSelectionModal |
| `uploadPhoto(jobId, data)` | POST | `/jobs/{jobId}/photos` | JobCardDetail |
| `addNote(jobId, note)` | POST | `/jobs/{jobId}/notes` | JobCardDetail |
| `requestQC(jobId, notes?)` | POST | `/jobs/{jobId}/qc` | JobCardDetail |
| `clockIn(location?, qr?, deviceId?)` | POST | `/attendance/clock-in` | Dashboard, Attendance |
| `clockOut(location?, qr?)` | POST | `/attendance/clock-out` | Dashboard, Attendance |
| `getAttendanceStatus()` | GET | `/attendance/status` | Dashboard, Attendance |
| `startShift()` | POST | `/attendance/start-shift` | Attendance |
| `endShift()` | POST | `/attendance/end-shift` | Attendance |
| `getAttendanceHistory()` | GET | `/attendance` | Attendance |
| `getDateStats(date)` | GET | `/attendance/stats-by-date?date={date}` | Attendance |
| `getProfile()` | GET | `/profile` | Profile, Settings |
| `updateProfile(data)` | PATCH | `/profile` | Settings |
| `reportIssue(data)` | POST | `/issues` | — (not wired to UI yet) |
| `updateLocation(lat, lng)` | POST | `/location` | LocationTracker |
| `registerPushToken(token, type, name?)` | POST | `/push-tokens` | PushNotificationManager (disabled) |
| `removePushToken(token)` | DELETE | `/push-tokens` | PushNotificationManager (disabled) |
| `getNotifications()` | GET | `/notifications` | TopBar, Notifications |
| `markNotificationsRead(id?)` | PATCH | `/notifications` | Notifications |
| `deleteNotifications(id?)` | DELETE | `/notifications` | Notifications |

**Interceptors:**
- Request: Adds `Bearer {token}` from Capacitor Preferences
- Response success: Caches GET responses in Preferences (`cache_{url}`)
- Response 401: Clears token + cached profile, redirects to `#/login`
- Response 500/network error: Retries 2x with exponential backoff, then falls back to cached data for GET requests

#### `services/socket.ts` — SocketService (Singleton)
- Connects to `ENV.REALTIME_URL` with JWT auth
- Emits `join:technician` with `staffId` on connect
- Methods: `connect(staffId)`, `disconnect()`, `on(event, cb)`, `off(event, cb)`, `emit(event, data)`

#### `services/offline.ts` — OfflineService (Singleton)
- Listens to `@capacitor/network` for connectivity changes
- Auto-syncs queued actions when back online (status updates, checklist, notes)
- Caches: jobs list, job details, dashboard stats, user profile (24h expiry)

#### `services/location.ts` — LocationService (Singleton)
- Returns `{lat, lng}` via `@capacitor/geolocation`
- Returns `{lat: 0, lng: 0}` on web or if permission denied

#### `services/media.ts` — MediaService (Static)
- Uploads images to Supabase Storage bucket `service-docs`
- Compresses to JPEG (max 1024px width, 0.7 quality) before upload

#### `services/biometric.ts` — BiometricService (Static)
- Uses `@aparajita/capacitor-biometric-auth`
- Stores credentials in Preferences (Base64 encoded — NOT secure for production)
- Tracks fail count, auto-disables after failures

#### `services/geminiService.ts` — `diagnoseIssue()`
- Calls Google Gemini (`gemini-3-flash-preview`) for AI vehicle diagnostics
- Used in JobCardDetail for AI-assisted issue diagnosis

### Lib — Auth & Config

| File | Purpose |
|---|---|
| `lib/auth.tsx` | `AuthProvider` context + `useAuth()` hook. Manages user/session state. On mount: calls `getMe()`, falls back to cached profile if offline. Handles online→offline transitions. |
| `lib/auth-client.ts` | Raw auth HTTP calls to portal: `signIn.email()` → `POST /api/auth/login`, `signUp.email()` → `POST /api/auth/register`, `signOut()` → `POST /api/auth/logout`, `getMe()` → `GET /api/auth/me`. Stores token in Capacitor Preferences. |
| `lib/env.ts` | `ENV` object with smart URL detection: checks `VITE_*` env vars first, then localhost detection, then falls back to production Render URLs. |
| `lib/router.tsx` | Exports `HashRouter` as `Router` (for Capacitor compatibility — no server-side routing). |
| `lib/supabase.ts` | Supabase client init using `ENV.SUPABASE_URL` + `ENV.SUPABASE_ANON_KEY`. Used by `MediaService` for image uploads. |

### Types (types.ts) — Every Interface & Enum

| Type | Key Fields | Used By |
|---|---|---|
| `User` | `id, name, email, role, staff_id?, avatar_url?, designation?` | Auth, Profile |
| `JobStatus` (enum) | `PENDING, IN_PROGRESS, PAUSED, COMPLETED, QC_PENDING, QC_PASSED, QC_FAILED, VERIFIED` | All job-related pages |
| `PartRequestStatus` (enum) | `PENDING, APPROVED, REJECTED, ISSUED` | Requisitions, JobCardDetail |
| `IssueSeverity` (enum) | `LOW, MEDIUM, HIGH, CRITICAL` | Issue reporting (not wired) |
| `ServiceCondition` (enum) | `OK, FAIR, BAD, NA` | Checklist |
| `RoutePath` (enum) | All 17 route paths | App.tsx, navigation |
| `JobCard` | `id, ticket_id, technician_id, status, vehicle?, tasks?, parts?, photos?, checklist?, time_logs?, ticket?` | Dashboard, MyJobs, JobCardDetail |
| `ServiceTaskItem` | `id, name, status` | JobCardDetail |
| `PartUsageItem` | `id, variant_id, quantity, part_name?, price?` | JobCardDetail |
| `TechnicianProfile` | `id, user_id, staff_id, name, email, phone, designation, stats?` | Profile |
| `DashboardStats` | `pending, active, completed, total, efficiency_score?, hours_worked?, earnings?, daily_performance?, weekly_earnings?` | Dashboard, Performance, Profile |
| `TechnicianAttendance` | `id, clockIn, clockOut?, status, duration_hours?, shifts?` | Attendance |
| `AttendanceShift` | `id, attendance_id, start_time, end_time?, created_at` | Attendance |
| `AttendanceSession` | `id, clockIn, clockOut?, shifts` | Attendance |
| `AttendanceStatus` | `currentState, isCheckedIn, isShiftActive, currentShiftStartedAt, activeSessionId, totalWorkTimeMs, sessions` | Dashboard, Attendance |
| `TimeLog` | `id, event_type, timestamp, duration_from_last?` | JobCardDetail |
| `JobPhoto` | `id, image_url, thumbnail_url?, tag, caption?, metadata?, created_at` | JobCardDetail |
| `ChecklistItem` | `id, name, category?, is_completed, condition, notes?` | JobCardDetail |
| `Notification` | `id, title, message, type, read, created_at, link_url?, data?` | Notifications |
| `ProductDetail` | `id, name, sku, brand, base_price, sale_price?, stock_quantity, image_url?, category_id` | PartsSelectionModal |
| `RequisitionGroup` | `id, job_card_id, status, created_at, items: PartsRequest[]` | Requisitions |
| `PartsRequest` | `id, status, job_card_id, ticket_id, staff_id, product_id, quantity, unit_price, total_price, notes?, requisition_group_id, productName?, part_name?, sku?, brand?` | Requisitions, JobCardDetail |
| `Category` | `id, name, description?` | PartsSelectionModal |
| `Part` | `id, name, code, category_id` | — |
| `PartVariant` | `id, part_id, brand, sku, price, stock_quantity` | — |
| `BikeModel` | `id, name, code, image_url?` | — |
| `ServiceTask` | `id, vehicleModel, licensePlate, customerName, status, issueDescription, date` | — (legacy) |

### Config Files

| File | Key Details |
|---|---|
| `vite.config.ts` | Port `3003`, host `0.0.0.0`. Auto-detects local IP for dev mode. Overrides `VITE_PORTAL_API_URL` and `VITE_REALTIME_URL` in dev mode. |
| `capacitor.config.ts` | App ID: `com.suzuki.servicepro`, webDir: `dist`, dark background (`#020617`), HTTPS scheme |
| `tailwind.config.js` | Standard Tailwind 3 config |
| `package.json` | Name: `servicemate-pro`, React 19, Capacitor 7, Vite 6 |

### Known Patterns & Potential Bug Areas

1. **API response shape**: All API responses expected as `{ success: true, data: ... }`. Pages access `res.data.data` (double `.data` because Axios wraps in `.data`)
2. **Offline fallback**: Dashboard, MyJobs, JobCardDetail, Performance all have offline cache fallback via `OfflineService`
3. **Socket events**: Dashboard listens to 6 events, MyJobs to 3, JobCardDetail to 5. Events are debounced in Dashboard (300ms) but NOT in MyJobs (potential API storm)
4. **Checklist mapping**: JobCardDetail sanitizes `jobData.checklist || jobData.service_checklist_items` — two possible field names from API
5. **Photos mapping**: JobCardDetail sanitizes `jobData.photos || jobData.job_photos` — two possible field names from API
6. **Role check in Login**: Only allows `super_admin`, `service_admin`, `service_technician`. But `types.ts` User role also includes `service_stuff` and `technician`
7. **PushNotificationManager is disabled**: Returns null. All realtime is via Socket.io
8. **Biometric credentials stored as Base64**: Not secure — comment says "use SecureStorage in production"
9. **Sidebar component exists but is NOT used in App.tsx** — replaced by BottomBar
10. **`vite.config.ts` port is 3003** but CLAUDE.md says 5173 — potential confusion
