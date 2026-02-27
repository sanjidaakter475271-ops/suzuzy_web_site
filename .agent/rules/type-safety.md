---
description: TypeScript type safety rules and shared type patterns across portal and mobile.
globs: "**/*.ts,**/*.tsx"
alwaysApply: false
---

# TYPE SAFETY RULES — Royal Suzuky

## Golden Rule: Types Drive the Contract

The **mobile app types** (`servicestuff/types.ts`) define the contract that the **portal API must satisfy**. If there's a type mismatch, the API response is wrong — NOT the type.

## Avoid `any`

```typescript
// ❌ AVOID
const data: any = await response.json();
signIn: (email: string, password: any) => ...

// ✅ PREFER
interface LoginResponse { user: User; session: Session; }
const data: LoginResponse = await response.json();
signIn: (email: string, password: string) => ...
```

## Prisma Types vs API Types

Prisma generates its own types which include `Decimal`, `BigInt`, and nullable wrappers. These MUST be converted before sending as API responses.

```typescript
// Prisma model type (auto-generated)
interface service_job_cards {
    base_price: Decimal | null;
    status: service_status;  // Prisma enum
    created_at: Date;
}

// API response type (what frontend expects)
interface JobCard {
    base_price: number;     // Converted from Decimal
    status: string;         // String enum value
    created_at: string;     // ISO string
}
```

### Common Conversions:
| Prisma Type | JS Type | Conversion |
|-------------|---------|------------|
| `Decimal` | `number` | `Number(value)` |
| `BigInt` | `string` | `String(value)` |
| `Date` | `string` | Automatic via JSON.stringify |
| Enum | `string` | Automatic via JSON.stringify |
| `null` | `null \| undefined` | Handle explicitly |

## Role Types

Portal roles (from `lib/auth/roles.ts`):
```
super_admin | showroom_admin | sell_showroom_admin | sells_stuff |
service_admin | sell_service_admin | service_stuff |
dealer_owner | dealer_manager | dealer_staff | sub_dealer | dealer |
support | accountant | admin | sales_admin | customer
```

Mobile user roles (from `servicestuff/types.ts`):
```
super_admin | service_admin | service_technician | service_sales_admin
```

> [!WARNING]
> The mobile app uses `service_technician` but the portal uses `service_stuff`. Make sure API routes handle BOTH role names when filtering technician data.

## Response Consistency

API responses MUST always use one of these shapes:

```typescript
// Success (single item)
return NextResponse.json(item);

// Success (list)
return NextResponse.json(items);

// Success (paginated)
return NextResponse.json({ data: items, total: count, page, limit });

// Error
return NextResponse.json({ error: "message" }, { status: 4xx });
```

Never mix error shapes (e.g., `{ message }` vs `{ error }`). Always use `{ error: string }`.
