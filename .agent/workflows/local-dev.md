---
description: Start all three services (portal, realtime, servicestuff) for local development
---

# Local Development Startup

Start all three services for full-stack local development.

## Prerequisites
- Node.js 18+ installed
- `.env.local` configured in each app
- Database accessible (Supabase)

## Steps

### 1. Start the Realtime Server (Terminal 1)
```powershell
cd d:\suzuky\apps\realtime
npm start
```
Expected: Server running on `http://localhost:3001`

### 2. Start the Portal (Terminal 2)
```powershell
cd d:\suzuky\apps\portal
npm run dev
```
Expected: Next.js dev server on `http://localhost:3000`

### 3. Start servicestuff (Terminal 3)
```powershell
cd d:\suzuky\servicestuff
npm run dev
```
Expected: Vite dev server on `http://localhost:5173`

## Environment Variables

### Portal (`apps/portal/.env.local`)
```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=key
NEXT_PUBLIC_REALTIME_URL=http://localhost:3001
JWT_SECRET=your-32-char-secret
```

### servicestuff (`servicestuff/.env.local`)
```
VITE_PORTAL_API_URL=http://localhost:3000
VITE_REALTIME_URL=http://localhost:3001
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=key
```

## All-in-one (using start-local.bat)
```powershell
cd d:\suzuky
.\start-local.bat
```

## Verification
1. Open `http://localhost:3000` → Portal login page
2. Open `http://localhost:3001/health` → `{"status":"ok"}`
3. Open `http://localhost:5173` → Servicestuff splash/login
