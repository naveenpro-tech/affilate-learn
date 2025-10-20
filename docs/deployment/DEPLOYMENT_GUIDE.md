# 🚀 DEPLOYMENT GUIDE - Vercel + Render

**Last Updated**: 2025-01-15  
**Platform Status**: ✅ Production Ready  
**Deployment Targets**: Vercel (Frontend) + Render (Backend)

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Code Readiness
- [x] All features implemented and tested
- [x] Environment variables documented
- [x] Database schema finalized
- [x] API endpoints documented
- [x] Frontend pages complete
- [x] Error handling implemented
- [x] Security measures in place

### ⚠️ Security Review Required
- [ ] Remove hardcoded credentials from README.md
- [ ] Verify .env files are in .gitignore
- [ ] Generate new SECRET_KEY for production
- [ ] Switch Razorpay from test to live keys
- [ ] Review CORS origins for production URLs
- [ ] Enable HTTPS-only cookies
- [ ] Review rate limiting settings

---

## 🔐 ENVIRONMENT VARIABLES

### Backend Environment Variables (Render)

**Required for Render Web Service**:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_XVbg9LNkxBu1@ep-wandering-mud-adj0z6n6-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Configuration
SECRET_KEY=<GENERATE_NEW_SECRET_KEY_FOR_PRODUCTION>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Email Configuration (Hostinger SMTP)
EMAIL_FROM=roprly@bilvanaturals.online
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=roprly@bilvanaturals.online
SMTP_PASSWORD=<YOUR_SMTP_PASSWORD>

# Razorpay Configuration (SWITCH TO LIVE KEYS)
RAZORPAY_KEY_ID=<YOUR_LIVE_RAZORPAY_KEY_ID>
RAZORPAY_KEY_SECRET=<YOUR_LIVE_RAZORPAY_KEY_SECRET>

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dihv0v8hr
CLOUDINARY_API_KEY=418925754778477
CLOUDINARY_API_SECRET=<YOUR_CLOUDINARY_SECRET>

# Application Settings
APP_NAME=Affiliate Learning Platform
FRONTEND_URL=<YOUR_VERCEL_URL>  # e.g., https://your-app.vercel.app
BACKEND_URL=<YOUR_RENDER_URL>   # e.g., https://your-app.onrender.com

# Payout Settings
PAYOUT_DAY=MONDAY
MINIMUM_PAYOUT_AMOUNT=500

# Environment
ENVIRONMENT=production

# Sentry (Optional - for error tracking)
SENTRY_DSN=<YOUR_SENTRY_DSN>
```

**How to Generate SECRET_KEY**:
```bash
# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Using OpenSSL
openssl rand -hex 32
```

---

### Frontend Environment Variables (Vercel)

**Required for Vercel Deployment**:

```bash
NEXT_PUBLIC_API_URL=<YOUR_RENDER_BACKEND_URL>  # e.g., https://your-app.onrender.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=<YOUR_LIVE_RAZORPAY_KEY_ID>
```

---

## 🎯 DEPLOYMENT STEPS

### Phase 1: Backend Deployment (Render)

#### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up or log in
3. Connect your GitHub account

#### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `https://github.com/naveenpro-tech/affilate-learn.git`
3. Configure the service:
   - **Name**: `affiliate-learning-backend` (or your choice)
   - **Region**: Choose closest to your users (e.g., Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

#### Step 3: Set Environment Variables
1. In Render dashboard, go to "Environment" tab
2. Add all backend environment variables listed above
3. **Important**: Update `FRONTEND_URL` after deploying frontend

#### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete (5-10 minutes)
3. Note your backend URL: `https://your-app.onrender.com`

#### Step 5: Verify Backend
1. Visit `https://your-app.onrender.com/health`
   - Should return: `{"status": "healthy"}`
2. Visit `https://your-app.onrender.com/docs`
   - Should show Swagger UI with all API endpoints

---

### Phase 2: Frontend Deployment (Vercel)

#### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up or log in
3. Connect your GitHub account

#### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Import your GitHub repository: `https://github.com/naveenpro-tech/affilate-learn.git`
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

#### Step 3: Set Environment Variables
1. In Vercel project settings, go to "Environment Variables"
2. Add frontend environment variables:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Your live Razorpay key
3. Apply to: Production, Preview, Development

#### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment to complete (3-5 minutes)
3. Note your frontend URL: `https://your-app.vercel.app`

#### Step 5: Verify Frontend
1. Visit your Vercel URL
2. Test key pages:
   - Landing page: `/`
   - Login: `/login`
   - Register: `/register`
   - Packages: `/packages`

---

### Phase 3: Post-Deployment Configuration

#### Step 1: Update Backend FRONTEND_URL
1. Go to Render dashboard → Your backend service
2. Update `FRONTEND_URL` environment variable to your Vercel URL
3. Redeploy backend (or it will auto-redeploy)

#### Step 2: Update CORS Settings
1. Verify `backend/app/main.py` CORS configuration includes your production URLs
2. If needed, update and redeploy

#### Step 3: Database Initialization
**If this is a fresh database**:
1. SSH into Render or use local connection to production DB
2. Run migrations:
   ```bash
   alembic upgrade head
   ```
3. Seed initial data:
   ```bash
   python seed_packages.py
   ```

---

### Phase 4: End-to-End Testing

#### Test Checklist:
- [ ] User registration works
- [ ] Email verification works
- [ ] Login works
- [ ] Package purchase with Razorpay works
- [ ] Referral system works
- [ ] Commission calculation works
- [ ] Course access works
- [ ] Video player works (all sources)
- [ ] Payout request works
- [ ] Admin panel works
- [ ] Certificates work
- [ ] Notifications work
- [ ] Wallet works

---

## 🔧 TROUBLESHOOTING

### Backend Issues

**Issue**: Backend won't start
- Check Render logs for errors
- Verify all environment variables are set
- Verify DATABASE_URL is correct
- Check Python version (should be 3.11+)

**Issue**: Database connection fails
- Verify DATABASE_URL includes `?sslmode=require`
- Check Neon database is active
- Verify IP whitelist (Neon allows all by default)

**Issue**: CORS errors
- Verify FRONTEND_URL in backend env vars
- Check CORS configuration in `backend/app/main.py`
- Ensure frontend URL matches exactly (no trailing slash)

### Frontend Issues

**Issue**: API calls fail
- Verify NEXT_PUBLIC_API_URL is set correctly
- Check browser console for CORS errors
- Verify backend is running and accessible

**Issue**: Razorpay not loading
- Verify NEXT_PUBLIC_RAZORPAY_KEY_ID is set
- Check if using live key (not test key)
- Verify Razorpay account is active

---

## 📊 MONITORING & MAINTENANCE

### Recommended Tools:
1. **Sentry** - Error tracking (already integrated)
2. **Render Metrics** - Built-in monitoring
3. **Vercel Analytics** - Frontend performance
4. **Neon Metrics** - Database monitoring

### Regular Maintenance:
- Monitor error logs daily
- Review database performance weekly
- Update dependencies monthly
- Backup database weekly
- Review security settings monthly

---

## 🎉 DEPLOYMENT COMPLETE!

Your MLM Affiliate Learning Platform is now live!

**Next Steps**:
1. Test all features thoroughly
2. Set up monitoring and alerts
3. Create admin account
4. Seed initial courses
5. Invite beta users
6. Gather feedback
7. Iterate and improve

---

**Need Help?**
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- FastAPI Docs: https://fastapi.tiangolo.com
- Next.js Docs: https://nextjs.org/docs

