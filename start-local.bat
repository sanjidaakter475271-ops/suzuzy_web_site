@echo off
echo Starting Royal Suzuky Local Development Environment...
echo ========================================================

echo Starting Realtime Server (Port 3001)...
start "Royal Suzuky Realtime Server" cmd /k "cd apps\realtime && npm install && npm start"

echo Starting Portal App (Port 3000)...
start "Royal Suzuky Portal" cmd /k "cd apps\portal && npm run dev"

echo ========================================================
echo All services started!
echo Portal: http://localhost:3000
echo Realtime: http://localhost:3001
echo ========================================================
