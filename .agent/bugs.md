# Royal Suzuky — Bug & Problem Tracker

File bugs here with exact file paths so they're easy to find and fix.

## Format
```
### [BUG-###] Short title
- **File:** path/to/file.ts (line number if known)
- **Problem:** What's wrong
- **Status:** open | in-progress | fixed
- **Notes:** Any extra context
```

---

---

## Fixed

### [BUG-004] Infinite Session Verification Loop
- **File:** `servicestuff-rn/lib/auth.tsx`
- **Problem:** When a session is invalid, the app triggers logout, which then re-triggers the "online" session check due to `!user?.id` condition, causing a loop.
- **Status:** fixed
- **Notes:** Added session existence checks to prevent redundant verification calls during and after logout.

### [BUG-005] Socket Connection Race Condition
- **File:** `servicestuff-rn/services/socket.ts`, `lib/auth.tsx`
- **Problem:** `SocketService.connect()` fails because it reads from `AsyncStorage` before the token is fully settled or during auth transitions.
- **Status:** fixed
- **Notes:** Modified connect() to accept an optional token parameter and passed it directly from AuthProvider.

### [BUG-006] Navigator Not Ready Error
- **File:** `servicestuff-rn/app/_layout.tsx`
- **Problem:** `router.replace('/(tabs)')` fails on startup because the root navigator isn't fully mounted.
- **Status:** fixed
- **Notes:** Wrapped startup redirects in a `setTimeout(..., 1)` to ensure the Expo Router context is fully initialized.

### [PERF-01] List Memoization & Optimized Rendering
- **File:** `pages/MyJobs.tsx`, `pages/WorkHistory.tsx`, `components/DashboardJobCards.tsx`
- **Problem:** Frequent re-renders of list items and inline arrow functions in props.
- **Status:** fixed
- **Notes:** Extracted `MyJobCard` and `HistoryCard` to memoized components; fixed anonymous `onClick` in `DashboardJobCards`.

### [PERF-02] Socket Event Debouncing
- **File:** `pages/MyJobs.tsx`, `pages/JobCardDetail.tsx`
- **Problem:** API storms on multiple rapid socket events.
- **Status:** fixed
- **Notes:** Added 300ms debounce to socket event handlers.

### [PERF-03] Timer Isolation (Dashboard)
- **File:** `pages/Dashboard.tsx`
- **Problem:** Full Dashboard re-renders every 1s due to shift timer.
- **Status:** fixed
- **Notes:** Extracted `ShiftTimer` into a separate memoized component.

### [PERF-04] Search Debouncing
- **File:** `pages/MyJobs.tsx`, `pages/WorkHistory.tsx`
- **Problem:** Instant filtering on every keystroke causing lag.
- **Status:** fixed
- **Notes:** Implemented 300ms search debouncing.

### [PERF-05] Event-based Network Monitoring
- **File:** `pages/MyJobs.tsx`
- **Problem:** Polling `setInterval` for online status.
- **Status:** fixed
- **Notes:** Replaced polling with `@capacitor/network` event listener.

### [PERF-06] Skeleton Shimmer Enhancement
- **File:** `components/Skeleton.tsx`, `index.css`
- **Problem:** Expensive framer-motion opacity animations for skeletons.
- **Status:** fixed
- **Notes:** Switched to CSS shimmer animations.

### [PERF-07] App-wide Code Splitting
- **File:** `App.tsx`
- **Problem:** Large main bundle including all heavy pages.
- **Status:** partial-revert
- **Notes:** Initial implementation of `React.lazy` caused loading issues on Android. Reverted to eager imports for stability while keeping other logic.

### [PERF-08] Vite Build Optimization
- **File:** `vite.config.ts`
- **Problem:** Single vendor bundle.
- **Status:** modified
- **Notes:** `manualChunks` caused circular dependencies and build instability. Removed `manualChunks` but added `base: './'` for proper asset resolution in Capacitor.

### [PERF-09] Stagger Animation Refresh Fix
- **File:** `pages/MyJobs.tsx`, `pages/WorkHistory.tsx`
- **Problem:** Staggered entry animations re-running on every data refresh.
- **Status:** fixed
- **Notes:** Used `isInitialMount` ref to ensure stagger only runs once.

### [PERF-10] Vite Build Minification (Drop Console Logs)
- **File:** `vite.config.ts`
- **Problem:** Unnecessary console logs increasing production bundle size.
- **Status:** fixed
- **Notes:** Configured `esbuild` to drop `console` and `debugger` in production.

### [PERF-11] Critical Asset Preconnections
- **File:** `index.html`
- **Problem:** DNS/SSL handshake delays on startup for APIs and fonts.
- **Status:** fixed
- **Notes:** Added `preconnect` and `preload` tags for production endpoints and Google Fonts.

### [PERF-12] Capacitor Splash Screen Integration
- **File:** `App.tsx`, `capacitor.config.ts`, `package.json`
- **Problem:** "White flash" on app startup before React mounts.
- **Status:** fixed
- **Notes:** Installed `@capacitor/splash-screen`, configured dark background, and manually hide after initial auth check.

### [BUG-001] Missing React Imports
- **File:** `pages/MyJobs.tsx`
- **Problem:** `ReferenceError: React is not defined` after refactoring.
- **Status:** fixed
- **Notes:** Added missing `import React` and restored type/hook imports.

### [BUG-002] Duplicate Keys in Attendance Calendar
- **File:** `pages/Attendance.tsx`
- **Problem:** Duplicate keys ('S', 'T') in day header map.
- **Status:** fixed
- **Notes:** Used index-based unique keys for the static day list.

### [BUG-003] Rules of Hooks Violation
- **File:** `App.tsx`
- **Problem:** Hook called after early return in `AppContent`.
- **Status:** fixed
- **Notes:** Moved `useEffect` for splash screen before the `isPending` return.

## Migrated (Capacitor → React Native)

### [MIGRATE-01] React Native / Expo Port
- **Directory:** `servicestuff-rn`
- **Goal:** Full port of existing technician app to native for performance.
- **Status:** completed
- **Notes:** All 14 pages and core components ported to native components.

<!-- Move here when resolved -->
