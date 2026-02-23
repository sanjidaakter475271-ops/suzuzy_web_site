# Workshop Store Refactoring & API Integration Complete

## Overview
Successfully transitioned the Workshop module from mock data to real API endpoints. The `workshopStore` now fetches data asynchronously and manages state for Job Cards, Technicians, Ramps, and Service Tasks.

## Key Changes

### 1. API Services & Registry (`src/lib/api`)
- **Enhanced Scoping**: Modified `api-services.ts` to support nested scope paths (e.g., `scopeBy: 'profiles.dealer_id'`), enabling proper data isolation for entities like `service_tickets` and `service_staff` that relate to dealers via profiles.
- **Updated Registry**:
  - Added `job_cards` with relations to `service_tasks` and `service_history`.
  - Added `service_ramps` with deep linking to current tickets and vehicles.
  - Added `service_tasks` for fetching standard labor items.
  - Updated `service_tickets` to deep-include vehicle models.

### 2. Workshop Store (`src/stores/service-admin/workshopStore.ts`)
- **API Integration**: Replaced static mocks with `fetch` calls to:
  - `/api/v1/job_cards`
  - `/api/v1/service_tickets`
  - `/api/v1/service_ramps`
  - `/api/v1/service_staff`
  - `/api/v1/service_tasks`
- **Data Mapping**: Implemented robust mapping logic to transform API fields (snake_case) to frontend interfaces (camelCase), including joining job cards with customer/vehicle details from tickets.
- **Actions**: Implemented methods for:
  - `addJobCard` (POST)
  - `updateJobCardStatus`, `assignTechnician` (PATCH)
  - `updateRampStatus`, `assignJobToRamp`, `releaseRamp` (PATCH)

### 3. Frontend Integration
- **Workshop Layout**: Created `src/app/service-admin/(dashboard)/workshop/layout.tsx` to handle initial data fetching for the entire workshop section. This ensures data is loaded once when entering the module.
- **Loading State**: Added a loading indicator to the layout to prevent empty content flashes.
- **Page Updates**: Updated `JobCardListPage` and `RampViewPage` to trigger data refresh on mount, ensuring data freshness.

## Next Steps
- **Parts Usage**: The `parts_usage` entity currently lacks direct relations in `schema.prisma`. Once fixed in the schema, update `entity-registry.ts` to include it in `job_cards` fetch.
- **Testing**: Verify end-to-end flows (Creating a Job Card -> Assigning to Ramp -> Completing).
