# Deployment Guide - Affiliate Learning Platform

Complete guide for deploying the application to production.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Deployment (Railway/Render)](#backend-deployment)
3. [Frontend Deployment (Vercel)](#frontend-deployment)
4. [Database Setup (PostgreSQL)](#database-setup)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Checklist](#post-deployment-checklist)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Architecture Overview

```
┌─────────────────┐
│   Vercel        │
│   (Frontend)    │
│   Next.js 15    │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│   Railway       │
│   (Backend)     │
│   FastAPI       │
└────────┬────────┘
         │
         │
┌────────▼────────┐
│   PostgreSQL    │
│   (Database)    │
└─────────────────┘
```

---

## Backend Deployment

### Option 1: Railway (Recommended)

**Why Railway?**
- Easy deployment from GitHub
- Built-in PostgreSQL database
- Automatic HTTPS
- Environment variable management
- Free tier available

**Steps:**

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select `backend` folder as root

3. **Add PostgreSQL Database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically create and link the database

4. **Configure Environment Variables**
   - Go to project settings → Variables
   - Add all variables from `.env.example` (see below)
   - Railway automatically provides `DATABASE_URL`

5. **Deploy**
   - Railway will automatically deploy on push to main branch
   - Get your deployment URL: `https://your-app.railway.app`

### Option 2: Render

**Steps:**

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select `backend` folder

3. **Configure Service**
   - Name: `affiliate-backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Add PostgreSQL Database**
   - Create new PostgreSQL database
   - Copy connection string

5. **Set Environment Variables**
   - Add all variables from `.env.example`
   - Use the PostgreSQL connection string

---

## Frontend Deployment

### Vercel (Recommended)

**Why Vercel?**
- Built for Next.js
- Automatic deployments
- Edge network (fast globally)
- Preview deployments for PRs
- Free tier for hobby projects

**Steps:**

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select `frontend` folder as root directory

3. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Set Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Get your URL: `https://your-app.vercel.app`

6. **Custom Domain (Optional)**
   - Go to project settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

---

## Database Setup

### PostgreSQL Migration

**From SQLite to PostgreSQL:**

1. **Update Database URL**
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

2. **Install PostgreSQL Driver**
   ```bash
   pip install psycopg2-binary
   ```

3. **Run Migrations**
   ```bash
   # Backend will auto-create tables on startup
   # Or run manual migration:
   python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"
   ```

4. **Seed Initial Data**
   ```bash
   python app/scripts/seed_studio_data.py
   ```

---

## Environment Variables

> **🚨 CRITICAL SECURITY WARNING**
>
> **NEVER commit real secrets to version control!**
>
> The values below are **placeholders only**. Real secrets must be:
> - Stored in `.env` files (ensure `.env` is in `.gitignore`)
> - Set as environment variables in your CI/CD platform (Railway, Render, Vercel, etc.)
> - Managed via secrets managers (AWS Secrets Manager, GitHub Secrets, HashiCorp Vault)
>
> **If you accidentally commit secrets:**
> 1. **Immediately revoke/rotate** them in the provider's console
> 2. Remove from git history using `git filter-repo` or BFG Repo-Cleaner
> 3. Generate new keys and store them securely
> 4. Never reuse compromised credentials

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>

# Security (Generate with: openssl rand -hex 32)
SECRET_KEY=<GENERATE_NEW_SECRET_KEY_MIN_32_CHARS>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://www.yourdomain.com

# Email (SendGrid)
SENDGRID_API_KEY=<YOUR_SENDGRID_API_KEY>
FROM_EMAIL=noreply@yourdomain.com

# Payment (Razorpay)
RAZORPAY_KEY_ID=<YOUR_RAZORPAY_KEY_ID>
RAZORPAY_KEY_SECRET=<YOUR_RAZORPAY_KEY_SECRET>

# AI Image Generation
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
HUGGINGFACE_API_KEY=<YOUR_HUGGINGFACE_TOKEN>
GEMINI_API_KEY=<YOUR_GOOGLE_API_KEY>

# Image Generation Settings
IMAGEGEN_PROVIDER=auto
IMAGEGEN_MODEL_ID=dall-e-3
IMAGEGEN_API_BASE=https://api.openai.com/v1

# Sentry (Optional - for error tracking)
SENTRY_DSN=<YOUR_SENTRY_DSN>

# Environment
ENVIRONMENT=production
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## Post-Deployment Checklist

### Backend

- [ ] Health check endpoint working: `GET /health`
- [ ] API documentation accessible: `GET /docs`
- [ ] Database connection successful
- [ ] Static files serving correctly
- [ ] CORS configured for frontend domain
- [ ] Rate limiting active
- [ ] Error tracking (Sentry) configured
- [ ] SSL/HTTPS enabled
- [ ] Environment variables set correctly

### Frontend

- [ ] Application loads successfully
- [ ] API calls working
- [ ] Authentication flow working
- [ ] Image uploads working
- [ ] Payment integration working
- [ ] All pages accessible
- [ ] Mobile responsive
- [ ] SEO meta tags configured
- [ ] Analytics configured (if applicable)

### Database

- [ ] Migrations applied
- [ ] Initial data seeded
- [ ] Backups configured
- [ ] Connection pooling configured
- [ ] Indexes created for performance

---

## Monitoring & Maintenance

### Health Monitoring

**Backend Health Check:**
```bash
curl https://your-backend.railway.app/health
```

**Expected Response:**
```json
{"status": "healthy"}
```

### Error Tracking

**Sentry Integration:**
1. Create Sentry account
2. Create new project
3. Get DSN
4. Add to backend environment variables
5. Errors will be automatically tracked

### Performance Monitoring

**Key Metrics to Monitor:**
- Response time (< 200ms for most endpoints)
- Error rate (< 1%)
- Database query time
- Memory usage
- CPU usage

### Backup Strategy

**Database Backups:**
- Railway: Automatic daily backups
- Render: Configure backup schedule
- Manual backup: `pg_dump` command

**Recommended Schedule:**
- Daily automated backups
- Weekly manual verification
- Monthly backup testing

### Scaling

**When to Scale:**
- Response time > 500ms consistently
- CPU usage > 80%
- Memory usage > 80%
- Error rate > 5%

**How to Scale:**
- Railway: Upgrade plan, increase resources
- Render: Upgrade instance type
- Add caching layer (Redis)
- Optimize database queries
- Add CDN for static assets

---

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Check `ALLOWED_ORIGINS` in backend
- Ensure frontend URL is included
- Check for trailing slashes

**2. Database Connection Errors**
- Verify `DATABASE_URL` format
- Check database is running
- Verify network access

**3. Image Upload Failures**
- Check static files directory exists
- Verify file permissions
- Check storage limits

**4. Payment Integration Issues**
- Verify Razorpay keys
- Check webhook configuration
- Test in sandbox mode first

---

## Support

For issues or questions:
- GitHub Issues: [Your Repo URL]
- Email: support@yourdomain.com
- Documentation: [Your Docs URL]

---

**Last Updated:** 2025-10-20
**Version:** 1.0.0

