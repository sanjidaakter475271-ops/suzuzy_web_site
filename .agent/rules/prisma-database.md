---
description: Prisma 7 database rules for Royal Suzuky project — schema changes, CLI commands, config, and common pitfalls.
globs: "**/prisma/**,**/prisma.config.ts,**/.env,**/.env.local"
alwaysApply: true
---

# PRISMA 7 DATABASE RULES — Royal Suzuky

> **CRITICAL**: This project uses **Prisma 7.4.0** with the **client engine** and **`@prisma/adapter-pg`**.
> Prisma 7 has BREAKING CHANGES from Prisma 5/6. Follow these rules strictly.

---

## 1. Configuration Architecture (Prisma 7)

### `prisma.config.ts` — THE Connection Config

In Prisma 7, **ALL database connection URLs live in `prisma.config.ts`**, NOT in `schema.prisma`.

```typescript
// ✅ CORRECT — prisma.config.ts (at apps/portal/prisma.config.ts)
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"), // Use DIRECT_URL for CLI operations
  },
});
```

### `schema.prisma` — NO url/directUrl

```prisma
// ✅ CORRECT — schema.prisma datasource block (Prisma 7)
datasource db {
  provider = "postgresql"
  schemas  = ["auth", "public"]
}

// ❌ WRONG — These are REMOVED in Prisma 7
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")       // ❌ NOT ALLOWED
  directUrl = env("DIRECT_URL")         // ❌ NOT ALLOWED
  schemas   = ["auth", "public"]
}
```

### WHY: Prisma 7 deprecated `url`, `directUrl`, and `shadowDatabaseUrl` from `schema.prisma`. They MUST go in `prisma.config.ts`.

---

## 2. Environment Variables (.env / .env.local)

### Required Variables for Prisma CLI

| Variable | Purpose | Port | Used By |
|----------|---------|------|---------|
| `DATABASE_URL` | Pooled connection (Transaction Mode) | `6543` | Runtime PrismaClient (via pg adapter) |
| `DIRECT_URL` | Direct connection (Session Mode) | `5432` | Prisma CLI (`db push`, `db pull`, `generate`) |

### Password Encoding

The database password contains special characters (`Nazmul@2@@@`). These MUST be URL-encoded:

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |

```env
# ✅ CORRECT — special characters encoded
DATABASE_URL="postgresql://postgres.idqikowpudzjickwpfzr:Nazmul%402%40%40%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.idqikowpudzjickwpfzr:Nazmul%402%40%40%40@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

# ❌ WRONG — raw special characters will break the connection
DATABASE_URL="postgresql://postgres.xxx:Nazmul@2@@@hostname:6543/postgres"
```

### .env vs .env.local

| File | Purpose |
|------|---------|
| `.env` | Base defaults, loaded by Prisma CLI via `dotenv/config` in `prisma.config.ts` |
| `.env.local` | Next.js overrides for local development (takes priority at runtime) |

Both files MUST have `DATABASE_URL` and `DIRECT_URL` with properly encoded passwords.

---

## 3. Prisma CLI Commands (Working Directory: `apps/portal`)

### Command Reference

```powershell
# Validate schema syntax
npx prisma validate

# Pull database schema into schema.prisma (introspect)
npx prisma db pull

# Push schema changes to database (no migration files)
npx prisma db push

# Generate Prisma Client types
npx prisma generate

# Open Prisma Studio (GUI)
npx prisma studio
```

### Command Order for Schema Changes

```
1. npx prisma validate          # Check schema is valid
2. npx prisma db push           # Push changes to Supabase
3. npx prisma generate          # Regenerate client types
```

### Command Order for Syncing from Database

```
1. npx prisma db pull           # Pull latest schema from Supabase
2. Fix any unsupported syntax   # See Section 5
3. npx prisma generate          # Regenerate client types
```

---

## 4. Generator Block Rules

### Preview Features

```prisma
// ✅ CORRECT — Prisma 7
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["partialIndexes"]
}

// ❌ WRONG — multiSchema is now GA, not a preview feature
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema", "partialIndexes"]
}
```

### Known Deprecated/GA Preview Features in Prisma 7

| Feature | Status |
|---------|--------|
| `multiSchema` | ✅ GA — remove from previewFeatures |
| `partialIndexes` | Still preview — keep |

---

## 5. Post-`db pull` Fixes (MANDATORY)

After every `npx prisma db pull`, the following issues MUST be manually fixed before running `npx prisma generate`:

### 5a. Supabase `auth.users` — Partial Unique Indexes

Prisma introspects partial unique indexes with `where` clauses, but Prisma 7 does NOT support `where` in field-level `@unique`. Remove them.

```prisma
// ❌ BROKEN after db pull — will fail on generate
email                       String?  @unique(map: "users_email_partial_key", where: raw("(is_sso_user = false)")) @db.VarChar(255)
confirmation_token          String?  @unique(map: "confirmation_token_idx", where: raw("((confirmation_token)::text !~ '^[0-9 ]*$'::text)")) @db.VarChar(255)
recovery_token              String?  @unique(map: "recovery_token_idx", where: raw("((recovery_token)::text !~ '^[0-9 ]*$'::text)")) @db.VarChar(255)
email_change_token_new      String?  @unique(map: "email_change_token_new_idx", where: raw("((email_change_token_new)::text !~ '^[0-9 ]*$'::text)")) @db.VarChar(255)
email_change_token_current  String?  @unique(map: "email_change_token_current_idx", where: raw("((email_change_token_current)::text !~ '^[0-9 ]*$'::text)")) @default("") @db.VarChar(255)
reauthentication_token      String?  @unique(map: "reauthentication_token_idx", where: raw("((reauthentication_token)::text !~ '^[0-9 ]*$'::text)")) @default("") @db.VarChar(255)

// ✅ FIXED — remove `where` clause, keep `map`
email                       String?  @unique(map: "users_email_partial_key") @db.VarChar(255)
confirmation_token          String?  @unique(map: "confirmation_token_idx") @db.VarChar(255)
recovery_token              String?  @unique(map: "recovery_token_idx") @db.VarChar(255)
email_change_token_new      String?  @unique(map: "email_change_token_new_idx") @db.VarChar(255)
email_change_token_current  String?  @unique(map: "email_change_token_current_idx") @default("") @db.VarChar(255)
reauthentication_token      String?  @unique(map: "reauthentication_token_idx") @default("") @db.VarChar(255)
```

> **NOTE**: Removing `where` from Prisma schema does NOT affect the actual database constraints. The partial indexes remain intact in Supabase.

### 5b. Check for Re-added `multiSchema`

`db pull` may re-add `multiSchema` to previewFeatures. Remove it if present.

---

## 6. Supabase + Prisma Gotchas

### 6a. Connection Pooler vs Direct Connection

| Use Case | URL Variable | Port | Mode |
|----------|-------------|------|------|
| Prisma CLI (`db push`, `db pull`) | `DIRECT_URL` | `5432` | Session |
| Runtime PrismaClient (via adapter) | `DATABASE_URL` | `6543` | Transaction |
| Prisma Migrate (if used) | `DIRECT_URL` | `5432` | Session |

**NEVER use the pooled connection (port 6543) for DDL operations** (`db push`, `db pull`, migrations). It will fail or cause unpredictable behavior.

### 6b. Auth Schema is Read-Only

The `auth` schema is managed by Supabase. NEVER modify auth tables via Prisma.
- `db pull` will introspect them (for relation purposes)
- `db push` may show warnings about auth tables — these are safe to ignore
- Use `--accept-data-loss` flag only if you understand the warnings

### 6c. Row Level Security (RLS) Warnings

Prisma will warn about RLS on many tables. This is normal for Supabase. No action needed.

---

## 7. Runtime PrismaClient Setup (apps/portal)

The PrismaClient uses the **pg adapter** at runtime, NOT the standard Prisma connection:

```typescript
// src/lib/prisma/client.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL, // Pooled URL (port 6543)
  max: 20,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter, // Prisma 7 requires adapter OR accelerateUrl
});
```

### Common Runtime Error

```
PrismaClientConstructorValidationError: Using engine type "client" requires
either "adapter" or "accelerateUrl" to be provided to PrismaClient constructor.
```

**Fix**: Ensure `adapter` is passed to the PrismaClient constructor.

---

## 8. Decimal Field Handling

Prisma `Decimal` fields are NOT plain JavaScript numbers. ALWAYS convert before sending to frontend:

```typescript
// ✅ CORRECT
const safe = data.map(d => ({
  ...d,
  price: d.price ? Number(d.price) : 0,
  cost: d.cost ? Number(d.cost) : 0,
}));
return NextResponse.json(safe);

// ❌ WRONG — raw Prisma Decimal objects break JSON serialization
return NextResponse.json(data);
```

---

## 9. Troubleshooting Checklist

If Prisma CLI commands fail, check these in order:

| # | Check | How |
|---|-------|-----|
| 1 | `prisma.config.ts` exists? | Must be at `apps/portal/prisma.config.ts` |
| 2 | `DIRECT_URL` in `.env`? | Must have port `5432`, encoded password |
| 3 | `DATABASE_URL` in `.env`? | Must have port `6543`, encoded password |
| 4 | Schema valid? | `npx prisma validate` |
| 5 | No `url`/`directUrl` in schema? | Check `datasource db` block |
| 6 | No deprecated previewFeatures? | Remove `multiSchema` if present |
| 7 | No `where` in field `@unique`? | Fix auth.users after `db pull` |
| 8 | Network access? | Can you reach `aws-1-ap-south-1.pooler.supabase.com`? |

---

## 10. File Locations Quick Reference

```
apps/portal/
├── prisma.config.ts          ← Database connection config (Prisma 7)
├── prisma/
│   ├── schema.prisma         ← Data models (NO url/directUrl here)
│   └── migrations/           ← Migration files (if using migrate)
├── .env                      ← Base environment variables
├── .env.local                ← Local overrides (Next.js)
└── src/lib/prisma/client.ts  ← Runtime PrismaClient with pg adapter
```
