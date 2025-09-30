# Start Backend Server
# Run this in Terminal 1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Backend Server              " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location backend

# Check if virtual environment exists
if (-Not (Test-Path "venv")) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "   Please create it first:" -ForegroundColor Yellow
    Write-Host "   python -m venv venv" -ForegroundColor White
    Write-Host "   .\venv\Scripts\activate" -ForegroundColor White
    Write-Host "   pip install -r requirements.txt" -ForegroundColor White
    exit 1
}

Write-Host "✅ Virtual environment found" -ForegroundColor Green
Write-Host "🚀 Activating virtual environment..." -ForegroundColor Yellow
Write-Host ""

# Activate virtual environment and start server
& .\venv\Scripts\activate
Write-Host "✅ Virtual environment activated" -ForegroundColor Green
Write-Host "🚀 Starting Uvicorn server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press CTRL+C to stop the server" -ForegroundColor Gray
Write-Host ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

