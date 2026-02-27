---
description: Rules for handling Authentication, JSON Web Tokens (JWT), and Role-Based Access Control (RBAC).
globs: apps/portal/src/app/api/**/*,apps/portal/src/middleware.ts,apps/portal/src/components/auth/**/*
alwaysApply: false
---

# AUTHENTICATION & RBAC RULES — Royal Suzuky

Security and access control are critical. The system has multiple distinct roles (Admin, Dealer, Technician, Accountant, Customer, etc.). Always enforce strict validation.

## 1. The Authentication Model

- **Method:** JWT (JSON Web Tokens) stored in HTTP-only cookies (`auth_token`).
- **Middleware:** `src/middleware.ts` intercepts requests, verifies the JWT, and protects standard routes.
- **Payload:** The JWT payload typically includes `id`, `email`, `role`, and `dealerId`.

## 2. API Route Protection (Server-Side)

**Never trust the client.** Every secured API route MUST verify the user's session before performing database operations.

```typescript
// Standard pattern for protecting API routes
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
    // 1. Authenticate user
    const user = await getCurrentUser(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Authorize role (RBAC) - if specific route
    if (user.role !== "admin" && user.role !== "dealer_manager") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // ... execute logic ...
    } catch (error) {
        // ... handle error ...
    }
}
```

## 3. Data Scoping (Multi-Tenant Rules)

Many tables have a `dealer_id`. When querying data, **always** scope it to the logged-in user's dealer context unless they are a global super admin.

```typescript
// ❌ WRONG: Exposes all jobs to any authenticated user
const jobs = await prisma.job_cards.findMany();

// ✅ CORRECT: Scopes jobs to the specific dealer
const jobs = await prisma.job_cards.findMany({
    where: {
        dealer_id: user.dealerId
    }
});
```

## 4. Frontend Protection (Client-Side)

- Do not expose sensitive data to the UI before checking authentication.
- For Server Components, use `getCurrentUser()` or similar session util to conditionally render content.
- For protected layouts, redirect unauthenticated users to `/login`.

```tsx
// Example in a Server Component Page
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server-session"; // implementation varies

export default async function AdminDashboard() {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
        redirect("/login");
    }

    return <div>Welcome, Admin!</div>;
}
```

## 5. Passwords & Security
- Passwords MUST be hashed (e.g., using `bcrypt`) before saving to the database.
- Never return raw password hashes in API responses.
- Always use `jwt.verify` for token validation, not just `jwt.decode`.
