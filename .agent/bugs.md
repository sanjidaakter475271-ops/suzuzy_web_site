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

## Open Bugs

<!-- Add bugs here -->

---

## Fixed

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
- **Status:** fixed
- **Notes:** Implemented `React.lazy` and `Suspense` for all main routes.

### [PERF-08] Vite Build Optimization
- **File:** `vite.config.ts`
- **Problem:** Single vendor bundle.
- **Status:** fixed
- **Notes:** Configured `manualChunks` to split React, UI, and Capacitor vendors.

### [PERF-09] Stagger Animation Refresh Fix
- **File:** `pages/MyJobs.tsx`, `pages/WorkHistory.tsx`
- **Problem:** Staggered entry animations re-running on every data refresh.
- **Status:** fixed
- **Notes:** Used `isInitialMount` ref to ensure stagger only runs once.

<!-- Move here when resolved -->
