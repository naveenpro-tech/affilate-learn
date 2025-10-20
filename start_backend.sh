#!/bin/bash

# Backend Server Launch Script
# Kills existing uvicorn processes and starts the FastAPI server

echo "🚀 Starting Backend Server..."

# Kill any existing uvicorn processes on port 8000
echo "🔍 Checking for existing uvicorn processes..."
pkill -f "uvicorn app.main:app" || true
sleep 1

# Check if port 8000 is still in use
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 8000 is still in use. Attempting to kill process..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Change to backend directory
cd backend || { echo "❌ Error: backend directory not found"; exit 1; }

# Check if virtual environment exists and activate it
if [ -d "venv" ]; then
    echo "🐍 Activating virtual environment..."
    source venv/bin/activate
elif [ -d "../venv" ]; then
    echo "🐍 Activating virtual environment..."
    source ../venv/bin/activate
fi

# Start the FastAPI server with uvicorn
echo "✅ Starting uvicorn server on http://localhost:8000"
echo "📝 Logs will be displayed below..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

