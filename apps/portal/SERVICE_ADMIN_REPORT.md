# Service Admin Module Report — Royal Suzuky Portal

This report provides a detailed overview of the `service-admin` section within the `apps/portal` application, covering its architecture, workflows, and core logic.

---

## 1. Directory Structure & Organization

The `service-admin` module is located at `apps/portal/src/app/service-admin/`. It follows the Next.js App Router convention and is organized into functional groups.

### Core Structure
- **`/layout.tsx`**: The root layout for service admin, implementing the `ServiceAdminGuard` for RBAC (Role-Based Access Control).
- **`/(dashboard)/`**: A route group containing the main administrative dashboard and its sub-modules.
  - **`layout.tsx`**: Orchestrates real-time synchronization (`useSocketTrigger`) and global workshop state (`useWorkshopSync`).
- **`/customer/`**: Customer-related administrative pages (portal settings, tracking).
- **`/pos/`**: Point of Sale related layouts and terminal.

### Key Functional Sub-modules (Inside `(dashboard)`)
| Module | Purpose |
| :--- | :--- |
| **`workshop`** | Job card management, technician tracking, ramp view, QC, and requisitions. |
| **`pos`** | Service billing, counter sales, invoices, and daily closing. |
| **`inventory`** | Product management, stock adjustments, and low-stock alerts. |
| **`appointments`** | Scheduling, queue management, and reminders. |
| **`finance`** | Cashbook, daily sales reports, and expense tracking. |
| **`users`** | User management, RBAC, and activity logs. |

---

## 2. Core Logic & Architecture

### A. Authentication & Authorization
Every page in this section is wrapped in a `ServiceAdminGuard`. This component verifies that the user:
1. Is authenticated.
2. Has the `service_admin` or `super_admin` role.
3. Is associated with a valid `dealerId`.

### B. Real-time Synchronization (The "Pulse")
The `service-admin` section is designed for a high-concurrency workshop environment.
- **`useSocketTrigger(WORKSHOP_EVENTS)`**: Located in the dashboard layout, this hook listens for events like `job_cards:changed` or `inventory:changed` via Socket.io. When an event occurs, it triggers a background refresh of the current page's data.
- **Real-time Status**: A live indicator (bottom-right) shows connection status and current server time.

### C. State Management & Data Fetching
- **`useWorkshopStore` (Zustand)**: Located in `src/stores/service-admin/workshopStore.ts`.
  - Manages `jobCards`, `technicians`, `ramps`, and `serviceTypes`.
  - Includes a mapping layer (`mapJobStatus`) to standardize API statuses for the frontend.
  - Features throttled fetching (`FETCH_THROTTLE_MS = 2000`) to prevent redundant API calls during rapid real-time updates.
- **`useDashboardStats`**: Located in `src/hooks/service-admin/useDashboardStats.ts`.
  - Fetches holistic data for the main dashboard from `/api/v1/dashboard-stats`.
  - Transforms raw API data into structured KPI and Chart objects for immediate UI rendering.

### D. Real-time Logic
- **`useWorkshopSync`**: Located in `src/hooks/useWorkshopSync.ts`.
  - Subscribes to 8 specific socket events (e.g., `job_cards:changed`, `requisition:status_changed`).
  - Automatically triggers `fetchWorkshopData()` on the store whenever a relevant update occurs.
  - Ensures initial data load on component mount.

---

## 4. Primary API Endpoints

The `service-admin` module primarily interacts with the following backend routes:

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/v1/workshop/overview` | GET | Fetch all jobs, ramps, staff, and service tasks. |
| `/api/v1/workshop/create-job` | POST | Create a new service entry with full vehicle/customer details. |
| `/api/v1/workshop/jobs/:id` | PATCH/DELETE | Update job status, assignment, or remove entries. |
| `/api/v1/dashboard-stats` | GET | Comprehensive KPI and financial data for the dashboard. |
| `/api/v1/service_ramps/:id` | PATCH | Manage ramp occupancy and technician assignment. |
| `/api/v1/service_staff` | POST/PATCH | Manage technician records and approvals. |

---

## 3. Detailed Workflows

### Workflow: Workshop Status Board (Kanban)
1.  **Interface**: A high-tech "Mission Control" board (`/workshop/status-board`) utilizing `@dnd-kit` for drag-and-drop interactions.
2.  **Interaction**: Admin can drag vehicle cards between four primary operational columns:
    -   **Pending Logs** (`created`)
    -   **Active Mission** (`in_progress`)
    -   **QC Analysis** (`qc_pending`)
    -   **Verified Ready** (`qc_approved`)
3.  **Logic**: Dropping a card into a new column triggers an immediate `updateJobCardStatus` call to the backend, which in turn emits a socket event to sync all other connected clients (including the technician's mobile app).

### Workflow: Inventory Management
1.  **Cataloging**: Parts and consumables are managed in the Product List (`/inventory/products`).
2.  **Status Tracking**: Items are automatically flagged as `low-stock` or `out-of-stock` based on user-defined minimum thresholds.
3.  **Bulk Operations**: Supports CSV import for mass updating the spare parts catalog.
4.  **Integration**: Requisitions from the workshop appear in the **Parts Issue** module, where inventory staff approve and allocate physical stock to specific Job Cards.

### Workflow: Inventory & Requisition
1. **Request**: Technicians request parts via the mobile app.
2. **Review**: Admin sees these in **Requisition Batch** (`/workshop/requisitions`).
3. **Approval**: Admin approves/rejects. Approved items automatically adjust inventory levels.
4. **Alerts**: Low stock triggers are displayed on the main Dashboard.

---

## 4. Key Files for Development

| File Path | Description |
| :--- | :--- |
| `src/app/service-admin/(dashboard)/layout.tsx` | Main logic for real-time updates and sync. |
| `src/constants/service-admin/menu.ts` | Sidebar navigation definitions and routing. |
| `src/components/service-admin/layout/Sidebar.tsx` | Navigation UI and module grouping. |
| `src/hooks/service-admin/useDashboardStats.ts` | Primary data fetching hook for the dashboard. |
| `src/stores/service-admin/workshopStore.ts` | Global state for workshop operations. |

---

## 5. Development Guidelines
- **Scoping**: All queries must be scoped to `user.dealerId`.
- **UI Components**: Use the specialized components in `src/components/service-admin/ui` (optimized for the Admin theme).
- **Icons**: Use `lucide-react` as per project standards.
- **Theming**: The system supports both Light and Dark modes; use `surface-` and `dark-` Tailwind classes.
