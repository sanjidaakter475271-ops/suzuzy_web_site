---
description: Standards for API response formatting, error handling, and structured logging.
globs: apps/portal/src/app/api/**/*
alwaysApply: false
---

# ERROR HANDLING & API RESPONSE RULES — Royal Suzuky

To ensure frontend clients and mobile apps (`servicestuff`) can reliably parse API responses, we must follow a strict, standardized format for both successes and errors.

## 1. Standard Success Response

When an API successfully completes its operation, return a consistent JSON structure.

```typescript
import { NextResponse } from "next/server";

// Standard return 200 OK
return NextResponse.json({
    success: true,
    data: resultData, // Array, Object, or null
    message: "Operation completed successfully" // Optional
}, { status: 200 });

// Resource created 201
return NextResponse.json({
    success: true,
    data: newRecord,
    message: "Record created"
}, { status: 201 });
```

## 2. Standard Error Response

When an error occurs, the structure must ALWAYS include an `error` field. Do not leak sensitive database internals to the client.

```typescript
// Client Error (e.g., validation failed)
return NextResponse.json({
    success: false,
    error: "Invalid input data",
    details: validationErrors // Optional context from Zod
}, { status: 400 });

// Authentication / Authorization Error
return NextResponse.json({
    success: false,
    error: "Unauthorized access"
}, { status: 401 }); // or 403

// Server Error (500)
// ⚠️ NEVER return raw Prisma error messages directly to the client
return NextResponse.json({
    success: false,
    error: "Internal server error. Please try again later."
}, { status: 500 });
```

## 3. Server-Side Logging

- Always wrap database operations and external API calls in `try/catch` blocks.
- Log the ACTUAL error on the server for debugging.

```typescript
try {
    const data = await prisma.service_tickets.create({ ... });
    return NextResponse.json({ success: true, data });
} catch (error) {
    // 1. Log the real error to the server console (or logging service)
    console.error("[SERVICE_TICKETS_CREATE_ERROR]", error);
    
    // 2. Return a sanitized generic error to the client
    return NextResponse.json({
        success: false,
        error: "Failed to create service ticket."
    }, { status: 500 });
}
```

## 4. Prisma Specific Error Handling

Catch specific Prisma errors if you need to provide feedback to the user (e.g., unique constraint violation for duplicate emails).

```typescript
import { Prisma } from "@prisma/client";

try {
    // DB logic
} catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: Unique constraint failed
        if (error.code === 'P2002') {
            return NextResponse.json({
                success: false,
                error: "A record with this field already exists."
            }, { status: 409 });
        }
        // P2025: Record to update not found
        if (error.code === 'P2025') {
            return NextResponse.json({
                success: false,
                error: "Record not found."
            }, { status: 404 });
        }
    }
    
    console.error("Database Error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
}
```
