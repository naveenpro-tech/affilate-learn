# Complete Restart Script for Affiliate Learning Platform
# Run this script to stop all processes and clear caches

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Affiliate Learning Platform Restart  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop all processes
Write-Host "🛑 Step 1: Stopping all processes..." -ForegroundColor Yellow
Write-Host ""

# Kill Node.js processes
Write-Host "   Stopping Node.js processes..." -ForegroundColor Gray
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Milliseconds 500

# Kill Python processes
Write-Host "   Stopping Python processes..." -ForegroundColor Gray
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Milliseconds 500

# Kill processes on port 3000
Write-Host "   Freeing port 3000..." -ForegroundColor Gray
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Stop-Process -Id $port3000.OwningProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Milliseconds 500

# Kill processes on port 8000
Write-Host "   Freeing port 8000..." -ForegroundColor Gray
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    Stop-Process -Id $port8000.OwningProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Milliseconds 500

Write-Host "✅ All processes stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Clear caches
Write-Host "🧹 Step 2: Clearing all caches..." -ForegroundColor Yellow
Write-Host ""

# Clear frontend cache
Write-Host "   Clearing frontend cache..." -ForegroundColor Gray
Push-Location frontend
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .turbo -ErrorAction SilentlyContinue
Pop-Location

# Clear backend cache
Write-Host "   Clearing backend cache..." -ForegroundColor Gray
Push-Location backend
Get-ChildItem -Path . -Include __pycache__ -Recurse -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path . -Include *.pyc -Recurse -Force -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path . -Include *.pyo -Recurse -Force -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .pytest_cache -ErrorAction SilentlyContinue
Pop-Location

Write-Host "✅ All caches cleared" -ForegroundColor Green
Write-Host ""

# Step 3: Instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps - Start the Servers       " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 TERMINAL 1 - Start Backend:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   .\venv\Scripts\activate" -ForegroundColor White
Write-Host "   uvicorn app.main:app --reload" -ForegroundColor White
Write-Host ""

Write-Host "📝 TERMINAL 2 - Start Frontend:" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "🌐 URLs:" -ForegroundColor Yellow
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Restart preparation complete!" -ForegroundColor Green
Write-Host "   Open 2 terminals and run the commands above." -ForegroundColor Gray
Write-Host ""

