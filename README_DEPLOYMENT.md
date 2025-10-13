# 🚀 PRODUCTION DEPLOYMENT - SIMPLE GUIDE

## CURRENT SITUATION

### What's Working ✅
- ✅ Frontend running on http://localhost:3000
- ✅ Backend running on http://localhost:8000
- ✅ All code is ready for production

### What's NOT Working ❌
- ❌ Old Neon database is SUSPENDED (free tier limitation)
- ❌ Using SQLite locally (NOT suitable for production)
- ❌ Not deployed to production yet

### What We Need to Do 🎯
1. Create a NEW Neon PostgreSQL database
2. Configure backend to use the new database
3. Deploy backend to Render
4. Deploy frontend to Vercel
5. Connect everything together

---

## OPTION 1: AUTOMATED DEPLOYMENT (RECOMMENDED)

### Run the Deployment Script

```powershell
.\deploy.ps1
```

This script will:
1. Ask you for a NEW Neon database connection string
2. Generate a secure SECRET_KEY
3. Ask for Razorpay LIVE keys (optional)
4. Update backend configuration
5. Test database connection
6. Create all database tables
7. Commit and push changes to GitHub
8. Give you instructions for Render and Vercel deployment

### What You Need Before Running:
1. **NEW Neon Database**:
   - Go to https://neon.tech
   - Create account (free)
   - Create new project
   - Copy connection string (looks like: `postgresql://username:password@ep-xxx.neon.tech/neondb`)

2. **Razorpay LIVE Keys** (optional, can use test keys for now):
   - Go to https://dashboard.razorpay.com
   - Get your LIVE API keys
   - Or keep using test keys for testing

---

## OPTION 2: MANUAL DEPLOYMENT

### Step 1: Create NEW Neon Database

1. Go to https://neon.tech
2. Sign up (free)
3. Click "Create Project"
4. Name: `affiliate-learning-platform`
5. Region: Choose closest to you
6. Click "Create"
7. **COPY THE CONNECTION STRING** - it looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Update Backend Configuration

Edit `backend/.env`:

```env
# Replace this line:
DATABASE_URL=sqlite:///./app.db

# With your NEW Neon connection string:
DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require

# Generate new SECRET_KEY (run: openssl rand -hex 32)
SECRET_KEY=<YOUR_NEW_SECRET_KEY>

# For production, use LIVE Razorpay keys:
RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET

# Keep other settings as is
```

### Step 3: Test Database Connection

```powershell
cd backend
.\venv\Scripts\activate
python -c "import psycopg2; conn = psycopg2.connect('YOUR_NEON_CONNECTION_STRING'); print('Success!'); conn.close()"
```

If successful, you'll see "Success!"

### Step 4: Create Database Tables

```powershell
python -c "from app.core.database import engine, Base; from app.models import *; Base.metadata.create_all(bind=engine)"
```

### Step 5: Commit and Push

```powershell
cd ..
git add backend/.env
git commit -m "feat: configure production database"
git push origin main
```

### Step 6: Deploy Backend to Render

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect repository: `naveenpro-tech/affilate-learn`
5. Configure:
   - **Name**: `affiliate-learning-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables (copy from `backend/.env`)
7. Click "Create Web Service"
8. Wait 5-10 minutes for deployment
9. Copy your backend URL: `https://affiliate-learning-backend.onrender.com`

### Step 7: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import: `naveenpro-tech/affilate-learn`
5. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js
6. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://affiliate-learning-backend.onrender.com
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
   ```
7. Click "Deploy"
8. Wait 3-5 minutes
9. Copy your frontend URL: `https://your-app.vercel.app`

### Step 8: Update URLs

Go back to Render dashboard:
1. Update environment variables:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   BACKEND_URL=https://affiliate-learning-backend.onrender.com
   ```
2. Click "Manual Deploy" → "Deploy latest commit"

### Step 9: Test Production

1. Visit your Vercel URL
2. Register a new account
3. Login
4. Test all features

---

## TROUBLESHOOTING

### "Database connection failed"
**Solution**: 
- Make sure you created a NEW Neon database
- Check the connection string is correct
- Make sure database is not suspended (check Neon dashboard)

### "Frontend not loading"
**Solution**:
- Check Vercel deployment logs
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Make sure backend is deployed and running

### "CORS error"
**Solution**:
- Update `backend/app/main.py` CORS settings
- Add your Vercel URL to allowed origins
- Redeploy backend

### "Payment not working"
**Solution**:
- Switch to LIVE Razorpay keys (not test keys)
- Update both backend and frontend environment variables
- Redeploy both services

---

## IMPORTANT NOTES

### About SQLite vs PostgreSQL
- ❌ **SQLite**: Good for local development, NOT for production
- ✅ **PostgreSQL (Neon)**: Required for production deployment
- The old Neon database is suspended, you MUST create a new one

### About Free Tiers
- **Neon**: Free tier includes 0.5 GB storage, 3 GB data transfer
- **Render**: Free tier includes 750 hours/month (enough for 1 service)
- **Vercel**: Free tier includes unlimited deployments

### About Costs
- **Free Option**: Use all free tiers = $0/month
- **Paid Option**: Upgrade for better performance = ~$20-30/month

### About Razorpay
- **Test Keys**: Use for testing (no real money)
- **Live Keys**: Use for production (real payments)
- Switch to live keys before accepting real payments!

---

## QUICK START (TL;DR)

```powershell
# 1. Create NEW Neon database at https://neon.tech
# 2. Run deployment script
.\deploy.ps1

# 3. Follow the prompts
# 4. Deploy to Render (backend)
# 5. Deploy to Vercel (frontend)
# 6. Done!
```

---

## NEED HELP?

### Documentation
- See `PRODUCTION_DEPLOYMENT_PLAN.md` for detailed guide
- See `DEPLOYMENT_COMPLETE_SUMMARY.md` for previous work

### Support
- Neon: https://neon.tech/docs
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs

---

## CHECKLIST

Before deployment:
- [ ] Created NEW Neon database
- [ ] Copied connection string
- [ ] Updated `backend/.env`
- [ ] Generated new SECRET_KEY
- [ ] Tested database connection
- [ ] Created database tables
- [ ] Committed and pushed to GitHub

During deployment:
- [ ] Deployed backend to Render
- [ ] Added all environment variables
- [ ] Deployed frontend to Vercel
- [ ] Updated FRONTEND_URL and BACKEND_URL
- [ ] Redeployed backend

After deployment:
- [ ] Tested registration
- [ ] Tested login
- [ ] Tested all features
- [ ] Switched to live Razorpay keys (when ready)

---

**Ready to deploy? Run `.\deploy.ps1` and follow the prompts!**

