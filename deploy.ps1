# Production Deployment Script
# Run this to deploy your application to production

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRODUCTION DEPLOYMENT SCRIPT         " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Neon database connection string is provided
Write-Host "STEP 1: Database Configuration" -ForegroundColor Yellow
Write-Host ""
Write-Host "You need a NEW Neon PostgreSQL database." -ForegroundColor White
Write-Host "The old database is suspended." -ForegroundColor Red
Write-Host ""
Write-Host "Please follow these steps:" -ForegroundColor White
Write-Host "1. Go to https://neon.tech" -ForegroundColor White
Write-Host "2. Create a new project" -ForegroundColor White
Write-Host "3. Copy the connection string" -ForegroundColor White
Write-Host ""
$DATABASE_URL = Read-Host "Paste your NEW Neon connection string here"

if ([string]::IsNullOrWhiteSpace($DATABASE_URL)) {
    Write-Host "❌ No database URL provided. Exiting..." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database URL received" -ForegroundColor Green
Write-Host ""

# Step 2: Generate SECRET_KEY
Write-Host "STEP 2: Generate SECRET_KEY" -ForegroundColor Yellow
Write-Host ""
Write-Host "Generating secure SECRET_KEY..." -ForegroundColor White

# Generate random hex string (32 bytes = 64 hex characters)
$SECRET_KEY = -join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })

Write-Host "✅ SECRET_KEY generated: $SECRET_KEY" -ForegroundColor Green
Write-Host ""

# Step 3: Get Razorpay LIVE keys
Write-Host "STEP 3: Razorpay Configuration" -ForegroundColor Yellow
Write-Host ""
Write-Host "For production, you need LIVE Razorpay keys." -ForegroundColor White
Write-Host "Current keys are TEST keys (rzp_test_...)" -ForegroundColor Yellow
Write-Host ""
$USE_LIVE_RAZORPAY = Read-Host "Do you have LIVE Razorpay keys? (y/n)"

if ($USE_LIVE_RAZORPAY -eq "y") {
    $RAZORPAY_KEY_ID = Read-Host "Enter your LIVE Razorpay Key ID (rzp_live_...)"
    $RAZORPAY_KEY_SECRET = Read-Host "Enter your LIVE Razorpay Key Secret"
} else {
    Write-Host "⚠️  Using TEST keys for now. Switch to LIVE keys before accepting real payments!" -ForegroundColor Yellow
    $RAZORPAY_KEY_ID = "rzp_test_RBrPafmy42Nmd7"
    $RAZORPAY_KEY_SECRET = "5TVK1iA2npjluW6vDb0EXIn1"
}

Write-Host "✅ Razorpay configured" -ForegroundColor Green
Write-Host ""

# Step 4: Update backend .env file
Write-Host "STEP 4: Updating backend configuration" -ForegroundColor Yellow
Write-Host ""

$ENV_CONTENT = @"
# Database Configuration - PRODUCTION
DATABASE_URL=$DATABASE_URL

# JWT Secret - PRODUCTION
SECRET_KEY=$SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Email Configuration
EMAIL_FROM=roprly@bilvanaturals.online
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=roprly@bilvanaturals.online
SMTP_PASSWORD=Who@reddamma999

# Razorpay Configuration
RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=$RAZORPAY_KEY_SECRET

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dihv0v8hr
CLOUDINARY_API_KEY=418925754778477
CLOUDINARY_API_SECRET=LDeO-I6PgsrABW82WzYtDp1yIp8

# Application Settings - Will be updated after deployment
APP_NAME=Affiliate Learning Platform
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Payout Settings
PAYOUT_DAY=MONDAY
MINIMUM_PAYOUT_AMOUNT=500
"@

Set-Content -Path "backend\.env" -Value $ENV_CONTENT

Write-Host "✅ Backend .env updated" -ForegroundColor Green
Write-Host ""

# Step 5: Test database connection
Write-Host "STEP 5: Testing database connection" -ForegroundColor Yellow
Write-Host ""

Set-Location backend
.\venv\Scripts\activate

Write-Host "Testing connection to Neon database..." -ForegroundColor White
python -c "import psycopg2; conn = psycopg2.connect('$DATABASE_URL'); print('✅ Connection successful!'); conn.close()" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database connection failed!" -ForegroundColor Red
    Write-Host "Please check your connection string and try again." -ForegroundColor Yellow
    Set-Location ..
    exit 1
}

Write-Host ""

# Step 6: Run database migrations
Write-Host "STEP 6: Creating database tables" -ForegroundColor Yellow
Write-Host ""

Write-Host "Running migrations..." -ForegroundColor White
python -c "from app.core.database import engine, Base; from app.models import *; Base.metadata.create_all(bind=engine); print('✅ All tables created successfully!')"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Set-Location ..

# Step 7: Commit changes
Write-Host "STEP 7: Committing changes to Git" -ForegroundColor Yellow
Write-Host ""

git add backend/.env
git commit -m "feat: configure production database and environment variables"

Write-Host "✅ Changes committed" -ForegroundColor Green
Write-Host ""

# Step 8: Push to GitHub
Write-Host "STEP 8: Pushing to GitHub" -ForegroundColor Yellow
Write-Host ""

git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Pushed to GitHub" -ForegroundColor Green
Write-Host ""

# Step 9: Deployment instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NEXT STEPS: DEPLOY TO PRODUCTION     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Backend is configured and ready!" -ForegroundColor Green
Write-Host "✅ Database tables created!" -ForegroundColor Green
Write-Host "✅ Changes pushed to GitHub!" -ForegroundColor Green
Write-Host ""

Write-Host "NOW DEPLOY TO RENDER & VERCEL:" -ForegroundColor Yellow
Write-Host ""

Write-Host "BACKEND (Render):" -ForegroundColor Cyan
Write-Host "1. Go to https://render.com" -ForegroundColor White
Write-Host "2. Sign up with GitHub" -ForegroundColor White
Write-Host "3. Create New Web Service" -ForegroundColor White
Write-Host "4. Connect repository: naveenpro-tech/affilate-learn" -ForegroundColor White
Write-Host "5. Root Directory: backend" -ForegroundColor White
Write-Host "6. Build Command: pip install -r requirements.txt" -ForegroundColor White
Write-Host "7. Start Command: uvicorn app.main:app --host 0.0.0.0 --port `$PORT" -ForegroundColor White
Write-Host "8. Add ALL environment variables from backend/.env" -ForegroundColor White
Write-Host "9. Deploy!" -ForegroundColor White
Write-Host ""

Write-Host "FRONTEND (Vercel):" -ForegroundColor Cyan
Write-Host "1. Go to https://vercel.com" -ForegroundColor White
Write-Host "2. Sign up with GitHub" -ForegroundColor White
Write-Host "3. Import Project: naveenpro-tech/affilate-learn" -ForegroundColor White
Write-Host "4. Root Directory: frontend" -ForegroundColor White
Write-Host "5. Framework: Next.js" -ForegroundColor White
Write-Host "6. Add environment variables:" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID" -ForegroundColor White
Write-Host "7. Deploy!" -ForegroundColor White
Write-Host ""

Write-Host "AFTER DEPLOYMENT:" -ForegroundColor Cyan
Write-Host "1. Update FRONTEND_URL in Render to your Vercel URL" -ForegroundColor White
Write-Host "2. Update BACKEND_URL in Render to your Render URL" -ForegroundColor White
Write-Host "3. Redeploy backend" -ForegroundColor White
Write-Host "4. Test your application!" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT PREPARATION COMPLETE!     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 See PRODUCTION_DEPLOYMENT_PLAN.md for detailed instructions" -ForegroundColor Yellow
Write-Host ""

