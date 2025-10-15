# 🔧 Vercel Environment Variables Setup

## ❌ Problem: Login Not Working on Vercel

**Reason**: Environment variables from `.env.local` are **NOT** automatically deployed to Vercel. They must be configured in the Vercel Dashboard.

---

## ✅ Solution: Add Environment Variables to Vercel

### Required Environment Variables

Your application needs these environment variables to work:

1. **NEXT_PUBLIC_API_URL** = `https://affilate-learn.onrender.com`
2. **NEXT_PUBLIC_RAZORPAY_KEY_ID** = `rzp_test_RBrPafmy42Nmd7`

---

## 📝 Step-by-Step Guide

### Method 1: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/naveenvide-9992s-projects/frontend

2. **Navigate to Settings**
   - Click on your project: **frontend**
   - Click on **Settings** tab

3. **Add Environment Variables**
   - Click on **Environment Variables** in the left sidebar
   - Add each variable:

   **Variable 1:**
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://affilate-learn.onrender.com`
   - Environment: Select **Production**, **Preview**, and **Development**
   - Click **Save**

   **Variable 2:**
   - Key: `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - Value: `rzp_test_RBrPafmy42Nmd7`
   - Environment: Select **Production**, **Preview**, and **Development**
   - Click **Save**

4. **Redeploy**
   - Go to **Deployments** tab
   - Click on the latest deployment
   - Click **Redeploy** button
   - OR: Just push a new commit to trigger automatic deployment

---

### Method 2: Using Vercel CLI (Alternative)

Run these commands from your `frontend` directory:

```bash
# Set API URL
vercel env add NEXT_PUBLIC_API_URL production
# When prompted, enter: https://affilate-learn.onrender.com

# Set Razorpay Key
vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID production
# When prompted, enter: rzp_test_RBrPafmy42Nmd7

# Redeploy
vercel --prod
```

---

## 🔍 How to Verify

### 1. Check Environment Variables in Vercel
- Go to: https://vercel.com/naveenvide-9992s-projects/frontend/settings/environment-variables
- You should see both variables listed

### 2. Test the Deployment
After redeploying:
1. Visit: https://frontend-k01kudwt0-naveenvide-9992s-projects.vercel.app
2. Open browser console (F12)
3. Type: `console.log(process.env.NEXT_PUBLIC_API_URL)`
4. You should see: `https://affilate-learn.onrender.com`

### 3. Test Login
1. Go to login page
2. Enter credentials:
   - Email: `naveenvide@gmail.com`
   - Password: `admin123`
3. Click Login
4. Should redirect to dashboard

---

## 🐛 Debugging Tips

### If Login Still Fails:

1. **Check Browser Console**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for errors

2. **Check Network Tab**
   - Open DevTools (F12)
   - Go to Network tab
   - Try to login
   - Look for the `/api/auth/login` request
   - Check the request URL - it should be: `https://affilate-learn.onrender.com/api/auth/login`
   - Check the response

3. **Common Issues:**

   **Issue**: Request goes to `http://localhost:8000`
   - **Solution**: Environment variable not set correctly in Vercel

   **Issue**: CORS error
   - **Solution**: Backend needs to allow your Vercel domain
   - Check backend CORS settings

   **Issue**: 401 Unauthorized
   - **Solution**: Check credentials or backend authentication

   **Issue**: Network error / Cannot connect
   - **Solution**: Backend might be down or sleeping (Render free tier)
   - Visit backend URL to wake it up: https://affilate-learn.onrender.com

---

## 📋 Current Configuration

### Local (.env.local)
```env
NEXT_PUBLIC_API_URL=https://affilate-learn.onrender.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RBrPafmy42Nmd7
```

### Vercel (Need to Add)
```
NEXT_PUBLIC_API_URL=https://affilate-learn.onrender.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RBrPafmy42Nmd7
```

---

## 🔐 Security Notes

### Environment Variable Naming

- **NEXT_PUBLIC_*** variables are exposed to the browser
- They are safe for API URLs and public keys
- **NEVER** put secret keys in `NEXT_PUBLIC_*` variables
- Backend secrets should stay in backend `.env` file

### Current Variables:
- ✅ `NEXT_PUBLIC_API_URL` - Safe (public API endpoint)
- ✅ `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Safe (public test key)
- ❌ `RAZORPAY_KEY_SECRET` - Should NEVER be in frontend

---

## 🚀 Quick Fix Commands

### Option A: Use Vercel Dashboard (Easiest)
1. Go to: https://vercel.com/naveenvide-9992s-projects/frontend/settings/environment-variables
2. Add the two variables
3. Redeploy

### Option B: Use CLI
```bash
cd frontend

# Add environment variables
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://affilate-learn.onrender.com
# Select: Production, Preview, Development

vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID
# Enter: rzp_test_RBrPafmy42Nmd7
# Select: Production, Preview, Development

# Redeploy
vercel --prod
```

---

## ✅ Checklist

After adding environment variables:

- [ ] Environment variables added in Vercel Dashboard
- [ ] Both variables set for Production, Preview, and Development
- [ ] Redeployed the application
- [ ] Verified variables in browser console
- [ ] Tested login functionality
- [ ] Login redirects to dashboard
- [ ] Backend API is responding

---

## 📞 Need Help?

If login still doesn't work after adding environment variables:

1. **Check Backend Status**
   - Visit: https://affilate-learn.onrender.com
   - Should show: `{"message":"Affiliate Learning Platform API"}`

2. **Check Backend Logs**
   - Go to Render dashboard
   - Check logs for errors

3. **Check Frontend Logs**
   - Go to Vercel dashboard
   - Click on deployment
   - Check runtime logs

---

## 🎯 Expected Behavior After Fix

1. ✅ Login page loads
2. ✅ Enter credentials
3. ✅ API request goes to: `https://affilate-learn.onrender.com/api/auth/login`
4. ✅ Receives token
5. ✅ Redirects to dashboard
6. ✅ Dashboard loads user data

---

**Next Step**: Add the environment variables in Vercel Dashboard and redeploy! 🚀

