---
description: Rules for creating and modifying API routes in the portal application.
globs: apps/portal/src/app/api/**/*
alwaysApply: false
---

# API DEVELOPMENT RULES — Royal Suzuky Portal

## API Route Structure

All API routes live under `apps/portal/src/app/api/v1/{module}/route.ts`.

### Standard API Route Template

Every API route MUST follow this pattern:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Role check (if needed)
        if (!['service_admin', 'dealer_owner'].includes(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Business logic with Prisma
        const data = await prisma.someModel.findMany({
            where: { dealer_id: user.dealerId }, // ALWAYS scope by dealerId
        });

        // Convert Prisma Decimals to numbers
        const safe = data.map(d => ({
            ...d,
            price: d.price ? Number(d.price) : 0,
        }));

        return NextResponse.json(safe);
    } catch (error: any) {
        console.error("[API_NAME] Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
```

## MANDATORY RULES

### 1. Auth — Always use `getCurrentUser()`
```typescript
// ✅ CORRECT — returns dealerId from DB
import { getCurrentUser } from "@/lib/auth/get-user";
const user = await getCurrentUser();
// user = { userId, email, role, dealerId, fullName }

// ❌ WRONG — JWT payload may not have dealerId
import { verifyToken } from "@/lib/auth/jwt";
const payload = await verifyToken(token);
// payload may be missing dealerId!
```

### 2. Prisma Decimal → Number conversion
Prisma Decimal fields are NOT plain numbers. They MUST be converted.
```typescript
// ✅ CORRECT
const items = data.map(item => ({
    ...item,
    base_price: item.base_price ? Number(item.base_price) : 0,
    sale_price: item.sale_price ? Number(item.sale_price) : null,
    cost_price: item.cost_price ? Number(item.cost_price) : 0,
}));

// ❌ WRONG — sending raw Prisma Decimal objects
return NextResponse.json(data);
```

### 3. Dealer scoping
ALL data queries MUST be scoped to the user's dealer:
```typescript
// ✅ CORRECT
const jobs = await prisma.service_job_cards.findMany({
    where: { dealer_id: user.dealerId },
});

// ❌ WRONG — returns ALL dealers' data
const jobs = await prisma.service_job_cards.findMany();
```

### 4. Zod validation for POST/PATCH/PUT
```typescript
import { z } from "zod";

const createSchema = z.object({
    name: z.string().min(1),
    quantity: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Validation failed", details: parsed.error.flatten() },
            { status: 400 }
        );
    }
    // Use parsed.data ...
}
```

### 5. Response shape must match frontend types
Before writing an API response, check the corresponding frontend type:
- Portal types: `src/types/{module}.ts`
- Mobile types: `servicestuff/types.ts`

### 6. Realtime event emission
After mutating data, broadcast to the realtime server:
```typescript
import { broadcastEvent } from "@/lib/socket-server";

// After creating/updating a requisition:
await broadcastEvent('requisition:created', {
    dealerId: user.dealerId,
    technicianId: staffId,
    // ... event data
});
```

### 7. Dynamic route params (App Router)
```typescript
// For routes like /api/v1/workshop/jobs/[id]/route.ts
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params; // Next.js 16: params is a Promise
}
```

## API Module Organization

| Module | Path | Purpose |
|--------|------|---------|
| workshop | `/api/v1/workshop/*` | Job cards, requisitions, invoices, scheduling |
| technician | `/api/v1/technician/*` | Mobile app endpoints (jobs, attendance, parts) |
| customer | `/api/v1/customer/*` | Customer-facing endpoints |
| dashboard | `/api/v1/dashboard/*` | Dashboard stats/overview |
| auth | `/api/auth/*` | Login, register, me, logout |
