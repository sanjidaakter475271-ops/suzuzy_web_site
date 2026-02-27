---
description: Create a new API endpoint in the portal with proper auth, validation, and types
---

# New API Route Workflow

Follow this step-by-step process to create a properly structured API endpoint.

## 1. Determine the Module
Decide which API module this belongs to:
- `workshop` → Workshop/job management (admin-facing)
- `technician` → Mobile app endpoints (technician-facing)
- `customer` → Customer-facing
- `dashboard` → Dashboard/overview stats

## 2. Check the Frontend Type
Before writing any code, check what the frontend expects:
- Portal types: `d:\suzuky\apps\portal\src\types\{module}.ts`
- Mobile types: `d:\suzuky\servicestuff\types.ts`

If needed, add the new type interface FIRST.

## 3. Find Related Prisma Models
```powershell
Select-String -Path "d:\suzuky\apps\portal\prisma\schema.prisma" -Pattern "model model_name" -Context 0,30
```
Note the field names, types, and relations.

## 4. Create the Route File
Path: `d:\suzuky\apps\portal\src\app\api\v1\{module}\{endpoint}\route.ts`

Template:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma/client";
import { z } from "zod";

// Validation schema (for POST/PATCH)
const schema = z.object({
    // define fields
});

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ALWAYS scope by dealer
        const data = await prisma.modelName.findMany({
            where: { dealer_id: user.dealerId },
        });

        // Convert Decimals
        const result = data.map(item => ({
            ...item,
            price: item.price ? Number(item.price) : 0,
        }));

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[ENDPOINT_NAME] Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
```

## 5. Add Mobile API Method (if technician endpoint)
Open `d:\suzuky\servicestuff\services\api.ts` and add:
```typescript
newMethod: (params) => api.get('/new-endpoint', { params }),
```

## 6. Emit Realtime Event (if mutation)
After creating/updating data, broadcast the event:
```typescript
await fetch(`${process.env.NEXT_PUBLIC_REALTIME_URL}/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        event: 'domain:action',
        data: { dealer_id: user.dealerId, ...relevantData }
    })
});
```

## 7. Test the Endpoint
// turbo
```powershell
# Test from PowerShell (example)
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/module/endpoint" -Method GET -Headers @{ "Cookie" = "access_token=YOUR_JWT" }
```
