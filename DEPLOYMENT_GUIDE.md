# 🚀 Deployment Guide - Affiliate Learning Platform

**Strategy 1: Quick Testing Deployment (Vercel + Render + Turso)**

This guide will help you deploy your Affiliate Learning Platform to production using:
- **Frontend**: Vercel (Next.js)
- **Backend**: Render (FastAPI)
- **Database**: Turso (LibSQL)

---

## 📋 Prerequisites

Before starting, ensure you have:

1. ✅ **Turso Database** (Already provisioned)
   - Database URL: `libsql://affilate-learn-naveenvide.aws-ap-south-1.turso.io`
   - Auth Token: `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...`

2. ✅ **GitHub Repository**
   - Push your code to GitHub
   - Repository should be public or connected to Vercel/Render

3. ✅ **Accounts Created**
   - Vercel account (https://vercel.com)
   - Render account (https://render.com)

4. ✅ **Production Credentials**
   - Razorpay LIVE keys (not test keys)
   - Hostinger SMTP credentials
   - Cloudinary credentials

---

## 🗄️ Step 1: Prepare Turso Database

### 1.1 Initialize Database Schema

Since Turso is already provisioned, you need to initialize the database schema:

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login to Turso
turso auth login

# Connect to your database
turso db shell affilate-learn-naveenvide

# Run migrations (we'll create a migration script)
```

### 1.2 Create Database Migration Script

We'll create a script to initialize the database schema on Turso.

**Option A: Export from SQLite**
```bash
# From your local development
cd backend
sqlite3 app.db .dump > schema.sql

# Then import to Turso
turso db shell affilate-learn-naveenvide < schema.sql
```

**Option B: Use SQLAlchemy to create tables**
```python
# Run this script to create all tables
python -c "from app.core.database import engine, Base; from app.models import *; Base.metadata.create_all(bind=engine)"
```

---

## 🖥️ Step 2: Deploy Backend to Render

### 2.1 Create New Web Service

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository: `affilate-learn`

### 2.2 Configure Service

**Basic Settings:**
- **Name**: `affiliate-learning-backend`
- **Region**: `Singapore` (or closest to your users)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Advanced Settings:**
- **Health Check Path**: `/health`
- **Auto-Deploy**: `Yes`

### 2.3 Set Environment Variables

In Render dashboard, go to **Environment** tab and add these variables:

**Database:**
```
DATABASE_URL=libsql://affilate-learn-naveenvide.aws-ap-south-1.turso.io
TURSO_DATABASE_URL=libsql://affilate-learn-naveenvide.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjEzODE4NzgsImlkIjoiMWQ2ZDc5M2MtOWNmZS00MWViLWJkNmQtOWQwNzNkMWRlYzYzIiwicmlkIjoiZmMwZGQ2MzMtYzFkYS00MDdkLWE0ZTEtOTkxYmM4ZjhmZmYyIn0.gnij8ofAd_UxntFQw-y_txa0VXg0auh9MEKHcbSjKQZ5fdlUUT-fskUDH_UU6Qo1V4T3OoYlpKhEZHhokYY2Cg
```

**JWT:**
```
SECRET_KEY=<Generate using: openssl rand -hex 32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

**Email (Hostinger SMTP):**
```
EMAIL_FROM=roprly@bilvanaturals.online
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=roprly@bilvanaturals.online
SMTP_PASSWORD=Who@reddamma999
SMTP_FROM_EMAIL=roprly@bilvanaturals.online
SMTP_USE_TLS=true
```

**Razorpay (IMPORTANT: Use LIVE keys):**
```
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_LIVE_KEY_SECRET
```

**Cloudinary:**
```
CLOUDINARY_CLOUD_NAME=dihv0v8hr
CLOUDINARY_API_KEY=418925754778477
CLOUDINARY_API_SECRET=LDeO-I6PgsrABW82WzYtDp1yIp8
```

**Application URLs (Update after deployment):**
```
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://affiliate-learning-backend.onrender.com
API_BASE_URL=https://affiliate-learning-backend.onrender.com
```

**Other Settings:**
```
ENVIRONMENT=production
PAYOUT_DAY=MONDAY
MINIMUM_PAYOUT_AMOUNT=500.0
USE_RAZORPAY_MOCK=false
IMAGEGEN_PROVIDER=auto
STORAGE_PROVIDER=cloudinary
FEATURE_FLAGS={"premium_tiers":true,"ab_test_pricing":true,"community_feed":true}
```

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Note your backend URL: `https://affiliate-learning-backend.onrender.com`

### 2.5 Verify Backend Deployment

```bash
# Test health endpoint
curl https://affiliate-learning-backend.onrender.com/health

# Test API docs
# Visit: https://affiliate-learning-backend.onrender.com/docs
```

---

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Import Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select the repository: `affilate-learn`

### 3.2 Configure Project

**Framework Preset:** Next.js  
**Root Directory:** `frontend`  
**Build Command:** `npm run build`  
**Output Directory:** `.next`  
**Install Command:** `npm install`

### 3.3 Set Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```
NEXT_PUBLIC_API_URL=https://affiliate-learning-backend.onrender.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Note:** Update `NEXT_PUBLIC_APP_URL` after deployment with your actual Vercel URL.

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (3-5 minutes)
3. Note your frontend URL: `https://your-app.vercel.app`

### 3.5 Update Backend CORS

After getting your Vercel URL, update the backend environment variables on Render:

```
FRONTEND_URL=https://your-app.vercel.app
```

Then redeploy the backend service.

---

## 🔄 Step 4: Update Cross-References

### 4.1 Update Backend URLs

In Render dashboard, update these environment variables:

```
FRONTEND_URL=https://your-actual-vercel-url.vercel.app
BACKEND_URL=https://affiliate-learning-backend.onrender.com
API_BASE_URL=https://affiliate-learning-backend.onrender.com
```

### 4.2 Update Frontend URLs

In Vercel dashboard, update these environment variables:

```
NEXT_PUBLIC_API_URL=https://affiliate-learning-backend.onrender.com
NEXT_PUBLIC_APP_URL=https://your-actual-vercel-url.vercel.app
```

### 4.3 Redeploy Both Services

1. Redeploy backend on Render (automatic if auto-deploy is enabled)
2. Redeploy frontend on Vercel (automatic on environment variable change)

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Backend

```bash
# Health check
curl https://affiliate-learning-backend.onrender.com/health

# API documentation
# Visit: https://affiliate-learning-backend.onrender.com/docs
```

### 5.2 Test Frontend

1. Visit your Vercel URL
2. Test user registration
3. Test email verification
4. Test course browsing
5. Test payment flow (with test payment)
6. Test admin panel

### 5.3 Test Email Delivery

1. Register a new user with a real email
2. Check if verification email is received
3. Click verification link
4. Verify email is marked as verified

### 5.4 Test Payment Flow

1. Purchase a package or course
2. Verify Razorpay payment page loads
3. Complete test payment
4. Verify purchase is recorded
5. Verify commission is credited
6. Verify invoice is generated

---

## 🔒 Step 6: Security Checklist

- [ ] Changed `SECRET_KEY` to a strong random value
- [ ] Changed `KEY_ENCRYPTION_SECRET` to a strong random value
- [ ] Using Razorpay LIVE keys (not test keys)
- [ ] SMTP credentials are secure
- [ ] Database auth token is secure
- [ ] CORS is configured correctly
- [ ] HTTPS is enabled (automatic on Vercel/Render)
- [ ] Environment variables are not committed to Git
- [ ] Admin password is strong and secure

---

## 📊 Step 7: Monitoring & Logging

### 7.1 Set Up Sentry (Optional)

1. Create account at https://sentry.io
2. Create new project
3. Get DSN
4. Add to Render environment variables:
   ```
   SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   ```

### 7.2 Monitor Logs

**Render Logs:**
- Go to Render dashboard → Your service → Logs
- Monitor for errors and warnings

**Vercel Logs:**
- Go to Vercel dashboard → Your project → Deployments → View Function Logs

---

## 🚨 Troubleshooting

### Backend Issues

**Issue: Database connection failed**
```
Solution: Verify TURSO_AUTH_TOKEN is correct and database URL is accessible
```

**Issue: CORS errors**
```
Solution: Ensure FRONTEND_URL matches your Vercel URL exactly
```

**Issue: Email not sending**
```
Solution: Check SMTP credentials and port (465 for SSL)
```

### Frontend Issues

**Issue: API calls failing**
```
Solution: Verify NEXT_PUBLIC_API_URL is correct and backend is running
```

**Issue: Razorpay not loading**
```
Solution: Verify NEXT_PUBLIC_RAZORPAY_KEY_ID is correct (use LIVE key)
```

---

## 📝 Post-Deployment Tasks

1. **Test all features thoroughly**
2. **Set up monitoring and alerts**
3. **Configure custom domain (optional)**
4. **Set up SSL certificate (automatic on Vercel/Render)**
5. **Create backup strategy for database**
6. **Document any issues and solutions**
7. **Train admin users on the platform**

---

## 🎯 Next Steps

After successful deployment:

1. **Monitor Performance**
   - Check response times
   - Monitor error rates
   - Track user activity

2. **Optimize**
   - Enable caching where appropriate
   - Optimize database queries
   - Compress images

3. **Scale**
   - Upgrade Render plan if needed
   - Consider CDN for static assets
   - Plan for AWS/Kubernetes migration (Strategy 2)

---

## 📞 Support

If you encounter issues:
1. Check logs on Render and Vercel
2. Verify all environment variables
3. Test endpoints individually
4. Review this guide step-by-step

---

**Deployment Status:** Ready to Deploy ✅  
**Estimated Time:** 30-45 minutes  
**Difficulty:** Intermediate

