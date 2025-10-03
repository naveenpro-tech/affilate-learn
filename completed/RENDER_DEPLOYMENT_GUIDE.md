# 🚀 Render Deployment Guide - Complete Setup

## Overview

This guide will walk you through deploying both the **backend (FastAPI)** and **frontend (Next.js)** to Render.

**Current Status:**
- ✅ PostgreSQL database created on Render
- ✅ All code pushed to GitHub
- ⏳ Backend deployment pending
- ⏳ Frontend deployment pending

---

## Prerequisites

1. ✅ Render account created
2. ✅ GitHub repository connected to Render
3. ⏳ Payment method added to Render (required for web services)
4. ✅ PostgreSQL database created: `dpg-d3eclk0gjchc738ifa2g-a`

---

## Part 1: Backend Deployment (FastAPI)

### Step 1: Create Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `naveenpro-tech/affilate-learn`
4. Configure the service:

**Basic Settings:**
- **Name:** `affiliate-learning-backend`
- **Region:** Singapore
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** Python 3
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Instance Type:**
- **Plan:** Starter ($7/month) or Free (with limitations)

### Step 2: Environment Variables

Add the following environment variables in Render dashboard:

```env
# Database (from your Render PostgreSQL)
DATABASE_URL=postgresql://affiliate_learning_db_user:password@dpg-d3eclk0gjchc738ifa2g-a/affiliate_learning_db

# JWT
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Email (use your SMTP provider)
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Application
APP_NAME=Affiliate Learning Platform
FRONTEND_URL=https://your-frontend-url.onrender.com
BACKEND_URL=https://your-backend-url.onrender.com

# Payout
PAYOUT_DAY=MONDAY
MINIMUM_PAYOUT_AMOUNT=500.0

# Sentry (optional but recommended)
SENTRY_DSN=your-sentry-dsn-here
ENVIRONMENT=production
```

### Step 3: Get Database Connection String

1. Go to your PostgreSQL database in Render dashboard
2. Copy the **Internal Database URL**
3. It should look like: `postgresql://user:password@host/database`
4. Add it as `DATABASE_URL` environment variable

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Start the server
3. Wait for deployment to complete (~5 minutes)
4. Note your backend URL: `https://affiliate-learning-backend.onrender.com`

### Step 5: Run Database Migrations

After deployment, you need to run migrations:

1. Go to your backend service in Render
2. Click **"Shell"** tab
3. Run these commands:

```bash
# Create tables
python create_tables.py

# Seed packages
python seed_packages.py

# Seed courses
python seed_courses.py

# Create admin user
python create_admin.py

# Add database indexes
python add_indexes.py
```

### Step 6: Test Backend

Test your backend API:

```bash
# Health check
curl https://your-backend-url.onrender.com/health

# Get packages
curl https://your-backend-url.onrender.com/api/packages/

# Login (should return 401 without credentials)
curl https://your-backend-url.onrender.com/api/auth/me
```

---

## Part 2: Frontend Deployment (Next.js)

### Step 1: Create Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `naveenpro-tech/affilate-learn`
4. Configure the service:

**Basic Settings:**
- **Name:** `affiliate-learning-frontend`
- **Region:** Singapore
- **Branch:** `main`
- **Root Directory:** `frontend`
- **Runtime:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

**Instance Type:**
- **Plan:** Starter ($7/month) or Free (with limitations)

### Step 2: Environment Variables

Add the following environment variables:

```env
# Backend API URL (use your actual backend URL)
NEXT_PUBLIC_API_URL=https://affiliate-learning-backend.onrender.com

# Node environment
NODE_ENV=production
```

### Step 3: Deploy Frontend

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build Next.js app
   - Start the server
3. Wait for deployment to complete (~5-10 minutes)
4. Note your frontend URL: `https://affiliate-learning-frontend.onrender.com`

### Step 4: Update Backend CORS

After getting your frontend URL, update the backend environment variable:

1. Go to your backend service in Render
2. Update `FRONTEND_URL` to your actual frontend URL
3. Redeploy the backend

### Step 5: Test Frontend

1. Open your frontend URL in a browser
2. Test the following:
   - ✅ Homepage loads
   - ✅ Login page works
   - ✅ Registration page works
   - ✅ Can connect to backend API
   - ✅ Can view packages
   - ✅ Can make test payment

---

## Part 3: Post-Deployment Configuration

### 1. Update Razorpay Webhook

1. Go to Razorpay Dashboard
2. Settings → Webhooks
3. Add webhook URL: `https://your-backend-url.onrender.com/api/payments/webhook`
4. Select events: `payment.captured`, `payment.failed`

### 2. Set Up Custom Domain (Optional)

**For Backend:**
1. Go to backend service → Settings → Custom Domain
2. Add your domain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed

**For Frontend:**
1. Go to frontend service → Settings → Custom Domain
2. Add your domain (e.g., `www.yourdomain.com`)
3. Update DNS records as instructed

### 3. Enable Auto-Deploy

Both services should have auto-deploy enabled by default. This means:
- Every push to `main` branch triggers automatic deployment
- No manual intervention needed

### 4. Set Up Monitoring

**Render Dashboard:**
- Monitor CPU/Memory usage
- Check logs for errors
- Set up alerts

**Sentry:**
- Follow `SENTRY_SETUP.md` guide
- Add Sentry DSN to backend environment variables
- Monitor errors in Sentry dashboard

---

## Part 4: Troubleshooting

### Backend Issues

**Issue: Database connection failed**
- Check `DATABASE_URL` is correct
- Ensure database is in same region as backend
- Check database is running

**Issue: Module not found**
- Check `requirements.txt` is up to date
- Rebuild the service

**Issue: Port binding error**
- Ensure start command uses `$PORT` variable
- Correct: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend Issues

**Issue: API calls failing**
- Check `NEXT_PUBLIC_API_URL` is correct
- Ensure backend CORS allows frontend URL
- Check backend is running

**Issue: Build failed**
- Check `package.json` is correct
- Ensure all dependencies are listed
- Check for TypeScript errors

**Issue: Page not found (404)**
- Check Next.js routing is correct
- Ensure all pages are in `app/` directory
- Check build output for errors

---

## Part 5: Cost Estimation

### Free Tier (Limited)
- **PostgreSQL:** Free (1GB storage, 1GB RAM)
- **Backend:** Free (750 hours/month, sleeps after 15 min inactivity)
- **Frontend:** Free (750 hours/month, sleeps after 15 min inactivity)
- **Total:** $0/month

**Limitations:**
- Services sleep after inactivity (slow first request)
- Limited resources
- No custom domains

### Starter Plan (Recommended)
- **PostgreSQL:** $7/month (10GB storage, 1GB RAM)
- **Backend:** $7/month (always on, 512MB RAM)
- **Frontend:** $7/month (always on, 512MB RAM)
- **Total:** $21/month

**Benefits:**
- Always on (no cold starts)
- Better performance
- Custom domains included
- More resources

---

## Part 6: Deployment Checklist

### Pre-Deployment
- ✅ All code pushed to GitHub
- ✅ Environment variables documented
- ✅ Database created on Render
- ✅ Payment method added to Render

### Backend Deployment
- ⏳ Web service created
- ⏳ Environment variables configured
- ⏳ Database URL added
- ⏳ Service deployed successfully
- ⏳ Database migrations run
- ⏳ Admin user created
- ⏳ API tested

### Frontend Deployment
- ⏳ Web service created
- ⏳ Environment variables configured
- ⏳ Backend URL added
- ⏳ Service deployed successfully
- ⏳ Frontend tested
- ⏳ Can connect to backend

### Post-Deployment
- ⏳ Razorpay webhook updated
- ⏳ Sentry configured
- ⏳ Custom domains added (optional)
- ⏳ Monitoring set up
- ⏳ Auto-deploy enabled

---

## Part 7: Next Steps

After successful deployment:

1. **Test Everything:**
   - User registration
   - Login/logout
   - Package purchase
   - Payment flow
   - Referral system
   - Admin panel

2. **Monitor Performance:**
   - Check Render dashboard daily
   - Monitor Sentry for errors
   - Review logs regularly

3. **Optimize:**
   - Add caching if needed
   - Optimize database queries
   - Compress images

4. **Scale:**
   - Upgrade plans as needed
   - Add more instances
   - Use CDN for static assets

---

## Support

- **Render Docs:** https://render.com/docs
- **Render Support:** https://render.com/support
- **Community:** https://community.render.com

---

**Status:** ✅ Guide complete - ready for deployment  
**Last Updated:** 2025-10-01

