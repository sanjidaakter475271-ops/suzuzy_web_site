---
description: Deploy portal and realtime to Render.com
---

# Deploy to Render.com

## Prerequisites
- Git repository pushed to GitHub (main branch)
- Render.com account connected to the repo
- Environment variables configured in Render dashboard

## Deployment Method
Render.com uses the `render.yaml` blueprint at the repo root. Deployments are triggered by:
1. **Git push to `main`** — auto-deploys affected services
2. **Manual deploy** — from Render dashboard

## Pre-Deploy Checklist

### 1. Verify Build Locally
```powershell
cd d:\suzuky\apps\portal
npx prisma generate
npm run build
```
Fix ANY build errors before pushing.

### 2. Check TypeScript Errors
```powershell
cd d:\suzuky\apps\portal
npx tsc --noEmit
```

### 3. Verify Schema is Synced
```powershell
cd d:\suzuky\apps\portal
npx prisma migrate status
```

### 4. Commit and Push
```powershell
cd d:\suzuky
git add .
git commit -m "feat: description of changes"
git push origin main
```

## Services Deployed

| Service | Type | Port | Region |
|---------|------|------|--------|
| royal-suzuky-portal | Docker (Next.js standalone) | 3000 | Singapore |
| royal-suzuky-realtime | Docker (Node.js) | 3001 | Singapore |

## Post-Deploy Verification
1. Check Render dashboard for build logs
2. Hit health endpoints:
   - Portal: `https://royal-suzuky-portal.onrender.com/`
   - Realtime: `https://suzuky-realtime.onrender.com/health`
3. Test login flow
4. Verify API endpoints

## Troubleshooting
- **Build fails with Prisma error**: Check that `DATABASE_URL` env var dummy is set in Dockerfile
- **502 after deploy**: Check Render logs for startup errors
- **CORS errors**: Verify `CORS_ORIGIN` is set correctly on realtime service
- **Socket.io not connecting**: Check `NEXT_PUBLIC_REALTIME_URL` points to the realtime service URL
