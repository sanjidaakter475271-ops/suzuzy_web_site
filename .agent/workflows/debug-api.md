---
description: Debug API issues between portal and servicestuff mobile app
---

# Debug API Workflow

Step-by-step process for debugging API issues between the portal backend and the servicestuff mobile frontend.

## Symptom Categories

### A. 401 Unauthorized
1. **Check token exists on mobile side:**
   - Open `servicestuff/services/api.ts` — is the interceptor adding the Bearer token?
   - Check `Capacitor Preferences` has `auth_token` key stored

2. **Check auth on portal side:**
   - Open the relevant API route
   - Verify it uses `getCurrentUser()` from `@/lib/auth/get-user`
   - Check `src/lib/auth/jwt.ts` — is `JWT_SECRET` matching across portal and realtime?

3. **Test the `/api/auth/me` endpoint:**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" -Headers @{ "Authorization" = "Bearer YOUR_TOKEN" }
   ```

### B. Data Shape Mismatch (Frontend shows wrong data or crashes)
1. **Check mobile type:** Open `servicestuff/types.ts`, find the relevant interface
2. **Check API response:** Hit the endpoint directly:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/v1/technician/endpoint" -Headers @{ "Authorization" = "Bearer TOKEN" } | ConvertTo-Json -Depth 5
   ```
3. **Compare:** Does the API response shape match the TypeScript interface?
4. **Common issues:**
   - Prisma Decimal not converted to Number
   - Nested relations not included (`include` missing in Prisma query)
   - Different field names (snake_case vs camelCase)

### C. 500 Internal Server Error
1. **Check portal terminal** for error stack trace
2. **Common causes:**
   - Prisma model name typo (check schema with `Select-String`)
   - Null `dealerId` — user profile missing dealer association
   - Missing `include` for required relations
   - BigInt/Decimal serialization failures

### D. Realtime Events Not Arriving
1. **Check realtime server is running:** `http://localhost:3001/health`
2. **Check broadcast call:** Does the API route POST to `/broadcast`?
3. **Check room routing:** Does the event data include `dealer_id` or `technician_id`?
4. **Check mobile listener:** Is `SocketService` connected and listening?

## Diagnostic Commands

### Check if portal is running
// turbo
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" -Method GET 2>&1
```

### Check realtime health
// turbo
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET
```

### Search for an API route
// turbo
```powershell
Get-ChildItem -Path "d:\suzuky\apps\portal\src\app\api" -Recurse -Filter "route.ts" | Select-String -Pattern "endpoint_name"
```

### Check Prisma model
// turbo
```powershell
Select-String -Path "d:\suzuky\apps\portal\prisma\schema.prisma" -Pattern "model model_name" -Context 0,20
```
