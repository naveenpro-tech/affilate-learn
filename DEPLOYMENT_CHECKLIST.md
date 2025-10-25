# ✅ Deployment Checklist

**Quick reference checklist for deploying Affiliate Learning Platform**

---

## 📋 Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All code committed to Git
- [ ] Code pushed to GitHub
- [ ] No sensitive data in code (passwords, keys, tokens)
- [ ] `.env` files are in `.gitignore`
- [ ] All dependencies listed in `requirements.txt` and `package.json`

### 2. Credentials Ready
- [ ] Turso database URL and auth token
- [ ] Razorpay LIVE keys (not test keys)
- [ ] Hostinger SMTP credentials
- [ ] Cloudinary credentials
- [ ] Strong SECRET_KEY generated (`openssl rand -hex 32`)
- [ ] Strong KEY_ENCRYPTION_SECRET generated

### 3. Accounts Created
- [ ] Vercel account created and logged in
- [ ] Render account created and logged in
- [ ] GitHub repository is accessible

---

## 🗄️ Database Setup (Turso)

### Step 1: Verify Turso Database
- [ ] Database URL: `libsql://affilate-learn-naveenvide.aws-ap-south-1.turso.io`
- [ ] Auth token available
- [ ] Database is accessible

### Step 2: Initialize Database Schema
```bash
# Option 1: Using init script (after backend deployment)
python backend/init_turso_database.py

# Option 2: Using Turso CLI
turso db shell affilate-learn-naveenvide < schema.sql
```

- [ ] Database schema initialized
- [ ] Admin user created
- [ ] Default packages created

---

## 🖥️ Backend Deployment (Render)

### Step 1: Create Web Service
- [ ] Logged into Render dashboard
- [ ] Clicked "New +" → "Web Service"
- [ ] Connected GitHub repository
- [ ] Selected `affilate-learn` repository

### Step 2: Configure Service
- [ ] Name: `affiliate-learning-backend`
- [ ] Region: `Singapore` (or closest)
- [ ] Branch: `main`
- [ ] Root Directory: `backend`
- [ ] Runtime: `Python 3`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Health Check Path: `/health`
- [ ] Auto-Deploy: `Yes`

### Step 3: Set Environment Variables

**Database:**
- [ ] `DATABASE_URL=libsql://affilate-learn-naveenvide.aws-ap-south-1.turso.io`
- [ ] `TURSO_DATABASE_URL=libsql://affilate-learn-naveenvide.aws-ap-south-1.turso.io`
- [ ] `TURSO_AUTH_TOKEN=<your-token>`

**JWT:**
- [ ] `SECRET_KEY=<generated-secret>`
- [ ] `ALGORITHM=HS256`
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES=10080`

**Email:**
- [ ] `EMAIL_FROM=roprly@bilvanaturals.online`
- [ ] `SMTP_HOST=smtp.hostinger.com`
- [ ] `SMTP_PORT=465`
- [ ] `SMTP_USER=roprly@bilvanaturals.online`
- [ ] `SMTP_PASSWORD=Who@reddamma999`
- [ ] `SMTP_FROM_EMAIL=roprly@bilvanaturals.online`
- [ ] `SMTP_USE_TLS=true`

**Razorpay (LIVE keys):**
- [ ] `RAZORPAY_KEY_ID=rzp_live_<your-key>`
- [ ] `RAZORPAY_KEY_SECRET=<your-secret>`

**Cloudinary:**
- [ ] `CLOUDINARY_CLOUD_NAME=dihv0v8hr`
- [ ] `CLOUDINARY_API_KEY=418925754778477`
- [ ] `CLOUDINARY_API_SECRET=<your-secret>`

**Application URLs:**
- [ ] `FRONTEND_URL=https://your-app.vercel.app` (update after frontend deployment)
- [ ] `BACKEND_URL=https://affiliate-learning-backend.onrender.com`
- [ ] `API_BASE_URL=https://affiliate-learning-backend.onrender.com`

**Other:**
- [ ] `ENVIRONMENT=production`
- [ ] `PAYOUT_DAY=MONDAY`
- [ ] `MINIMUM_PAYOUT_AMOUNT=500.0`
- [ ] `USE_RAZORPAY_MOCK=false`
- [ ] `STORAGE_PROVIDER=cloudinary`
- [ ] `IMAGEGEN_PROVIDER=auto`
- [ ] `FEATURE_FLAGS={"premium_tiers":true,"ab_test_pricing":true,"community_feed":true}`
- [ ] `KEY_ENCRYPTION_SECRET=<generated-secret>`

### Step 4: Deploy
- [ ] Clicked "Create Web Service"
- [ ] Deployment completed successfully
- [ ] Backend URL noted: `https://affiliate-learning-backend.onrender.com`

### Step 5: Verify Backend
- [ ] Health check works: `curl https://affiliate-learning-backend.onrender.com/health`
- [ ] API docs accessible: `https://affiliate-learning-backend.onrender.com/docs`
- [ ] No errors in logs

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Import Project
- [ ] Logged into Vercel dashboard
- [ ] Clicked "Add New..." → "Project"
- [ ] Imported GitHub repository
- [ ] Selected `affilate-learn` repository

### Step 2: Configure Project
- [ ] Framework Preset: `Next.js`
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`

### Step 3: Set Environment Variables
- [ ] `NEXT_PUBLIC_API_URL=https://affiliate-learning-backend.onrender.com`
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_<your-key>`
- [ ] `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app` (update after deployment)

### Step 4: Deploy
- [ ] Clicked "Deploy"
- [ ] Deployment completed successfully
- [ ] Frontend URL noted: `https://your-app.vercel.app`

### Step 5: Update Environment Variables
- [ ] Updated `NEXT_PUBLIC_APP_URL` with actual Vercel URL
- [ ] Redeployed frontend

---

## 🔄 Cross-Reference Updates

### Update Backend URLs
- [ ] Updated `FRONTEND_URL` in Render with actual Vercel URL
- [ ] Redeployed backend service

### Update Frontend URLs
- [ ] Updated `NEXT_PUBLIC_APP_URL` with actual Vercel URL
- [ ] Verified all URLs are correct

---

## ✅ Post-Deployment Verification

### Backend Tests
- [ ] Health check: `https://affiliate-learning-backend.onrender.com/health`
- [ ] API docs: `https://affiliate-learning-backend.onrender.com/docs`
- [ ] Root endpoint: `https://affiliate-learning-backend.onrender.com/`
- [ ] No errors in Render logs

### Frontend Tests
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] Email verification email received
- [ ] Login works
- [ ] Course browsing works
- [ ] Payment flow works (test payment)
- [ ] Admin panel accessible
- [ ] No console errors

### Email Tests
- [ ] Registration email received
- [ ] Verification link works
- [ ] Welcome email received
- [ ] Purchase confirmation email works

### Payment Tests
- [ ] Razorpay payment page loads
- [ ] Test payment completes
- [ ] Purchase recorded in database
- [ ] Commission credited
- [ ] Invoice generated

---

## 🔒 Security Verification

- [ ] `SECRET_KEY` is strong and unique
- [ ] `KEY_ENCRYPTION_SECRET` is strong and unique
- [ ] Using Razorpay LIVE keys (not test)
- [ ] SMTP credentials are secure
- [ ] Database auth token is secure
- [ ] CORS configured correctly
- [ ] HTTPS enabled (automatic)
- [ ] No sensitive data in Git
- [ ] Admin password changed from default

---

## 📊 Monitoring Setup

### Render Monitoring
- [ ] Logs accessible in Render dashboard
- [ ] Health checks passing
- [ ] No error alerts

### Vercel Monitoring
- [ ] Deployment logs accessible
- [ ] Function logs working
- [ ] No build errors

### Optional: Sentry
- [ ] Sentry account created
- [ ] Project created
- [ ] DSN added to environment variables
- [ ] Error tracking working

---

## 🚨 Troubleshooting Completed

### Common Issues Resolved
- [ ] Database connection working
- [ ] CORS errors resolved
- [ ] Email sending working
- [ ] Payment gateway working
- [ ] API calls successful

---

## 📝 Documentation

- [ ] Deployment guide reviewed
- [ ] Environment variables documented
- [ ] Admin credentials saved securely
- [ ] Backup strategy planned
- [ ] Team trained on platform

---

## 🎯 Final Checks

- [ ] All features tested end-to-end
- [ ] Performance acceptable
- [ ] No critical errors
- [ ] Monitoring in place
- [ ] Backup strategy ready
- [ ] Support plan ready

---

## ✅ Deployment Complete!

**Backend URL:** `https://affiliate-learning-backend.onrender.com`  
**Frontend URL:** `https://your-app.vercel.app`  
**Database:** Turso (LibSQL)  
**Status:** ✅ LIVE

---

## 📞 Next Steps

1. **Monitor for 24 hours**
   - Check logs regularly
   - Monitor error rates
   - Track user activity

2. **Optimize Performance**
   - Review slow queries
   - Optimize images
   - Enable caching

3. **Plan Scaling**
   - Monitor resource usage
   - Plan for growth
   - Consider AWS migration (Strategy 2)

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Verified By:** _____________

