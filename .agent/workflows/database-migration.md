---
description: How to manage Database Migrations without a Shadow Database (Supabase)
---

# Database Migration Workflow

Since Supabase Transaction Poolers do not support Shadow Databases (required for `migrate dev`), use this workflow.

## 1. Development (Rapid Iteration)
When you are editing `schema.prisma` and testing locally:

```bash
npx prisma db push
```

**Why?**
- It compares your local schema to the database.
- It applies changes immediately.
- **No Shadow DB required.**
- **Warning**: It may warn you about data loss if you delete columns. Read the warnings!

## 2. Production (Creating Migration Files)
When you are ready to commit your changes and want a history (migration file):

1.  **Generate the SQL file**:
    ```bash
    # Create a new folder for the migration
    mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_new_migration
    
    # Generate the SQL diff
    npx prisma migrate diff --from-db --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/$(date +%Y%m%d%H%M%S)_new_migration/migration.sql
    ```

2.  **Apply to Production** (if not already applied via push):
    ```bash
    npx prisma migrate resolve --applied $(date +%Y%m%d%H%M%S)_new_migration
    ```
    *Note: If `db push` already applied the changes, use `resolve --applied` to tell Prisma "this is done".*

## Summary
- **Day-to-day**: Use `npx prisma db push`.
- **Status Check**: Use `npx prisma migrate status`.
