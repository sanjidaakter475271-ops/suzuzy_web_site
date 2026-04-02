# ServiceStuff-RN: Complete App Repair & Stabilization Plan

## Problem Summary

The `servicestuff-rn` React Native app (Suzuki Service Pro) is suffering from **critical runtime crashes**, a **401 authentication loop**, and dozens of architectural, performance, and UI bugs. After deep analysis of every source file, I've identified **37+ distinct issues** across 6 categories.

The user's error log shows the immediate symptom:
```
[AUTH] Connecting socket for: bba88ba6...
[HEARTBEAT] Sending location: {...}
[API Retry] Retrying request /jobs (Attempt 1)
Socket emit failed: Not connected
[LOCATION_TRACKER] API Error: [AxiosError: Request failed with status code 401]
```

---

## User Review Required

> [!CAUTION]
> **Styling Decision Required**: The app currently uses **3 different styling systems** simultaneously (NativeWind `className`, inline `style={{}}`, and `StyleSheet.create`). I recommend **removing NativeWind entirely** and standardizing on `StyleSheet.create` + a centralized theme. NativeWind requires fragile patches and causes compatibility warnings. **Do you agree, or do you want to keep NativeWind?**

> [!IMPORTANT]
> **Scope Confirmation**: This is a large plan (~37 fixes across 25+ files). I recommend executing in **5 phases**, where each phase is independently testable. Do you want me to execute all phases, or focus on specific ones first?

> [!WARNING]
> **Render.com Cold Start**: Your Portal API on Render.com has cold-start delays (~30-60s). The app's 401 errors may partially be caused by the portal not being ready. The fixes below add retry logic and auth-readiness guards, but the underlying Render cold-start issue remains for the first request.

---

## Complete Issue Inventory

### 🔴 Category 1: Critical Bugs (App is Broken)

| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| 1 | **401 Error Loop**: LocationTracker fires API before auth is ready | [LocationTracker.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/components/LocationTracker.tsx), [_layout.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/_layout.tsx) | App enters infinite 401→logout→login loop |
| 2 | **Session Shape Mismatch**: `signIn()` vs `getMe()` return different session objects | [auth.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/lib/auth.tsx) | Socket fails to connect after app restart |
| 3 | **Multiple Parallel 401 Handlers**: Race condition when 3+ requests all get 401 | [api.ts](file:///d:/suzuzy_web_site/servicestuff-rn/services/api.ts) | Token removed multiple times, multiple redirects |
| 4 | **Socket Fires Before Connected**: Socket join happens, but emit fails immediately | [socket.ts](file:///d:/suzuzy_web_site/servicestuff-rn/services/socket.ts), [auth.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/lib/auth.tsx) | Location/event emits silently dropped |
| 5 | **Auth Token in AsyncStorage**: Token stored unencrypted, extractable on rooted devices | [auth-client.ts](file:///d:/suzuzy_web_site/servicestuff-rn/lib/auth-client.ts) | Security vulnerability |

### 🟠 Category 2: Architecture Issues

| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| 6 | **Mixed Styling**: 3 styling systems (NativeWind, inline, StyleSheet) | login.tsx, register.tsx, index.tsx, attendance.tsx | Unmaintainable, inconsistent look |
| 7 | **No ErrorBoundary**: Any component crash kills the app | _layout.tsx | Crash without recovery |
| 8 | **Empty constants/ and hooks/ dirs**: No design tokens, no reusable hooks | constants/, hooks/ | Code duplication everywhere |
| 9 | **No Centralized Theme**: Colors hardcoded in 25+ files | All screen files | Design changes require mass find-replace |
| 10 | **Supabase Client Misconfigured**: Using publishable key (not JWT anon key) | [supabase.ts](file:///d:/suzuzy_web_site/servicestuff-rn/lib/supabase.ts) | Storage uploads may fail |
| 11 | **Logout Doesn't Send Token**: `/api/auth/logout` called without Authorization header | [auth-client.ts](file:///d:/suzuzy_web_site/servicestuff-rn/lib/auth-client.ts) | Server can't invalidate session |

### 🟡 Category 3: Performance Issues

| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| 12 | **FlashList Inside ScrollView**: Defeats virtualization | [index.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/(tabs)/index.tsx) | All items rendered, high memory |
| 13 | **TopBar Fetches on Every Mount**: Notifications API called on every tab switch | [TopBar.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/components/TopBar.tsx) | Excessive network calls |
| 14 | **No Request Deduplication**: Rapid socket events cause redundant fetches | index.tsx, jobs.tsx | Wasted bandwidth, flickering |
| 15 | **No Image Caching**: Job photos re-downloaded every time | [id].tsx | Slow photo loading, data waste |

### 🔵 Category 4: UI/UX Bugs

| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| 16 | **Dashboard Missing TopBar**: No notification bell access from home | [index.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/(tabs)/index.tsx) | Can't see notifications from main screen |
| 17 | **Calendar Mutates State**: `setMonth()` on existing Date object | [attendance.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/(tabs)/attendance.tsx#L354) | Calendar navigation glitches |
| 18 | **Tab Bar No Safe Area**: Fixed 60px height, no bottom inset | [(tabs)/_layout.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/(tabs)/_layout.tsx) | Tabs hidden on notched devices |
| 19 | **Hardcoded Rating**: Profile shows "4.8" not from API | [profile.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/(tabs)/profile.tsx#L601) | Misleading data |
| 20 | **Dead Achievements Button**: No handler, hardcoded "3 New badges" | [profile.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/(tabs)/profile.tsx#L669-L673) | Broken feature impression |
| 21 | **Efficiency Always "Above Average"**: Ignores actual score | [index.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/(tabs)/index.tsx#L309) | Misleading |
| 22 | **Missing Condition Button Styles**: `conditionBtn_ok/fair/bad/na` don't exist in StyleSheet | [job/[id].tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/job/[id].tsx#L500) | Condition buttons never highlight |
| 23 | **Scanner Widget Dead**: Full-width "Scan VIN" button has no onPress | [index.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/(tabs)/index.tsx#L269-L283) | Tappable but does nothing |
| 24 | **SafeAreaView Deprecation Warning**: Legacy import somewhere | Dependencies | Console warning noise |
| 25 | **Dashboard spacer hardcoded**: `height: 48` instead of safe area | [index.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/(tabs)/index.tsx#L207) | Incorrect on different devices |

### 🟣 Category 5: Login & Auth Flow Issues

| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| 26 | **Role Mismatch**: types.ts has `'technician'` and `'service_stuff'` roles but login blocks them | [login.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/(auth)/login.tsx#L145-L146), [types.ts](file:///d:/suzuzy_web_site/servicestuff-rn/types.ts#L265) | Some valid users can't login |
| 27 | **signOut in useEffect Dep Array**: Potential re-trigger loop | [login.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/(auth)/login.tsx#L155) | Edge case infinite effect |
| 28 | **Biometric Auto-trigger UX**: User sees form, then biometric interrupts typing | [login.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/(auth)/login.tsx#L134-L138) | Jarring experience |
| 29 | **Socket No Reconnect After Token Refresh**: Old token used forever | [socket.ts](file:///d:/suzuzy_web_site/servicestuff-rn/services/socket.ts) | Socket stays disconnected |

### ⚪ Category 6: Missing Features & Cleanup

| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| 30 | **No Pull-to-Refresh on Attendance** | attendance.tsx | Can't manually refresh |
| 31 | **No Push Notification Handler** | _layout.tsx | Foreground notifications ignored |
| 32 | **Gemini API Key Placeholder** | .env | AI Diagnosis feature broken |
| 33 | **Debug Files in Repo** | build_out.txt, doctor-report.txt, test-*.js, npx | Repo pollution |
| 34 | **Type Unsafe**: `session: any`, `password: any`, `dayStats: any` | Multiple files | No type safety |
| 35 | **No Deep Link Handling** | _layout.tsx | URL scheme defined but unused |
| 36 | **WorkletsVersion Mismatch** in package.json | package.json | Previous conversation issue may recur |
| 37 | **Attendance No Refresh on Return** | attendance.tsx | Stale data after actions |

---

## Proposed Changes

### Phase 1: Fix Critical Auth & 401 Loop (MUST DO FIRST)

> The app is currently unusable due to the authentication cascade. This phase makes it functional.

---

#### [MODIFY] [auth-client.ts](file:///d:/suzuzy_web_site/servicestuff-rn/lib/auth-client.ts)
- **Move token storage from AsyncStorage to SecureStore** (`expo-secure-store`)
- **Send Authorization header on logout** so server can invalidate session
- **Normalize session shape** so both `signIn` and `getMe` return identical `{ user, session: { token, accessToken } }` structure

#### [MODIFY] [auth.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/lib/auth.tsx)
- **Add `isAuthReady` signal** — a boolean that becomes `true` only after initial auth check completes AND token is confirmed valid
- **Export `isAuthReady` from context** so LocationTracker and other services can wait
- **Fix session shape**: Ensure signIn() and getMe() produce identical session objects
- **Remove `signOut` from login.tsx useEffect dependency** to prevent loop risk

#### [MODIFY] [api.ts](file:///d:/suzuzy_web_site/servicestuff-rn/services/api.ts)
- **Add 401 deduplication**: Use a `isRefreshing` flag so only the FIRST 401 triggers token removal + redirect. Subsequent 401s wait/reject silently.
- **Update token read from SecureStore** instead of AsyncStorage
- **Add AbortController support** for request cancellation

#### [MODIFY] [LocationTracker.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/components/LocationTracker.tsx)
- **Guard with `isAuthReady`**: Don't fire ANY API call until auth confirms token is valid
- **Stop tracking on auth failure**: If 401 received, clear interval and stop
- **Add small initial delay** (2-3 seconds) to let socket connect first

#### [MODIFY] [socket.ts](file:///d:/suzuzy_web_site/servicestuff-rn/services/socket.ts)
- **Add reconnect with fresh token**: Method to disconnect and reconnect with new token
- **Queue critical events** when disconnected, replay on reconnect
- **Update token read from SecureStore**

#### [MODIFY] [_layout.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/_layout.tsx)
- **Pass `isAuthReady` to LocationTracker guard**: Only render when auth is fully confirmed
- **Add ErrorBoundary wrapper** around `<InitialLayout>`

---

### Phase 2: Architecture Stabilization

> Eliminate code duplication, create reusable foundations, unify styling.

---

#### [NEW] [constants/theme.ts](file:///d:/suzuzy_web_site/servicestuff-rn/constants/theme.ts)
- Centralized color palette: `slate950`, `slate900`, `blue500`, `amber500`, etc.
- Typography scale: heading, body, caption sizes
- Spacing scale: xs, sm, md, lg, xl
- Border radius tokens
- Shadow definitions

#### [NEW] [hooks/useApi.ts](file:///d:/suzuzy_web_site/servicestuff-rn/hooks/useApi.ts)
- Generic hook: `useApi<T>(apiFn, deps)` that returns `{ data, loading, error, refetch }`
- Built-in loading state, error handling, and AbortController cleanup
- Replaces repeated pattern in every screen

#### [NEW] [hooks/useDebounce.ts](file:///d:/suzuzy_web_site/servicestuff-rn/hooks/useDebounce.ts)
- Reusable debounce hook (currently implemented inline in 4+ files)

#### [NEW] [hooks/useNetworkStatus.ts](file:///d:/suzuzy_web_site/servicestuff-rn/hooks/useNetworkStatus.ts)
- Global online/offline state via NetInfo (currently duplicated in jobs.tsx, offline.ts)

#### [NEW] [components/ErrorBoundary.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/components/ErrorBoundary.tsx)
- React error boundary with:
  - Crash screen UI ("Something went wrong")
  - "Retry" and "Go Home" buttons
  - Error logging to console

#### [MODIFY] [login.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/(auth)/login.tsx)
- **Convert from NativeWind `className` to `StyleSheet.create`** to unify styling
- Fix `signOut` dependency in useEffect
- Add allowed role `'technician'` to the role check list
- Improve biometric auto-trigger UX with loading overlay

#### [MODIFY] [register.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/(auth)/register.tsx)
- **Convert from NativeWind `className` to `StyleSheet.create`**
- Match styling consistency with login page

#### [MODIFY] [(tabs)/_layout.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/(tabs)/_layout.tsx)
- **Use `useSafeAreaInsets` for bottom tab padding** — handles notched devices
- Import and use theme colors

---

### Phase 3: Performance Optimization

> Reduce unnecessary network calls, fix virtualization, add caching.

---

#### [MODIFY] [index.tsx (Dashboard)](file:///d:/suzuzy_web_site/servicestuff-rn/app/(tabs)/index.tsx)
- **Replace FlashList+ScrollView with FlatList + ListHeaderComponent** pattern
- Add TopBar component for notification access
- Replace hardcoded spacer with safe area inset
- Fix efficiency text to be dynamic based on score
- Add onPress to scanner widget (navigate to attendance scanner or dedicated scanner)

#### [MODIFY] [TopBar.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/components/TopBar.tsx)
- **Cache notification unread status globally** using a simple module-level variable + event listener
- Only re-fetch if last fetch was >30 seconds ago
- Eliminate per-mount API call

#### [MODIFY] [DashboardJobCards.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/components/DashboardJobCards.tsx)
- Remove (component is duplicate of inline TaskCard in Dashboard)
- OR: Use as the single source of truth for task cards

---

### Phase 4: UI/UX Polish & Bug Fixes

> Fix visual bugs, dead buttons, hardcoded values, and inconsistencies.

---

#### [MODIFY] [attendance.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/(tabs)/attendance.tsx)
- **Fix calendar mutation**: `new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)` instead of `setMonth()`
- **Add RefreshControl** to ScrollView
- Use theme colors from constants

#### [MODIFY] [profile.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/(tabs)/profile.tsx)
- **Remove hardcoded "4.8" rating** — use API data or show "N/A"
- **Fix dead Achievements button** — either add navigation or disable with "Coming Soon"
- Use theme colors

#### [MODIFY] [job/[id].tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/job/[id].tsx)
- **Add missing condition button styles** to StyleSheet:
  ```
  conditionBtn_ok: { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
  conditionBtn_fair: { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
  conditionBtn_bad: { backgroundColor: 'rgba(244, 63, 94, 0.2)' },
  conditionBtn_na: { backgroundColor: 'rgba(148, 163, 184, 0.2)' },
  ```
- Add missing `conditionTextActive` style
- Use theme colors

#### [MODIFY] [types.ts](file:///d:/suzuzy_web_site/servicestuff-rn/types.ts)
- **Fix type safety**: `session: any` → proper `Session` interface
- `password: any` → `string` in AuthContext
- Add `Session` type: `{ token: string; accessToken?: string }`

---

### Phase 5: Missing Features & Cleanup

> Fill feature gaps and clean up repository.

---

#### [MODIFY] [_layout.tsx](file:///d:/suzuzy_web_site/servicestuff-rn/app/_layout.tsx)
- Add push notification foreground handler using `expo-notifications`
- Register for push notifications on auth

#### [DELETE] Debug/test files
- `build_out.txt`, `doctor-report.txt`, `doctor2.txt`, `test-error.txt`
- `test-lightningcss.js`, `test-nativewind-metro.js`, `test-nativewind-metro-stack.js`
- `npx`, `com.facebook.react.devsupport.*` files

#### [MODIFY] [.env](file:///d:/suzuzy_web_site/servicestuff-rn/.env)
- Add note about Gemini API key requirement
- Consider hiding AI diagnosis button when key is placeholder

---

## Open Questions

> [!IMPORTANT]
> 1. **Styling Decision**: Remove NativeWind and standardize on StyleSheet.create? (Recommended: YES — removes patching complexity)
> 2. **Phase Priority**: Execute all 5 phases, or focus on Phase 1 first to unblock?
> 3. **Scanner Feature**: Should the scanner widget on Dashboard open the attendance QR scanner, or a dedicated VIN/ticket scanner page?
> 4. **Role Whitelist**: Which roles should be allowed to login? Current: `['super_admin', 'service_admin', 'service_technician']`. Should `'technician'` and `'service_stuff'` be added?
> 5. **Supabase Key**: The `SUPABASE_ANON_KEY` in app.json is a new-style publishable key (`sb_publishable_...`). Is this correct for your Supabase project, or do you need the legacy JWT anon key for the client?

---

## Verification Plan

### Automated Tests
```bash
# TypeScript compilation check
cd d:\suzuzy_web_site\servicestuff-rn
npx tsc --noEmit

# Start dev server and verify bundle
npx expo start --android
```

### Manual Verification
After each phase:
1. **Phase 1**: Login → verify no 401 loop → check socket connects → verify location tracking starts after delay
2. **Phase 2**: Verify all screens render without crashes → check ErrorBoundary catches errors → verify login/register styling matches
3. **Phase 3**: Navigate between tabs rapidly → verify no excessive API calls → check Dashboard scrolls smoothly
4. **Phase 4**: Check condition buttons highlight → calendar navigation works → profile shows real data
5. **Phase 5**: Send test notification → verify foreground handler → confirm debug files removed

### Key Regression Checks
- Login with valid credentials → lands on Dashboard
- Login with invalid role → shows error (not infinite loop)
- Kill app → reopen → auto-login works via stored token
- Toggle airplane mode → offline banner shows → cached data displays
- Go online → queued actions sync
