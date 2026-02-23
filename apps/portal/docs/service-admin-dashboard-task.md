# Service Admin Dashboard — Task Checklist

## Pre-requisites
- [x] Reconnect Supabase MCP server
- [x] Verify all service tables exist in Supabase
- [x] Inspect all table schemas & FK relationships
- [x] Confirm all tables are empty (need seed data)

## Phase 0: Seed Data
- [x] Create `prisma/seed-service.ts`
  - [x] Seed `bike_models` (8 Suzuki models)
  - [x] Seed `service_staff` (5 technicians)
  - [x] Seed `service_ramps` (6 ramps, mixed status)
  - [x] Seed `service_vehicles` (10 vehicles)
  - [x] Seed `service_tickets` (15 tickets, mixed status)
  - [x] Seed `job_cards` (12 with TAT data)
  - [x] Seed `service_requisitions` (20 parts requests)
  - [x] Seed `parts`, `expenses`, `transactions`
- [x] Add `seed:service` script to [package.json](file:///d:/suzuky/apps/portal/package.json)
- [x] Run seed and verify counts via Supabase MCP

## Phase 1: Service Admin Dashboard API
- [x] Create `/api/v1/service-admin/dashboard/stats/route.ts`
  - [x] Auth check (service_admin / super_admin only)
  - [x] KPIs: todayTickets, activeRamps, techOnDuty, avgTAT
  - [x] Workshop widgets: ramps, queuedVehicles, customerRequests
  - [x] Charts: revenueData, expenseBreakdown, transactionVolume
  - [x] workshopPulse + recentTransactions

## Phase 2: Route Migration
- [x] Copy [admin/dashboard-v2/page.tsx](file:///d:/suzuky/apps/portal/src/app/admin/dashboard-v2/page.tsx) → `service-admin/dashboard/page.tsx`
- [x] Replace mock imports with `useQuery` data fetching
- [x] Update internal links to `/service-admin/` scope
- [x] Add sidebar "Dashboard" link for service-admin
- [x] Delete [admin/dashboard-v2/page.tsx](file:///d:/suzuky/apps/portal/src/app/admin/dashboard-v2/page.tsx)

## Phase 3: Wire Widgets to Real Data
- [x] [ActiveRampsWidget](file:///d:/suzuky/apps/portal/src/components/dashboard/ActiveRampsWidget.tsx#9-43) — accept `ramps` prop from API
- [x] [QueuedVehiclesWidget](file:///d:/suzuky/apps/portal/src/components/dashboard/QueuedVehiclesWidget.tsx#9-48) — accept `queuedVehicles` prop
- [x] [CustomerRequestsWidget](file:///d:/suzuky/apps/portal/src/components/dashboard/CustomerRequestsWidget.tsx#9-58) — accept `customerRequests` prop
- [x] [RevenueChart](file:///d:/suzuky/apps/portal/src/components/dashboard/RevenueChart.tsx#32-69) — accept `data` prop
- [x] [ExpensePieChart](file:///d:/suzuky/apps/portal/src/components/dashboard/ExpensePieChart.tsx#9-67) — accept `data` prop
- [x] [TransactionBarChart](file:///d:/suzuky/apps/portal/src/components/dashboard/TransactionBarChart.tsx#7-43) — accept `data` prop
- [x] Workshop Pulse section — live values from API

## Phase 4: Real-time Updates (Optional for MVP)
- [x] Add React Query polling (30s interval) for auto-refresh
- [ ] (Future) Supabase Realtime for ramp/ticket changes

## Verification
- [x] `npm run build` — no TypeScript errors
- [x] Seed data counts match expectations
- [x] API returns correct JSON structure
- [x] Service admin can access `/service-admin/dashboard`
- [x] KPIs, charts, widgets all render with real data
