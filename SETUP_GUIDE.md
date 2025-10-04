# Affiliate Learning Platform - Setup Guide

## 🎯 Application Overview

This is a **2-Level MLM (Multi-Level Marketing) Affiliate Learning Platform** with the following architecture:

- **Backend**: FastAPI (Python) with PostgreSQL database
- **Frontend**: Next.js 15 with React 19, TypeScript, and Tailwind CSS
- **Status**: Backend 100% complete, Frontend 40% complete

### Key Features
- **Commission System**: 2-level MLM with 3x3x2 matrix
- **Package Tiers**: Silver (₹2,950), Gold (₹5,310), Platinum (₹8,850)
- **Payment Integration**: Razorpay (test mode)
- **Video Hosting**: Cloudinary
- **Email**: Hostinger SMTP
- **Authentication**: JWT tokens with bcrypt password hashing

## ✅ Setup Status

### ✅ Backend Setup (COMPLETE)
- ✅ Python 3.12.10 installed
- ✅ Virtual environment created and activated
- ✅ All dependencies installed
- ✅ Database tables created
- ✅ Package data seeded
- ✅ Server running on http://localhost:8000
- ✅ API documentation available at http://localhost:8000/docs

### ✅ Frontend Setup (COMPLETE)
- ✅ Node.js v22.17.1 and npm 10.9.2 installed
- ✅ All dependencies installed
- ✅ Development server running on http://localhost:3000
- ✅ Landing page, login, and registration pages working

## 🚀 How to Run the Application

### Prerequisites
- Python 3.12+ (✅ Installed: 3.12.10)
- Node.js 18+ (✅ Installed: 22.17.1)
- npm or yarn (✅ Installed: npm 10.9.2)

### Starting the Backend
```bash
cd backend
./venv/Scripts/activate  # On Windows
# source venv/bin/activate  # On macOS/Linux
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Alternative using PowerShell script:**
```powershell
.\start-backend.ps1
```

### Starting the Frontend
```bash
cd frontend
npm run dev
```

**Alternative using PowerShell script:**
```powershell
.\start-frontend.ps1
```

## 🔗 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000/health

## 📊 Database Configuration

The application uses **Neon PostgreSQL** (serverless) with the following configuration:
- Database URL is configured in `backend/.env`
- Tables are automatically created via `create_tables.py`
- Package data is seeded via `seed_packages.py`

### Database Scripts
```bash
cd backend
python create_tables.py    # Create all database tables
python seed_packages.py    # Seed package data (Silver, Gold, Platinum)
```

## 🔧 Environment Configuration

### Backend Environment (`backend/.env`)
All environment variables are properly configured including:
- Database connection (Neon PostgreSQL)
- JWT secret key
- Razorpay API keys (test mode)
- Cloudinary credentials
- SMTP settings (Hostinger)

### Frontend Environment (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
```

## 📦 Dependencies

### Backend Dependencies (Installed)
- fastapi==0.115.6
- sqlalchemy==2.0.36
- pydantic==2.10.5
- uvicorn
- python-jose
- passlib[bcrypt]
- python-multipart
- python-dotenv
- psycopg2-binary
- pydantic-settings
- slowapi
- alembic
- sentry-sdk
- email-validator
- requests
- razorpay
- cloudinary

### Frontend Dependencies (Installed)
- next@15.5.4
- react@19.0.0
- typescript
- tailwindcss
- zustand@5.0.8
- axios
- All dependencies are in `frontend/package.json`

## 🧪 Testing the Application

### Backend API Testing
1. Visit http://localhost:8000/docs for interactive API documentation
2. Test health endpoint: http://localhost:8000/health
3. Test packages endpoint: http://localhost:8000/api/packages/

### Frontend Testing
1. Visit http://localhost:3000 for the landing page
2. Test registration: http://localhost:3000/register
3. Test login: http://localhost:3000/login

## 🎯 Commission Structure

### Package Pricing
- **Silver**: ₹2,500 + ₹450 GST = ₹2,950
- **Gold**: ₹4,500 + ₹810 GST = ₹5,310
- **Platinum**: ₹7,500 + ₹1,350 GST = ₹8,850

### Commission Rates (2-Level MLM)
- **Level 1 (Direct Referral)**: 15% of base price
- **Level 2 (Indirect Referral)**: 10% of base price

### Maximum Earnings per Referral
- **Silver**: ₹375 (L1) + ₹250 (L2) = ₹625
- **Gold**: ₹675 (L1) + ₹450 (L2) = ₹1,125
- **Platinum**: ₹1,125 (L1) + ₹750 (L2) = ₹1,875

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting with slowapi
- Input validation with Pydantic
- CORS configuration
- Environment variable protection

## 📱 Payment Integration

- **Payment Gateway**: Razorpay (Test Mode)
- **Supported Methods**: UPI, Cards, Net Banking, Wallets
- **Webhook Support**: Automatic payment verification
- **Payout System**: Weekly payouts to bank accounts/UPI

## 🎥 Video Management

- **Storage**: Cloudinary
- **Features**: Upload, streaming, thumbnail generation
- **Access Control**: Package-based access restrictions

## 📧 Email System

- **Provider**: Hostinger SMTP
- **Features**: Welcome emails, payment confirmations, payout notifications
- **Templates**: HTML email templates with branding

## 🚨 Known Issues & Solutions

### Issue 1: Backend Dependencies
**Problem**: Missing Python dependencies causing import errors
**Solution**: All dependencies have been manually installed and verified

### Issue 2: Corrupted requirements.txt
**Problem**: Original requirements.txt had encoding issues
**Solution**: Dependencies installed manually via pip commands

### Issue 3: Virtual Environment
**Problem**: Original virtual environment was broken
**Solution**: Created new virtual environment with Python 3.12.10

## 🔄 Development Status

### Completed Features (100%)
- ✅ User authentication and registration
- ✅ Package management system
- ✅ Payment processing with Razorpay
- ✅ Commission calculation and tracking
- ✅ Referral system (2-level MLM)
- ✅ Payout management
- ✅ Admin dashboard and controls
- ✅ Video course management
- ✅ Bank details management
- ✅ API documentation

### Frontend Completion (40%)
- ✅ Landing page
- ✅ Authentication pages (login/register)
- ⚠️ Missing: Dashboard, package purchase flow, course viewer, admin panel

## 🛠️ Next Steps for Development

1. **Complete Frontend Dashboard**: User dashboard with stats and referrals
2. **Package Purchase Flow**: Integration with Razorpay payment gateway
3. **Course Viewer**: Video streaming interface with Cloudinary
4. **Admin Panel**: Complete admin interface for management
5. **Mobile Responsiveness**: Optimize for mobile devices
6. **Testing**: Add comprehensive test coverage

## 📞 Support

For technical issues or questions:
1. Check the API documentation at http://localhost:8000/docs
2. Review the console logs for error messages
3. Verify environment variables are properly configured
4. Ensure both frontend and backend servers are running

---

**Last Updated**: October 3, 2025
**Setup Verified**: ✅ Complete and Working
