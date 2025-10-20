# 🚀 PRODUCTION DEPLOYMENT PLAN - COMPLETE GUIDE

## CURRENT SITUATION

### Issues:
1. ❌ Old Neon database is SUSPENDED (free tier limitation)
2. ✅ Frontend is WORKING (running on localhost:3000)
3. ✅ Backend is WORKING (running on localhost:8000 with SQLite)
4. ❌ Need to deploy to PRODUCTION with proper PostgreSQL

### Solution:
**Create NEW Neon database + Deploy to Render & Vercel**

---

## STEP 1: CREATE NEW NEON DATABASE

### Option A: Manual Setup (Recommended)
1. Go to https://neon.tech
2. Sign in with your account
3. Click "Create Project"
4. Project Name: `affiliate-learning-platform`
5. Region: `US East (Ohio)` or closest to you
6. PostgreSQL Version: `16`
7. Click "Create Project"

8. **Copy the connection string** (it will look like):
```
postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

9. **Save this connection string** - you'll need it for backend deployment

### Option B: Use Existing Database (If Not Suspended)
If your Neon database is NOT suspended, we can try to wake it up:
1. Go to Neon dashboard
2. Find your project: `ep-wandering-mud-a-adj0z6n6`
3. Click "Resume" or "Wake up"
4. Wait 30 seconds
5. Test connection again

---

## STEP 2: UPDATE BACKEND CONFIGURATION

### Update `.env` file:
```env
# Database Configuration - NEW NEON DATABASE
DATABASE_URL=postgresql://YOUR_NEW_NEON_CONNECTION_STRING

# JWT Secret - GENERATE NEW ONE
SECRET_KEY=<RUN: openssl rand -hex 32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Email Configuration
EMAIL_FROM=roprly@bilvanaturals.online
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=roprly@bilvanaturals.online
SMTP_PASSWORD=Who@reddamma999

# Razorpay Configuration - SWITCH TO LIVE KEYS
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
RAZORPAY_KEY_SECRET=YOUR_LIVE_SECRET

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dihv0v8hr
CLOUDINARY_API_KEY=418925754778477
CLOUDINARY_API_SECRET=LDeO-I6PgsrABW82WzYtDp1yIp8

# Application Settings - PRODUCTION URLS
APP_NAME=Affiliate Learning Platform
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://your-app.onrender.com

# Payout Settings
PAYOUT_DAY=MONDAY
MINIMUM_PAYOUT_AMOUNT=500
```

### Run Database Migrations:
```bash
cd backend
.\venv\Scripts\activate
python -c "from app.core.database import engine, Base; from app.models import *; Base.metadata.create_all(bind=engine)"
```

---

## STEP 3: DEPLOY BACKEND TO RENDER

### 3.1 Prepare for Deployment
1. Make sure all changes are committed:
```bash
git add -A
git commit -m "feat: prepare for production deployment with Neon PostgreSQL"
git push origin main
```

### 3.2 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repository

### 3.3 Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `naveenpro-tech/affilate-learn`
3. Configure:
   - **Name**: `affiliate-learning-backend`
   - **Region**: `Oregon (US West)` or closest
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free` (or `Starter` for better performance)

### 3.4 Add Environment Variables

> **🚨 SECURITY:** Do NOT include real production secrets in this file. All credentials shown below are placeholders.

In Render dashboard, add these environment variables:

```
DATABASE_URL = <YOUR_NEON_CONNECTION_STRING>
SECRET_KEY = <GENERATE_WITH: openssl rand -hex 32>
ALGORITHM = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 10080
EMAIL_FROM = <YOUR_EMAIL_ADDRESS>
SMTP_HOST = smtp.hostinger.com
SMTP_PORT = 465
SMTP_USER = <YOUR_SMTP_USERNAME>
SMTP_PASSWORD = <YOUR_SMTP_PASSWORD>
RAZORPAY_KEY_ID = <YOUR_LIVE_RAZORPAY_KEY_ID>
RAZORPAY_KEY_SECRET = <YOUR_LIVE_RAZORPAY_KEY_SECRET>
CLOUDINARY_CLOUD_NAME = <YOUR_CLOUDINARY_CLOUD_NAME>
CLOUDINARY_API_KEY = <YOUR_CLOUDINARY_API_KEY>
CLOUDINARY_API_SECRET = <YOUR_CLOUDINARY_API_SECRET>
APP_NAME = Affiliate Learning Platform
FRONTEND_URL = https://your-app.vercel.app
BACKEND_URL = https://affiliate-learning-backend.onrender.com
PAYOUT_DAY = MONDAY
MINIMUM_PAYOUT_AMOUNT = 500
```

### 3.5 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Once deployed, copy your backend URL: `https://affiliate-learning-backend.onrender.com`

### 3.6 Run Database Migrations
After deployment, go to Render dashboard:
1. Click on your service
2. Go to "Shell" tab
3. Run:
```bash
python -c "from app.core.database import engine, Base; from app.models import *; Base.metadata.create_all(bind=engine)"
```

### 3.7 Verify Backend
Visit: `https://affiliate-learning-backend.onrender.com/health`
Should return: `{"status": "healthy"}`

Visit: `https://affiliate-learning-backend.onrender.com/docs`
Should show API documentation

---

## STEP 4: DEPLOY FRONTEND TO VERCEL

### 4.1 Update Frontend Environment Variables
Create `frontend/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://affiliate-learning-backend.onrender.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
```

### 4.2 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access your repository

### 4.3 Import Project
1. Click "Add New..." → "Project"
2. Import your GitHub repository: `naveenpro-tech/affilate-learn`
3. Configure:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 4.4 Add Environment Variables
In Vercel dashboard, add:
```
NEXT_PUBLIC_API_URL = https://affiliate-learning-backend.onrender.com
NEXT_PUBLIC_RAZORPAY_KEY_ID = rzp_live_YOUR_LIVE_KEY
```

### 4.5 Deploy
1. Click "Deploy"
2. Wait for deployment (3-5 minutes)
3. Once deployed, copy your frontend URL: `https://your-app.vercel.app`

### 4.6 Update Backend FRONTEND_URL
Go back to Render dashboard:
1. Update `FRONTEND_URL` environment variable to your Vercel URL
2. Redeploy backend

---

## STEP 5: VERIFY PRODUCTION DEPLOYMENT

### 5.1 Test Backend
1. Visit: `https://affiliate-learning-backend.onrender.com/health`
2. Visit: `https://affiliate-learning-backend.onrender.com/docs`
3. Test API endpoints

### 5.2 Test Frontend
1. Visit: `https://your-app.vercel.app`
2. Test registration
3. Test login
4. Test dashboard
5. Test all features

### 5.3 Test Integration
1. Register a new user
2. Login
3. Purchase a package
4. Create a referral
5. Check earnings
6. Test payout request

---

## STEP 6: POST-DEPLOYMENT TASKS

### 6.1 Update CORS Settings
In `backend/app/main.py`, update CORS origins:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",
        "http://localhost:3000",  # Keep for local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 6.2 Set Up Custom Domain (Optional)
**For Frontend (Vercel)**:
1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

**For Backend (Render)**:
1. Go to Render dashboard → Settings → Custom Domains
2. Add your custom domain
3. Update DNS records as instructed

### 6.3 Enable HTTPS
Both Render and Vercel provide free SSL certificates automatically.

### 6.4 Set Up Monitoring
**Render**:
- Enable "Auto-Deploy" for automatic deployments on git push
- Set up health checks
- Configure alerts

**Vercel**:
- Enable "Production" deployments
- Set up preview deployments for branches
- Configure analytics

---

## STEP 7: SWITCH FROM SQLITE TO POSTGRESQL LOCALLY

### Update `backend/.env`:
```env
DATABASE_URL=postgresql://YOUR_NEW_NEON_CONNECTION_STRING
```

### Restart Backend:
```bash
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Run Migrations:
```bash
python -c "from app.core.database import engine, Base; from app.models import *; Base.metadata.create_all(bind=engine)"
```

---

## TROUBLESHOOTING

### Issue: Neon Database Connection Fails
**Solution**:
1. Check if database is suspended (go to Neon dashboard)
2. Click "Resume" to wake it up
3. Wait 30 seconds and try again
4. If still fails, create a NEW Neon project

### Issue: Render Deployment Fails
**Solution**:
1. Check build logs in Render dashboard
2. Verify `requirements.txt` is correct
3. Ensure `backend` directory is set as root
4. Check Python version (should be 3.11+)

### Issue: Vercel Deployment Fails
**Solution**:
1. Check build logs in Vercel dashboard
2. Verify `package.json` is correct
3. Ensure `frontend` directory is set as root
4. Check Node version (should be 18+)

### Issue: CORS Errors
**Solution**:
1. Update CORS origins in `backend/app/main.py`
2. Add your Vercel URL to allowed origins
3. Redeploy backend

### Issue: API Not Connecting
**Solution**:
1. Verify `NEXT_PUBLIC_API_URL` in Vercel
2. Check backend is running: visit `/health` endpoint
3. Check CORS settings
4. Verify environment variables

---

## QUICK DEPLOYMENT CHECKLIST

- [ ] Create NEW Neon database
- [ ] Copy connection string
- [ ] Update `backend/.env` with new database URL
- [ ] Generate new SECRET_KEY
- [ ] Switch to live Razorpay keys
- [ ] Commit and push all changes
- [ ] Create Render account
- [ ] Deploy backend to Render
- [ ] Add environment variables in Render
- [ ] Run database migrations on Render
- [ ] Verify backend health endpoint
- [ ] Create Vercel account
- [ ] Deploy frontend to Vercel
- [ ] Add environment variables in Vercel
- [ ] Update backend FRONTEND_URL
- [ ] Test registration and login
- [ ] Test all features
- [ ] Update CORS settings
- [ ] Set up custom domains (optional)
- [ ] Enable monitoring and alerts

---

## FINAL NOTES

1. **Database**: Use Neon PostgreSQL for production (NOT SQLite)
2. **Secrets**: Generate new SECRET_KEY for production
3. **Razorpay**: Switch to LIVE keys for production
4. **URLs**: Update FRONTEND_URL and BACKEND_URL to production URLs
5. **CORS**: Add production URLs to CORS allowed origins
6. **Monitoring**: Set up health checks and alerts
7. **Backups**: Neon provides automatic backups
8. **Scaling**: Upgrade Render/Vercel plans as needed

---

**Estimated Time**: 1-2 hours for complete deployment
**Cost**: $0 (using free tiers) or ~$20/month (using paid tiers)

