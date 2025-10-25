# ⚡ Quick Start Deployment Guide

**Deploy your Affiliate Learning Platform in 30 minutes!**

---

## 🎯 Overview

This guide will help you deploy:
- **Frontend** → Vercel (Free tier available)
- **Backend** → Render (Free tier available)
- **Database** → Turso (Already provisioned)

**Total Time:** 30-45 minutes  
**Cost:** $0-7/month (free tiers) or $27-54/month (production tiers)

---

## 📋 Before You Start

### 1. Generate Secrets

```bash
# Generate secure secrets for production
python generate_secrets.py
```

**Save the output!** You'll need:
- `SECRET_KEY` - For JWT tokens
- `KEY_ENCRYPTION_SECRET` - For encrypting sensitive data

### 2. Get Razorpay LIVE Keys

⚠️ **IMPORTANT:** Use LIVE keys for production, not test keys!

1. Go to https://dashboard.razorpay.com/app/keys
2. Switch to "Live Mode"
3. Copy your Key ID and Key Secret

### 3. Verify Credentials

Make sure you have:
- ✅ Turso database URL and auth token
- ✅ Razorpay LIVE keys
- ✅ Hostinger SMTP credentials
- ✅ Cloudinary credentials
- ✅ Generated secrets from step 1

---

## 🖥️ Part 1: Deploy Backend (Render)

### Step 1: Create Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your repository: `affilate-learn`
3. Click **"Connect"**

### Step 3: Configure Service

**Basic Settings:**
```
Name: affiliate-learning-backend
Region: Singapore (or closest to you)
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Advanced Settings:**
```
Health Check Path: /health
Auto-Deploy: Yes
```

### Step 4: Set Environment Variables

Click **"Environment"** tab and add these variables:

**Database (Turso):**
```
DATABASE_URL=libsql://affilate-learn-naveenvide.aws-ap-south-1.turso.io
TURSO_DATABASE_URL=libsql://affilate-learn-naveenvide.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjEzODE4NzgsImlkIjoiMWQ2ZDc5M2MtOWNmZS00MWViLWJkNmQtOWQwNzNkMWRlYzYzIiwicmlkIjoiZmMwZGQ2MzMtYzFkYS00MDdkLWE0ZTEtOTkxYmM4ZjhmZmYyIn0.gnij8ofAd_UxntFQw-y_txa0VXg0auh9MEKHcbSjKQZ5fdlUUT-fskUDH_UU6Qo1V4T3OoYlpKhEZHhokYY2Cg
```

**JWT (Use secrets from generate_secrets.py):**
```
SECRET_KEY=<your-generated-secret-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

**Email (Hostinger):**
```
EMAIL_FROM=roprly@bilvanaturals.online
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=roprly@bilvanaturals.online
SMTP_PASSWORD=Who@reddamma999
SMTP_FROM_EMAIL=roprly@bilvanaturals.online
SMTP_USE_TLS=true
```

**Razorpay (LIVE keys):**
```
RAZORPAY_KEY_ID=<your-live-key-id>
RAZORPAY_KEY_SECRET=<your-live-key-secret>
```

**Cloudinary:**
```
CLOUDINARY_CLOUD_NAME=dihv0v8hr
CLOUDINARY_API_KEY=418925754778477
CLOUDINARY_API_SECRET=LDeO-I6PgsrABW82WzYtDp1yIp8
```

**Application URLs (temporary - will update later):**
```
FRONTEND_URL=https://localhost:3000
BACKEND_URL=https://affiliate-learning-backend.onrender.com
API_BASE_URL=https://affiliate-learning-backend.onrender.com
```

**Other Settings:**
```
ENVIRONMENT=production
PAYOUT_DAY=MONDAY
MINIMUM_PAYOUT_AMOUNT=500.0
USE_RAZORPAY_MOCK=false
STORAGE_PROVIDER=cloudinary
IMAGEGEN_PROVIDER=auto
FEATURE_FLAGS={"premium_tiers":true,"ab_test_pricing":true,"community_feed":true}
KEY_ENCRYPTION_SECRET=<your-generated-encryption-secret>
```

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Note your backend URL (e.g., `https://affiliate-learning-backend-xyz.onrender.com`)

### Step 6: Verify Backend

```bash
# Test health endpoint
curl https://your-backend-url.onrender.com/health

# Should return: {"status":"healthy","environment":"production","database":"connected"}
```

✅ **Backend deployed!** Note your URL for the next step.

---

## 🌐 Part 2: Deploy Frontend (Vercel)

### Step 1: Create Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Find and select `affilate-learn`
3. Click **"Import"**

### Step 3: Configure Project

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `frontend`

**Build Settings:**
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Step 4: Set Environment Variables

Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=<your-live-razorpay-key>
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Note:** For `NEXT_PUBLIC_APP_URL`, use a placeholder first. You'll update it after deployment.

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 3-5 minutes for deployment
3. Note your frontend URL (e.g., `https://your-app-xyz.vercel.app`)

### Step 6: Update Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
3. Click **"Save"**
4. Redeploy (Deployments → Latest → Redeploy)

✅ **Frontend deployed!** Note your URL for the next step.

---

## 🔄 Part 3: Update Cross-References

### Step 1: Update Backend URLs

Go back to Render dashboard:

1. Go to your backend service
2. Click **"Environment"**
3. Update `FRONTEND_URL` with your Vercel URL
4. Click **"Save Changes"**
5. Service will auto-redeploy

### Step 2: Verify CORS

After backend redeploys, test that frontend can call backend:

1. Visit your Vercel URL
2. Open browser console (F12)
3. Try to register a user
4. Should work without CORS errors

---

## 🗄️ Part 4: Initialize Database

### Option 1: Using Python Script (Recommended)

```bash
# Install dependencies locally
cd backend
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=libsql://affilate-learn-naveenvide.aws-ap-south-1.turso.io
export TURSO_DATABASE_URL=libsql://affilate-learn-naveenvide.aws-ap-south-1.turso.io
export TURSO_AUTH_TOKEN=<your-token>

# Run initialization script
python init_turso_database.py
```

### Option 2: Using Turso CLI

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Connect to database
turso db shell affilate-learn-naveenvide

# Create tables manually (or import schema)
```

✅ **Database initialized!**

---

## ✅ Part 5: Test Everything

### 1. Test Backend

```bash
# Health check
curl https://your-backend-url.onrender.com/health

# API docs
# Visit: https://your-backend-url.onrender.com/docs
```

### 2. Test Frontend

Visit your Vercel URL and test:

- [ ] Homepage loads
- [ ] User registration works
- [ ] Email verification email received
- [ ] Login works
- [ ] Browse courses
- [ ] Purchase flow (test payment)
- [ ] Admin panel accessible

### 3. Test Email

1. Register with a real email
2. Check inbox for verification email
3. Click verification link
4. Verify email is marked as verified

### 4. Test Payment

1. Try to purchase a package
2. Razorpay payment page should load
3. Complete test payment
4. Verify purchase is recorded
5. Check commission is credited

---

## 🎉 You're Live!

**Frontend:** `https://your-app.vercel.app`  
**Backend:** `https://your-backend.onrender.com`  
**Database:** Turso (LibSQL)

---

## 🚨 Troubleshooting

### Backend not deploying?
- Check Render logs for errors
- Verify all environment variables are set
- Ensure `requirements.txt` is correct

### Frontend not loading?
- Check Vercel deployment logs
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check browser console for errors

### CORS errors?
- Verify `FRONTEND_URL` in backend matches Vercel URL exactly
- Redeploy backend after updating

### Database connection failed?
- Verify `TURSO_AUTH_TOKEN` is correct
- Check database URL is accessible
- Run `init_turso_database.py` to initialize schema

### Email not sending?
- Verify SMTP credentials
- Check port is 465 (SSL)
- Check backend logs for email errors

---

## 📊 Monitoring

### Render
- **Logs:** Dashboard → Service → Logs
- **Metrics:** Dashboard → Service → Metrics

### Vercel
- **Logs:** Dashboard → Project → Deployments → View Function Logs
- **Analytics:** Dashboard → Project → Analytics

---

## 🔒 Security Checklist

- [ ] Changed `SECRET_KEY` to generated value
- [ ] Changed `KEY_ENCRYPTION_SECRET` to generated value
- [ ] Using Razorpay LIVE keys
- [ ] SMTP credentials are secure
- [ ] Database auth token is secure
- [ ] Admin password changed from default

---

## 📝 Next Steps

1. **Change Admin Password**
   - Login as admin (naveenvide@gmail.com / admin123)
   - Change password immediately

2. **Create Content**
   - Add courses
   - Upload videos
   - Create packages

3. **Test Thoroughly**
   - Test all features
   - Test payment flow
   - Test email notifications

4. **Monitor**
   - Check logs regularly
   - Monitor error rates
   - Track user activity

---

## 💰 Cost Summary

### Free Tier (Testing)
- Render: $0/month (with limitations)
- Vercel: $0/month (hobby plan)
- Turso: $0/month (free tier)
- **Total: $0/month**

### Production Tier
- Render: $7-25/month
- Vercel: $20/month
- Turso: $0-29/month
- **Total: $27-74/month**

---

## 📞 Need Help?

1. Check **DEPLOYMENT_GUIDE.md** for detailed instructions
2. Check **DEPLOYMENT_CHECKLIST.md** for step-by-step checklist
3. Review logs on Render and Vercel
4. Check browser console for frontend errors

---

**Deployment Time:** 30-45 minutes  
**Difficulty:** Intermediate  
**Status:** ✅ Ready to Deploy

Good luck! 🚀

