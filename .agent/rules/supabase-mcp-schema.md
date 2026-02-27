---
description: Rules and workflows for verifying and deeply understanding the database schema using the Supabase MCP server.
globs: **/*
alwaysApply: false
---

# SUPABASE MCP SCHEMA VERIFICATION RULES — Royal Suzuky

Given the size and complexity of the Royal Suzuky database (~80+ tables in `public` schema, complex relations), **NEVER rely solely on `prisma/schema.prisma` for critical database operations or debugging**. 

Always verify the **live** schema state using the **Supabase MCP server**.

## 1. Why use Supabase MCP over Prisma Schema?
- `schema.prisma` dictates the application ORM shape, but the **live database** dictates actual execution.
- Helps identify database-level defaults, actual nullability constraints, triggers, and Row-Level Security (RLS) policies that Prisma might not capture accurately.
- `schema.prisma` for this project is massive (~192KB, ~5000 lines), making it context-heavy to read fully. Querying the live database via MCP is faster, surgical, and 100% accurate.

## 2. Available Supabase MCP Tools for Schema Analysis

You have access to the `cloudrun`, `context7`, `filesystem`, `github`, `sequential-thinking`, and **`supabase-mcp-server`** MCP servers.

Use the following tools from `supabase-mcp-server` for deep schema understanding:

### A. List Tables & Broad Overview
When you need to know if a table exists or what schemas are available.
- **Tool:** `mcp_supabase-mcp-server_list_tables`
- **Usage:** Pass `project_id` and `schemas: ["public"]`.

### B. Execute SQL for Surgical Deep Dives
Use `mcp_supabase-mcp-server_execute_sql` with targeted queries. **This is your most powerful tool for schema verification.**

**Example 1: Get exact column definitions for specific tables (Data types, Nullability, Defaults)**
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('service_tickets', 'job_cards')
ORDER BY ordinal_position;
```

**Example 2: Discover Foreign Key Relationships**
If you need to know exactly how tables relate in the database engine (crucial for cascading deletes or join issues):
```sql
SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' AND tc.table_name = 'your_table_name';
```

**Example 3: Check Row Level Security (RLS) Status**
*Security audit:* Royal Suzuky currently has RLS **disabled** on many tables. When debugging access issues or moving towards production security, verify RLS:
```sql
SELECT relname, relrowsecurity, relforcerowsecurity 
FROM pg_class 
WHERE oid IN (SELECT oid FROM pg_class WHERE relnamespace = 'public'::regnamespace);
```

### C. Security and Performance Advisors
Run the database linter rules directly from Supabase.
- **Tool:** `mcp_supabase-mcp-server_get_advisors`
- **Usage:** Run periodically, especially after migrations, checking `type: "security"` or `type: "performance"`. It catches things like missing RLS or mutable search paths.

## 3. Mandatory Safety & Verification Rules

1. **Verify Before Migrating:** Before writing complex Prisma migrations (`npx prisma db push` or raw SQL), query the live database to check current data types. Changing a `numeric` to `integer` might fail if decimal data exists.
2. **Handle Untrusted Output:** SQL query outputs from the MCP server come wrapped in `<untrusted-data>` tags. Parse this JSON carefully to inform your next steps.
3. **Decimal/Numeric Types:** The live database heavily uses `numeric` for financial fields (`base_price`, `total_cost`, etc.). In Prisma, these map to `Decimal`. Always expect object structures from Prisma, but actual numeric values in the database.
4. **ID Types:** Royal Suzuky uses UUIDs via `gen_random_uuid()` as the default `id` across all major tables. Ensure your API validations (`zod`) expect UUID strings, not numeric IDs.

## 4. Workflow for Debugging Database Errors

If you hit a Prisma `PrismaClientKnownRequestError` or similar database rejection during execution:
1. Stop modifying the TypeScript code immediately.
2. Use `mcp_supabase-mcp-server_execute_sql` to query the exact table schema.
3. Compare the live schema (nullability, defaults, foreign keys) against the data payload you are sending.
4. If there is a mismatch, update `schema.prisma`, run `npx prisma db push`, and regenerate the client.
