---
description: Safe workflow for making Prisma schema changes (Windows + Supabase compatible)
---

# Prisma Schema Change Workflow

Safe process for modifying the Prisma schema on Windows with Supabase (no shadow DB).

## ⚠️ Important
- Schema is at `d:\suzuzy_web_site\apps\portal\prisma\schema.prisma`
- NEVER rewrite the entire file — only edit specific sections
- Supabase pooler does NOT support shadow databases

## 1. Pulling Schema from Remote Database (Introspection)
Use this if someone else changed the database or you made changes in Supabase Dashboard.
// turbo
```powershell
cd d:\suzuzy_web_site\apps\portal
npx prisma db pull
```
*Note: If you get P1001 (Can't reach database), ensure your DATABASE_URL in .env is using the pooler URL (aws-1-ap-south-1.pooler.supabase.com).*

## 2. Find the Model to Edit
// turbo
```powershell
Select-String -Path "d:\suzuzy_web_site\apps\portal\prisma\schema.prisma" -Pattern "model your_model_name" -Context 0,40
```

## 3. Make Schema Changes
Edit only the specific lines needed. Common changes:
- Adding fields to an existing model
- Adding a new model
- Adding/modifying relations
- Adding enums

## 4. Validate the Schema
// turbo
```powershell
cd d:\suzuzy_web_site\apps\portal
npx prisma validate
```
Fix any errors before proceeding.

## 5. Format the Schema
// turbo
```powershell
cd d:\suzuzy_web_site\apps\portal
npx prisma format
```

## 6. Push to Database (Development)
```powershell
cd d:\suzuzy_web_site\apps\portal
npx prisma db push
```
⚠️ **READ the output carefully!** It will warn if data will be lost.

## 7. Regenerate Client Types
// turbo
```powershell
cd d:\suzuzy_web_site\apps\portal
npx prisma generate
```

## 8. Verify Model Exists in Client
// turbo
```powershell
Select-String -Path "d:\suzuzy_web_site\apps\portal\node_modules\.prisma\client\index.d.ts" -Pattern "your_model_name" | Select-Object -First 5
```

## 9. For Production (Creating Migration Files)
```powershell
cd d:\suzuzy_web_site\apps\portal

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
- **"Error: P1001"**: Database unreachable. Check network or if pooler URL is correct in `.env`.
