# 📁 Project Structure - Affiliate Learning Platform

Complete overview of the project organization and file structure.

---

## 🏗️ High-Level Architecture

```
affilate-learn/
├── backend/              # FastAPI backend server
├── frontend/             # Next.js frontend application
├── DEPLOYMENT_GUIDE.md   # Deployment instructions
├── PROJECT_STRUCTURE.md  # This file
└── README.md             # Project overview
```

---

## 🖥️ Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application entry point
│   ├── database.py                # Database connection and session
│   ├── dependencies.py            # Dependency injection
│   │
│   ├── api/                       # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py                # Authentication endpoints
│   │   ├── users.py               # User management
│   │   ├── packages.py            # Package management
│   │   ├── payments.py            # Payment processing
│   │   ├── commissions.py         # Commission tracking
│   │   ├── referrals.py           # Referral system
│   │   ├── payouts.py             # Payout management
│   │   ├── wallet.py              # Wallet operations
│   │   ├── courses.py             # Course management
│   │   ├── certificates.py        # Certificate generation
│   │   ├── notifications.py       # Notification system
│   │   ├── email_verification.py  # Email verification
│   │   └── studio.py              # AI image generation
│   │
│   ├── models/                    # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py                # User model
│   │   ├── package.py             # Package model
│   │   ├── payment.py             # Payment model
│   │   ├── commission.py          # Commission model
│   │   ├── referral.py            # Referral model
│   │   ├── payout.py              # Payout model
│   │   ├── wallet.py              # Wallet model
│   │   ├── wallet_transaction.py  # Wallet transaction model
│   │   ├── user_package.py        # User package purchase
│   │   ├── bank_details.py        # Bank details model
│   │   ├── invoice.py             # Invoice model
│   │   ├── course.py              # Course model
│   │   ├── module.py              # Module model
│   │   ├── topic.py               # Topic model
│   │   ├── video.py               # Video model
│   │   ├── video_progress.py      # Video progress tracking
│   │   ├── certificate.py         # Certificate model
│   │   ├── user_course_purchase.py # Course purchase model
│   │   └── notification.py        # Notification model
│   │
│   ├── schemas/                   # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py                # User schemas
│   │   ├── package.py             # Package schemas
│   │   ├── payment.py             # Payment schemas
│   │   ├── commission.py          # Commission schemas
│   │   ├── referral.py            # Referral schemas
│   │   ├── payout.py              # Payout schemas
│   │   ├── wallet.py              # Wallet schemas
│   │   ├── course.py              # Course schemas
│   │   ├── certificate.py         # Certificate schemas
│   │   └── notification.py        # Notification schemas
│   │
│   ├── services/                  # Business logic
│   │   ├── __init__.py
│   │   ├── razorpay_service.py    # Razorpay integration
│   │   ├── commission_service.py  # Commission calculations
│   │   ├── payout_service.py      # Payout processing
│   │   ├── wallet_service.py      # Wallet operations
│   │   ├── certificate_service.py # Certificate generation
│   │   ├── imagegen_service.py    # AI image generation
│   │   └── storage_service.py     # Cloud storage
│   │
│   ├── utils/                     # Utility functions
│   │   ├── __init__.py
│   │   ├── auth.py                # JWT authentication
│   │   ├── email.py               # Email sending
│   │   ├── security.py            # Password hashing
│   │   └── validators.py          # Input validation
│   │
│   └── static/                    # Static files
│       ├── certificates/          # Generated certificates
│       └── uploads/               # User uploads
│
├── .env                           # Environment variables (not in git)
├── .gitignore                     # Git ignore rules
├── requirements.txt               # Python dependencies
├── turso_schema.sql               # Database schema
├── init_turso_simple.py           # Database initialization
├── seed_admin_packages.py         # Seed admin and packages
├── render.yaml                    # Render deployment config
├── SCHEMA_MIGRATION_REPORT.md     # Database migration docs
└── README.md                      # Backend documentation
```

---

## 🌐 Frontend Structure

```
frontend/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   ├── globals.css                # Global styles
│   │
│   ├── login/                     # Login page
│   │   └── page.tsx
│   ├── register/                  # Registration page
│   │   └── page.tsx
│   ├── forgot-password/           # Password reset
│   │   └── page.tsx
│   ├── reset-password/            # Password reset form
│   │   └── page.tsx
│   ├── verify-email/              # Email verification
│   │   └── page.tsx
│   │
│   ├── dashboard/                 # User dashboard
│   │   └── page.tsx
│   ├── profile/                   # User profile
│   │   └── page.tsx
│   ├── packages/                  # Package selection
│   │   └── page.tsx
│   ├── payments/                  # Payment processing
│   │   └── page.tsx
│   ├── purchases/                 # Purchase history
│   │   └── page.tsx
│   │
│   ├── referrals/                 # Referral management
│   │   └── page.tsx
│   ├── earnings/                  # Earnings dashboard
│   │   └── page.tsx
│   ├── payouts/                   # Payout requests
│   │   └── page.tsx
│   ├── wallet/                    # Wallet management
│   │   └── page.tsx
│   │
│   ├── courses/                   # Course catalog
│   │   ├── page.tsx
│   │   └── [id]/                  # Course details
│   │       └── page.tsx
│   ├── certificates/              # Certificates
│   │   └── page.tsx
│   │
│   ├── studio/                    # AI image generation
│   │   └── page.tsx
│   │
│   ├── admin/                     # Admin panel
│   │   ├── page.tsx
│   │   ├── users/
│   │   ├── packages/
│   │   ├── payments/
│   │   ├── commissions/
│   │   ├── payouts/
│   │   └── courses/
│   │
│   ├── notifications/             # Notifications
│   │   └── page.tsx
│   ├── leaderboard/               # Leaderboard
│   │   └── page.tsx
│   │
│   ├── terms/                     # Terms of service
│   │   └── page.tsx
│   └── privacy/                   # Privacy policy
│       └── page.tsx
│
├── components/                    # React components
│   ├── ui/                        # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   │
│   ├── charts/                    # Chart components
│   │   ├── BarChart.tsx
│   │   ├── LineChart.tsx
│   │   └── PieChart.tsx
│   │
│   ├── mobile/                    # Mobile-specific components
│   │   ├── MobileNav.tsx
│   │   └── MobileSidebar.tsx
│   │
│   ├── studio/                    # Studio components
│   │   ├── ImageGenerator.tsx
│   │   └── PromptEnhancer.tsx
│   │
│   ├── AuthProvider.tsx           # Authentication context
│   ├── DashboardLayout.tsx        # Dashboard layout
│   ├── ModernDashboardLayout.tsx  # Modern dashboard layout
│   ├── EnhancedModernNavbar.tsx   # Navigation bar
│   ├── ModernSidebar.tsx          # Sidebar navigation
│   ├── ModernFooter.tsx           # Footer
│   ├── EmailVerificationBanner.tsx # Email verification banner
│   ├── NotificationBell.tsx       # Notification bell
│   ├── OnboardingTour.tsx         # Onboarding tour (disabled)
│   ├── ProfessionalCertificate.tsx # Certificate component
│   ├── ProtectedRoute.tsx         # Route protection
│   ├── VideoPlayer.tsx            # Video player
│   ├── ErrorBoundary.tsx          # Error boundary
│   ├── GlassCard.tsx              # Glass morphism card
│   ├── GradientBackground.tsx     # Gradient background
│   └── ToasterProvider.tsx        # Toast notifications
│
├── lib/                           # Utility libraries
│   ├── api.ts                     # API client
│   ├── razorpay.ts                # Razorpay integration
│   ├── sanitize.ts                # Input sanitization
│   ├── theme.ts                   # Theme configuration
│   └── utils.ts                   # Utility functions
│
├── store/                         # State management
│   └── authStore.ts               # Authentication store (Zustand)
│
├── styles/                        # Styles
│   └── design-system.md           # Design system documentation
│
├── utils/                         # Utility functions
│   └── clipboard.ts               # Clipboard operations
│
├── public/                        # Public assets
│   ├── images/
│   ├── icons/
│   └── ...
│
├── .env.local                     # Environment variables (not in git)
├── .gitignore                     # Git ignore rules
├── .npmrc                         # NPM configuration
├── package.json                   # Dependencies
├── package-lock.json              # Dependency lock file
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── components.json                # shadcn/ui configuration
├── vercel.json                    # Vercel deployment config
└── README.md                      # Frontend documentation
```

---

## 📦 Key Files Explained

### Backend

| File | Purpose |
|------|---------|
| `app/main.py` | FastAPI application entry point, CORS, middleware |
| `app/database.py` | Database connection, session management |
| `turso_schema.sql` | **Authoritative database schema** |
| `init_turso_simple.py` | Initialize Turso database from schema file |
| `seed_admin_packages.py` | Seed admin user and default packages |
| `requirements.txt` | Python dependencies |
| `render.yaml` | Render deployment configuration |
| `.env` | Environment variables (not in git) |

### Frontend

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with providers |
| `app/page.tsx` | Landing page |
| `lib/api.ts` | Axios API client with interceptors |
| `store/authStore.ts` | Authentication state management |
| `components/ui/` | shadcn/ui component library |
| `package.json` | Dependencies (react-joyride removed) |
| `vercel.json` | Vercel deployment configuration |
| `.npmrc` | NPM configuration (legacy-peer-deps) |
| `.env.local` | Environment variables (not in git) |

---

## 🔧 Configuration Files

### Backend Configuration

**requirements.txt** - Python dependencies
- Fixed: `libsql-experimental==0.0.55` (was 0.10.1)

**render.yaml** - Render deployment
- Python 3.10
- Auto-deploy enabled
- Environment variables configured

**.env** - Environment variables
- Database credentials
- API keys
- SMTP configuration

### Frontend Configuration

**package.json** - Dependencies
- Fixed: Removed `react-joyride` (React 19 incompatible)

**vercel.json** - Vercel deployment
- Install command: `npm install --legacy-peer-deps`
- Security headers configured

**.npmrc** - NPM configuration
- `legacy-peer-deps=true` for React 19 compatibility

**.env.local** - Environment variables
- API URL
- Razorpay key

---

## 🗄️ Database Schema

The database schema is defined in `backend/turso_schema.sql` and includes:

**19 Tables:**
1. users
2. packages
3. payments
4. user_packages
5. referrals
6. payouts
7. commissions
8. bank_details
9. wallets
10. wallet_transactions
11. invoices
12. courses
13. modules
14. topics
15. videos
16. video_progress
17. certificates
18. user_course_purchases
19. notifications

**41 Indexes** for performance optimization

See `SCHEMA_MIGRATION_REPORT.md` for detailed schema documentation.

---

## 🚀 Deployment Files

### Production Ready
- ✅ `backend/requirements.txt` - Fixed libsql version
- ✅ `backend/render.yaml` - Render configuration
- ✅ `backend/.gitignore` - Ignore sensitive files
- ✅ `frontend/package.json` - Removed incompatible dependencies
- ✅ `frontend/vercel.json` - Vercel configuration with legacy-peer-deps
- ✅ `frontend/.npmrc` - NPM configuration
- ✅ `frontend/.gitignore` - Ignore build artifacts
- ✅ `DEPLOYMENT_GUIDE.md` - Complete deployment instructions

---

## 📝 Documentation Files

| File | Description |
|------|-------------|
| `README.md` | Project overview and quick start |
| `DEPLOYMENT_GUIDE.md` | Complete deployment instructions |
| `PROJECT_STRUCTURE.md` | This file - project organization |
| `SCHEMA_MIGRATION_REPORT.md` | Database schema migration details |
| `backend/README.md` | Backend-specific documentation |
| `frontend/README.md` | Frontend-specific documentation |
| `frontend/UI_COMPONENTS_README.md` | UI component library |
| `frontend/UI_UX_ENHANCEMENTS.md` | UI/UX improvements |
| `frontend/INTEGRATION_EXAMPLE.md` | Integration examples |

---

## 🎯 Clean Code Practices

### Organized Structure
- ✅ Clear separation of concerns
- ✅ Modular architecture
- ✅ Consistent naming conventions
- ✅ Proper file organization

### Version Control
- ✅ Comprehensive .gitignore files
- ✅ No sensitive data in repository
- ✅ Clean commit history

### Deployment Ready
- ✅ All dependencies fixed
- ✅ Configuration files optimized
- ✅ Environment variables documented
- ✅ Deployment guides complete

---

## 🔄 Development Workflow

### Local Development
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python init_turso_simple.py
python seed_admin_packages.py
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install --legacy-peer-deps
npm run dev
```

### Deployment
```bash
# Commit changes
git add .
git commit -m "your message"
git push origin main

# Auto-deploys to:
# - Render (backend)
# - Vercel (frontend)
```

---

## 📊 Project Status

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** 2025-10-25

**Deployment Status:**
- Backend: Ready for Render
- Frontend: Ready for Vercel
- Database: Turso Cloud configured
- Dependencies: All fixed and tested

---

## 🎉 Summary

The project is now **fully organized** and **deployment-ready** with:

- ✅ Clean file structure
- ✅ Fixed all dependency issues
- ✅ Comprehensive documentation
- ✅ Deployment configurations
- ✅ Environment variable templates
- ✅ Database schema documented
- ✅ .gitignore files configured

Ready to deploy! 🚀

