---
description: Safe workflow for making Prisma schema changes (Windows + Supabase compatible)
---

# Prisma Schema Change Workflow

Safe process for modifying the Prisma schema on Windows with Supabase (no shadow DB).

## ⚠️ Important
- Schema is at `d:\suzuky\apps\portal\prisma\schema.prisma` (~192KB)
- NEVER rewrite the entire file — only edit specific sections
- Supabase pooler does NOT support shadow databases

## 1. Find the Model to Edit
// turbo
```powershell
Select-String -Path "d:\suzuky\apps\portal\prisma\schema.prisma" -Pattern "model your_model_name" -Context 0,40
```

## 2. Make Schema Changes
Edit only the specific lines needed. Common changes:
- Adding fields to an existing model
- Adding a new model
- Adding/modifying relations
- Adding enums

## 3. Validate the Schema
// turbo
```powershell
cd d:\suzuky\apps\portal
npx prisma validate
```
Fix any errors before proceeding.

## 4. Format the Schema
// turbo
```powershell
cd d:\suzuky\apps\portal
npx prisma format
```

## 5. Push to Database (Development)
```powershell
cd d:\suzuky\apps\portal
npx prisma db push
```
⚠️ **READ the output carefully!** It will warn if data will be lost.

## 6. Regenerate Client Types
// turbo
```powershell
cd d:\suzuky\apps\portal
npx prisma generate
```

## 7. Verify Model Exists in Client
// turbo
```powershell
Select-String -Path "d:\suzuky\apps\portal\node_modules\.prisma\client\index.d.ts" -Pattern "your_model_name" | Select-Object -First 5
```

## 8. For Production (Creating Migration Files)
```powershell
cd d:\suzuky\apps\portal

# Create migration directory (Windows)
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$migrationDir = "prisma\migrations\${timestamp}_your_migration_name"
New-Item -Path $migrationDir -ItemType Directory -Force

# Generate SQL diff
npx prisma migrate diff --from-database-url $env:DATABASE_URL --to-schema-datamodel prisma\schema.prisma --script | Out-File "$migrationDir\migration.sql" -Encoding utf8
```

## Common Issues
- **"Model not found on PrismaClient"**: Run `npx prisma generate` and restart dev server
- **"Unique constraint violation"**: Check if you're adding a unique field to existing data
- **"Foreign key constraint"**: Ensure referenced table exists before creating FK
