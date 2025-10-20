# Sentry Error Tracking Setup Guide

## Overview
Sentry has been integrated into the backend for production error tracking and monitoring. This guide explains how to complete the setup.

## What's Already Done ✅

1. **Sentry SDK Installed** - `sentry-sdk[fastapi]==1.40.0`
2. **Configuration Added** - `SENTRY_DSN` and `ENVIRONMENT` settings in `config.py`
3. **Initialization Code** - Sentry initialized in `main.py` with FastAPI integration
4. **Test Endpoint** - `/sentry-test` endpoint to verify Sentry is working

## Setup Steps

### 1. Create Sentry Account (Free)

1. Go to https://sentry.io/signup/
2. Sign up with your email or GitHub account
3. Choose the **Free** plan (includes 5,000 errors/month)

### 2. Create a New Project

1. After signing in, click **"Create Project"**
2. Select **Python** as the platform
3. Select **FastAPI** as the framework
4. Give your project a name (e.g., "affiliate-learning-platform")
5. Click **"Create Project"**

### 3. Get Your DSN

After creating the project, Sentry will show you a **DSN** (Data Source Name). It looks like:

```
https://abc123def456@o123456.ingest.sentry.io/7890123
```

**Copy this DSN** - you'll need it in the next step.

### 4. Add DSN to Environment Variables

Add the following to your `backend/.env` file:

```env
# Sentry Error Tracking
SENTRY_DSN=https://your-actual-dsn-here@o123456.ingest.sentry.io/7890123
ENVIRONMENT=development
```

**Important:**
- Replace the DSN with your actual DSN from Sentry
- Use `ENVIRONMENT=development` for local development
- Use `ENVIRONMENT=production` when deploying to production

### 5. Restart Backend Server

After adding the DSN to `.env`, restart your backend server:

```powershell
# Kill existing server
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force

# Start backend
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Test Sentry Integration

#### Option 1: Use the Test Endpoint

```powershell
# This will trigger a division by zero error
curl http://localhost:8000/sentry-test
```

#### Option 2: Use Python

```python
import requests
response = requests.get('http://localhost:8000/sentry-test')
print(f"Status: {response.status_code}")
```

You should see:
- A 500 Internal Server Error response
- The error appears in your Sentry dashboard within seconds

### 7. Verify in Sentry Dashboard

1. Go to your Sentry project dashboard
2. Click on **"Issues"** in the left sidebar
3. You should see the error: **"ZeroDivisionError: division by zero"**
4. Click on the error to see:
   - Full stack trace
   - Request details (URL, method, headers)
   - Environment information
   - Timestamp

## What Sentry Tracks

Sentry automatically captures:

1. **Unhandled Exceptions** - Any error that crashes your API
2. **HTTP Request Context** - URL, method, headers, body
3. **User Context** - User ID, email (if authenticated)
4. **Environment** - Python version, OS, dependencies
5. **Stack Traces** - Full traceback with code context
6. **Performance** - Request duration, database queries

## Configuration Details

### Sample Rates

In `main.py`, we've configured:

```python
traces_sample_rate=1.0 if settings.ENVIRONMENT == "development" else 0.1
profiles_sample_rate=1.0 if settings.ENVIRONMENT == "development" else 0.1
```

**What this means:**
- **Development:** 100% of errors and traces are sent to Sentry
- **Production:** 10% of traces are sampled (to stay within free tier limits)
- **All errors** are always captured regardless of environment

### Integrations

We've enabled:
- **FastApiIntegration** - Captures FastAPI-specific context
- **StarletteIntegration** - Captures ASGI middleware context

## Production Deployment

When deploying to production:

1. **Update Environment Variable:**
   ```env
   ENVIRONMENT=production
   ```

2. **Set DSN in Production:**
   - Add `SENTRY_DSN` to your production environment variables
   - On Render: Settings → Environment → Add `SENTRY_DSN`

3. **Monitor Dashboard:**
   - Check Sentry dashboard regularly
   - Set up email/Slack alerts for critical errors
   - Review error trends weekly

## Sentry Dashboard Features

### Issues Tab
- See all errors grouped by type
- View frequency and affected users
- Mark issues as resolved
- Assign issues to team members

### Performance Tab
- Monitor API endpoint performance
- Identify slow database queries
- Track response times

### Releases Tab
- Track errors by deployment version
- Compare error rates between releases
- See which release introduced new errors

## Best Practices

1. **Don't Log Sensitive Data:**
   - Sentry automatically scrubs passwords
   - Be careful with custom logging

2. **Use Breadcrumbs:**
   ```python
   from sentry_sdk import add_breadcrumb
   
   add_breadcrumb(
       category='auth',
       message='User logged in',
       level='info',
   )
   ```

3. **Set User Context:**
   ```python
   from sentry_sdk import set_user
   
   set_user({"id": user.id, "email": user.email})
   ```

4. **Tag Errors:**
   ```python
   from sentry_sdk import set_tag
   
   set_tag("payment_method", "razorpay")
   ```

## Troubleshooting

### Sentry Not Capturing Errors

1. **Check DSN is set:**
   ```python
   from app.core.config import settings
   print(settings.SENTRY_DSN)
   ```

2. **Check Sentry is initialized:**
   - Look for "Sentry initialized" in server logs
   - Or check if `sentry_sdk.Hub.current` is not None

3. **Test with the test endpoint:**
   ```bash
   curl http://localhost:8000/sentry-test
   ```

### Errors Not Showing in Dashboard

1. **Wait a few seconds** - Sentry has a small delay
2. **Check project settings** - Ensure you're looking at the right project
3. **Check filters** - Remove any filters in the Issues tab

## Cost Management

**Free Tier Limits:**
- 5,000 errors per month
- 10,000 performance units per month
- 1 project
- 30 days of data retention

**Tips to Stay Within Limits:**
- Use 10% sampling in production (`traces_sample_rate=0.1`)
- Filter out noisy errors (e.g., 404s)
- Use error grouping to reduce duplicate reports

## Next Steps

After setting up Sentry:

1. ✅ Add DSN to `.env`
2. ✅ Restart backend server
3. ✅ Test with `/sentry-test` endpoint
4. ✅ Verify error appears in Sentry dashboard
5. ✅ Set up email alerts in Sentry settings
6. ✅ Remove or disable `/sentry-test` endpoint before production

## Support

- **Sentry Docs:** https://docs.sentry.io/platforms/python/guides/fastapi/
- **Sentry Support:** https://sentry.io/support/
- **Community:** https://discord.gg/sentry

---

**Status:** ✅ Sentry integration complete - just needs DSN configuration

