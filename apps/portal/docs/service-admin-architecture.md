# Service Admin Migration & Architecture Overview

## 1. Migration Summary
The `nazmul` codebase has been successfully migrated into the `apps/portal` repository under the `src/app/service-admin` directory. This document outlines the new architecture, directory structure, and key integration points.

## 2. Directory Structure & Layout Strategy

To ensure proper routing and layout application (avoiding double sidebars and protecting routes correctly), the `service-admin` section is structured as follows:

### Root Layout: `src/app/service-admin/layout.tsx`
- **Purpose**: Acts as the root provider for the entire service-admin section.
- **Components**: Renders `<>{children}</>` only.
- **guard**: Does **NOT** apply `ServiceAdminGuard` globally to allow for flexible sub-routing (e.g., potential public customer views or distinct auth requirements).

### Dashboard Group: `src/app/service-admin/(dashboard)`
- **Path**: Maps to `/service-admin/*` (e.g., `/service-admin/dashboard`).
- **Layout**: `(dashboard)/layout.tsx`
  - **Wrapper**: Applies `DashboardLayout` (Sidebar + TopNav).
  - **Guard**: Protected by `ServiceAdminGuard`.
- **Contents**:
  - `admin`, `analytics`, `appointments`, `crm`, `finance`, `inventory`, `products`, `profile`, `settings`, `transactions`, `users`, `warehouse`, `workshop`.

### Point of Sale (POS): `src/app/service-admin/pos`
- **Path**: `/service-admin/pos/*`
- **Layout**: `pos/layout.tsx`
  - **Wrapper**: Minimal layout (No sidebar/topnav) for full-screen terminal usage.
  - **Guard**: Protected by `ServiceAdminGuard`.

### Customer Views: `src/app/service-admin/customer`
- **Path**: `/service-admin/customer/*`
- **Layout**: `customer/layout.tsx`
  - **Wrapper**: `CustomerLayout` with `CustomerNav`.
  - **Guard**: **None** (or handled internally), as these are customer-facing pages.

## 3. Integration Details

### Authentication
- **Provider**: Uses the portal's central `useAuth` hook (`@/hooks/useAuth`).
- **TopNav**: Integrated to display current user data and handle `signOut()` correctly.
- **Login**: Removed `service-admin/(auth)` folder. Users should log in via the main portal logic, which redirects Service Admins to `/service-admin` upon authentication.

### Imports & Aliases
- **Pattern**: All internal imports now use the `@/` alias pointing to the specific `service-admin` subdirectories.
  - Components: `@/components/service-admin/*`
  - Stores: `@/stores/service-admin/*`
  - Constants: `@/constants/service-admin/*`
  - Types: `@/types/service-admin/*`

### Routing
- **Links**: All internal navigation links (`href` and `router.push`) have been prefixed with `/service-admin` (e.g., `/dashboard` -> `/service-admin/dashboard`).
- **Redirects**: `src/app/service-admin/page.tsx` automatically redirects to `/service-admin/dashboard`.

## 4. Key Files Modified
1.  `src/app/service-admin/layout.tsx` (Root wrapper)
2.  `src/app/service-admin/(dashboard)/layout.tsx` (Dashboard wrapper)
3.  `src/app/service-admin/pos/layout.tsx` (POS wrapper)
4.  `src/components/service-admin/layout/TopNav.tsx` (Auth integration)
5.  `src/constants/service-admin/menu.ts` (Sidebar navigation paths)

## 5. Next Steps for Development
- **New Pages**: When adding new admin pages, place them inside the `(dashboard)` folder to automatically inherit the sidebar and auth protection.
- **External/Public Pages**: Place them at the `service-admin` root or within their own group if they require a different layout.
- **Components**: Continue using `@/components/service-admin` for scoped components.
