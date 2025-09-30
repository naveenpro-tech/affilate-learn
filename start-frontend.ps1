# Start Frontend Server
# Run this in Terminal 2

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Frontend Server             " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to frontend directory
Set-Location frontend

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "❌ node_modules not found!" -ForegroundColor Red
    Write-Host "   Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

Write-Host "✅ Dependencies found" -ForegroundColor Green
Write-Host "🚀 Starting Next.js development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press CTRL+C to stop the server" -ForegroundColor Gray
Write-Host ""

npm run dev

