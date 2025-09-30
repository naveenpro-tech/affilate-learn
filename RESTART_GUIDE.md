# 🔄 Complete Restart Guide - Backend & Frontend

## 🛑 STEP 1: Kill All Running Instances

### Windows (PowerShell):

```powershell
# Kill all Node.js processes (Frontend)
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Kill all Python processes (Backend)
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

# Kill all processes on port 3000 (Frontend)
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Stop-Process -Id $port3000.OwningProcess -Force
}

# Kill all processes on port 8000 (Backend)
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    Stop-Process -Id $port8000.OwningProcess -Force
}

# Verify ports are free
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

### Alternative Method (If above doesn't work):

```powershell
# Find and kill process on port 3000
netstat -ano | findstr :3000
# Note the PID (last column), then:
taskkill /PID <PID_NUMBER> /F

# Find and kill process on port 8000
netstat -ano | findstr :8000
# Note the PID (last column), then:
taskkill /PID <PID_NUMBER> /F
```

---

## 🧹 STEP 2: Clear All Caches

### Frontend Cache Clearing:

```powershell
# Navigate to frontend directory
cd frontend

# Delete Next.js cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Delete node_modules cache
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue

# Delete build cache
Remove-Item -Recurse -Force .turbo -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force
```

### Backend Cache Clearing:

```powershell
# Navigate to backend directory
cd ../backend

# Delete Python cache
Get-ChildItem -Path . -Include __pycache__ -Recurse -Force | Remove-Item -Recurse -Force
Get-ChildItem -Path . -Include *.pyc -Recurse -Force | Remove-Item -Force
Get-ChildItem -Path . -Include *.pyo -Recurse -Force | Remove-Item -Force

# Delete pytest cache
Remove-Item -Recurse -Force .pytest_cache -ErrorAction SilentlyContinue

# Clear pip cache
pip cache purge
```

---

## 🚀 STEP 3: Start Backend

```powershell
# Navigate to backend directory
cd backend

# Activate virtual environment
.\venv\Scripts\activate

# Verify environment is activated (you should see (venv) in prompt)

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# You should see:
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process
# INFO:     Started server process
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.
```

### Backend Health Check:

Open browser and visit: http://localhost:8000/health

You should see: `{"status": "healthy"}`

---

## 🎨 STEP 4: Start Frontend

**Open a NEW terminal window** (keep backend running in the first terminal)

```powershell
# Navigate to frontend directory
cd frontend

# Start frontend development server
npm run dev

# You should see:
# ▲ Next.js 15.x.x
# - Local:        http://localhost:3000
# - Network:      http://192.168.x.x:3000
# ✓ Ready in Xms
```

### Frontend Health Check:

Open browser and visit: http://localhost:3000

You should see the login page.

---

## ✅ STEP 5: Verify Everything is Working

### 1. Check Backend API:
- Visit: http://localhost:8000/docs
- You should see the FastAPI Swagger documentation

### 2. Check Frontend:
- Visit: http://localhost:3000
- Login with your credentials
- Navigate through pages (Dashboard, Packages, Payouts, etc.)

### 3. Check Database Connection:
- Try logging in
- If login works, database connection is good

---

## 🔧 TROUBLESHOOTING

### Problem: Port Already in Use

**Error:** `Address already in use` or `EADDRINUSE`

**Solution:**
```powershell
# For port 3000:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# For port 8000:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Problem: Module Not Found (Backend)

**Error:** `ModuleNotFoundError: No module named 'app'`

**Solution:**
```powershell
# Make sure you're in backend directory
cd backend

# Activate virtual environment
.\venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Problem: Module Not Found (Frontend)

**Error:** `Cannot find module` or `Module not found`

**Solution:**
```powershell
# Make sure you're in frontend directory
cd frontend

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

### Problem: Database Connection Error

**Error:** `Could not connect to database`

**Solution:**
1. Check your `.env` file in backend directory
2. Verify `DATABASE_URL` is correct
3. Make sure Neon database is accessible

### Problem: CORS Error

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
1. Check backend is running on port 8000
2. Check frontend is running on port 3000
3. Verify `FRONTEND_URL` in backend `.env` file

---

## 📝 COMPLETE RESTART SCRIPT (PowerShell)

Save this as `restart.ps1` in your project root:

```powershell
# Complete Restart Script

Write-Host "🛑 Stopping all processes..." -ForegroundColor Yellow

# Kill Node.js
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Kill Python
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

# Kill port 3000
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) { Stop-Process -Id $port3000.OwningProcess -Force }

# Kill port 8000
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) { Stop-Process -Id $port8000.OwningProcess -Force }

Write-Host "✅ All processes stopped" -ForegroundColor Green

Write-Host "🧹 Clearing caches..." -ForegroundColor Yellow

# Clear frontend cache
cd frontend
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
npm cache clean --force

# Clear backend cache
cd ../backend
Get-ChildItem -Path . -Include __pycache__ -Recurse -Force | Remove-Item -Recurse -Force
Get-ChildItem -Path . -Include *.pyc -Recurse -Force | Remove-Item -Force

Write-Host "✅ Caches cleared" -ForegroundColor Green

Write-Host "🚀 Starting backend..." -ForegroundColor Yellow
Write-Host "Open a new terminal and run: cd backend && .\venv\Scripts\activate && uvicorn app.main:app --reload" -ForegroundColor Cyan

Write-Host "🎨 Starting frontend..." -ForegroundColor Yellow
Write-Host "Open another terminal and run: cd frontend && npm run dev" -ForegroundColor Cyan

Write-Host "✅ Restart complete!" -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
```

**To run the script:**
```powershell
.\restart.ps1
```

---

## 🎯 QUICK REFERENCE

### Start Backend:
```powershell
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload
```

### Start Frontend:
```powershell
cd frontend
npm run dev
```

### Stop Everything:
```powershell
# Press CTRL+C in each terminal
# Or close the terminal windows
```

### Clear Caches:
```powershell
# Frontend
cd frontend && Remove-Item -Recurse -Force .next

# Backend
cd backend && Get-ChildItem -Path . -Include __pycache__ -Recurse -Force | Remove-Item -Recurse -Force
```

---

## 🔄 DAILY WORKFLOW

### Morning Startup:
1. Open 2 terminal windows
2. Terminal 1: Start backend
3. Terminal 2: Start frontend
4. Open browser to http://localhost:3000

### During Development:
- Backend auto-reloads on file changes (--reload flag)
- Frontend auto-reloads on file changes (Next.js hot reload)
- No need to restart unless you change dependencies

### End of Day:
- Press CTRL+C in both terminals
- Or just close the terminals

---

## ⚠️ IMPORTANT NOTES

1. **Always activate virtual environment** before running backend
2. **Keep both terminals open** while developing
3. **Backend must start first** before frontend
4. **Clear caches** if you see weird behavior
5. **Check ports** if you get "address in use" errors
6. **No caching** - Fresh data on every refresh

---

**Need help?** Check the logs in the terminal for error messages.

