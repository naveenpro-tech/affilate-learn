# Affiliate Video Learning Platform - MVP

A complete 2-level MLM affiliate learning platform with video courses, commission tracking, and weekly payouts.

## 🎯 Project Status

### ✅ Completed (Backend - 100%)
1. **Backend Foundation** - FastAPI, SQLAlchemy, JWT auth, CORS
2. **Database Models** - 9 models (User, Package, UserPackage, Referral, Commission, Payout, Course, Video, Payment)
3. **Authentication System** - Registration with referral tracking, login, JWT tokens
4. **Package Management** - CRUD APIs for Silver/Gold/Platinum packages
5. **Razorpay Integration** - Order creation, payment verification, webhook handler
6. **Referral Tracking** - 2-level referral chain processing
7. **Commission Calculator** - Complete 3x3x2 matrix implementation
8. **Course & Video Management** - Cloudinary integration, package-based access control
9. **Payout System** - Weekly payout calculation, request/approval workflow
10. **Admin Panel APIs** - Dashboard, user management, statistics

### 🚧 In Progress (Frontend - 40%)
- ✅ Next.js 15 setup with TypeScript
- ✅ Tailwind CSS configuration
- ✅ API client with axios
- ✅ Auth store with Zustand
- ✅ Landing page
- ✅ Login/Register pages
- ⏳ Dashboard (needs implementation)
- ⏳ Package purchase flow (needs implementation)
- ⏳ Course viewer (needs implementation)
- ⏳ Admin panel (needs implementation)

## 📦 Tech Stack

**Backend:**
- FastAPI 0.115.6
- SQLAlchemy 2.0.36 (PostgreSQL ORM)
- Pydantic 2.10.5
- Python-Jose (JWT)
- Passlib (Password hashing)
- Razorpay 1.4.2
- Cloudinary 1.42.0
- Python-Multipart (File uploads)

**Frontend:**
- Next.js 15.5.4
- React 19
- TypeScript 5.7.3
- Tailwind CSS 4.1.13
- Axios 1.12.2
- Zustand 5.0.8 (State management)
- React-Hot-Toast 2.6.0

**Database:**
- PostgreSQL (Neon serverless)

**External Services:**
- Razorpay (Payments)
- Cloudinary (Video hosting)
- Hostinger SMTP (Emails)

## 🗄️ Database Schema

### Users Table
- id, email, hashed_password, full_name, phone
- referral_code (unique 12-char code)
- referred_by_id (self-referential FK)
- is_active, is_admin, created_at

### Packages Table
- id, name (Silver/Gold/Platinum), price, description
- features (JSON), is_active, display_order

### UserPackages Table
- user_id, package_id, payment_id
- status (active/expired), purchase_date, expiry_date

### Referrals Table
- referrer_id, referee_id, level (1 or 2)
- package_id, created_at

### Commissions Table
- user_id, referral_id, amount
- commission_type (level1/level2)
- status (pending/processing/paid/cancelled)
- payout_id, created_at, paid_at

### Payouts Table
- user_id, amount, status (pending/processing/completed/failed)
- transaction_id, payment_method
- bank_account_number, bank_ifsc, upi_id
- payout_date, completed_at

### Courses Table
- id, title, slug, description
- package_id, thumbnail_url
- is_published, display_order

### Videos Table
- id, course_id, title, description
- cloudinary_public_id, cloudinary_url, thumbnail_url
- duration, is_published, display_order

### Payments Table
- user_id, package_id, amount
- razorpay_order_id, razorpay_payment_id, razorpay_signature
- status (pending/success/failed)
- created_at, completed_at

## 💰 Commission Matrix

| Referrer Package | Referee Package | Level 1 | Level 2 |
|-----------------|-----------------|---------|---------|
| Silver          | Silver          | ₹1,875  | ₹150    |
| Silver          | Gold            | ₹2,375  | ₹350    |
| Silver          | Platinum        | ₹2,875  | ₹400    |
| Gold            | Silver          | ₹1,875  | ₹200    |
| Gold            | Gold            | ₹3,375  | ₹400    |
| Gold            | Platinum        | ₹3,875  | ₹600    |
| Platinum        | Silver          | ₹1,875  | ₹200    |
| Platinum        | Gold            | ₹3,375  | ₹500    |
| Platinum        | Platinum        | ₹5,625  | ₹1,000  |

## 🚀 Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables:**
Create `.env` file with:
```env
DATABASE_URL=postgresql://neondb_owner:npg_XVbg9LNkxBu1@ep-wandering-mud-adj0z6n6-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

RAZORPAY_KEY_ID=rzp_test_RBrPafmy42Nmd7
RAZORPAY_KEY_SECRET=5TVK1iA2npjluW6vDb0EXIn1

CLOUDINARY_CLOUD_NAME=dihv0v8hr
CLOUDINARY_API_KEY=418925754778477
CLOUDINARY_API_SECRET=LDeO-I6PgsrABW82WzYtDp1yIp8

EMAIL_FROM=roprly@bilvanaturals.online
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=roprly@bilvanaturals.online
SMTP_PASSWORD=Who@reddamma999

FRONTEND_URL=http://localhost:3000
MINIMUM_PAYOUT_AMOUNT=500.0
```

5. **Create database tables:**
```bash
python create_tables.py
```

6. **Seed initial data:**
```bash
python seed_packages.py
```

7. **Run the server:**
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000
API Documentation: http://localhost:8000/docs

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create `.env.local` file with:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RBrPafmy42Nmd7
```

4. **Run development server:**
```bash
npm run dev
```

Frontend will be available at: http://localhost:3000

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/referral-stats` - Get referral statistics

### Packages
- `GET /api/packages/` - List all packages
- `GET /api/packages/{id}` - Get package details

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/my-payments` - Get user's payments

### Referrals
- `GET /api/referrals/my-referrals` - Get user's referrals
- `GET /api/referrals/tree` - Get referral tree
- `GET /api/referrals/stats` - Get referral stats

### Commissions
- `GET /api/commissions/my-commissions` - Get user's commissions
- `GET /api/commissions/summary` - Get commission summary

### Courses
- `GET /api/courses/` - List accessible courses
- `GET /api/courses/{id}` - Get course with videos
- `POST /api/courses/{id}/videos` - Upload video (Admin)

### Payouts
- `GET /api/payouts/my-payouts` - Get payout history
- `GET /api/payouts/my-pending-amount` - Get pending amount
- `POST /api/payouts/request` - Request payout

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/{id}/toggle-active` - Toggle user status
- `POST /api/payouts/batch-create` - Create weekly payouts

## 🔐 Default Admin Account

After seeding, create an admin user manually:
```python
# In Python shell or script
from app.models.user import User
from app.core.database import SessionLocal
from app.core.security import get_password_hash

db = SessionLocal()
admin = User(
    email="admin@example.com",
    hashed_password=get_password_hash("admin123"),
    full_name="Admin User",
    phone="+919876543210",
    referral_code="ADMIN001",
    is_admin=True
)
db.add(admin)
db.commit()
```

## 🎬 User Flow

1. **Registration**: User registers with optional referral code
2. **Package Selection**: User browses Silver/Gold/Platinum packages
3. **Payment**: Razorpay checkout integration
4. **Commission Trigger**: On successful payment, referral commissions are calculated
5. **Course Access**: User gains access to courses based on package tier
6. **Referral Sharing**: User shares their unique referral code
7. **Earnings Tracking**: User views commissions in dashboard
8. **Payout Request**: User requests payout when minimum threshold is met
9. **Admin Approval**: Admin processes weekly payouts

## 📊 Commission Flow

```
User A (Platinum) → User B (Gold) → User C (Silver)

When User C purchases Silver (₹2,950):
- User B earns ₹1,875 (Level 1: Gold referrer, Silver referee)
- User A earns ₹200 (Level 2: Platinum referrer, Silver referee)
```

## 🔄 Weekly Payout Process

1. Admin runs: `POST /api/payouts/batch-create`
2. System calculates pending commissions for all users
3. Creates payout records for users above minimum threshold (₹500)
4. Marks commissions as "processing"
5. Admin processes payouts manually
6. Admin marks payouts as "completed" with transaction ID
7. Commissions marked as "paid"

## 🚧 Remaining Frontend Tasks

### Priority 1: Core User Features
1. **Dashboard Page** (`/dashboard`)
   - User stats card (package, earnings, referrals)
   - Referral link with copy button
   - Recent commissions table
   - Quick actions (buy package, request payout)

2. **Packages Page** (`/packages`)
   - Package cards with pricing
   - Feature comparison
   - Razorpay checkout integration
   - Payment success/failure handling

3. **Courses Page** (`/courses`)
   - Course grid with thumbnails
   - Package-based filtering
   - Course detail page with video list

4. **Video Player** (`/courses/[id]/videos/[videoId]`)
   - Cloudinary video player
   - Video controls
   - Next/Previous navigation

5. **Earnings Page** (`/earnings`)
   - Commission history table
   - Payout history
   - Request payout form
   - Earnings charts

### Priority 2: Admin Features
6. **Admin Dashboard** (`/admin`)
   - Statistics cards
   - Recent activity feed
   - Quick actions

7. **Admin Users** (`/admin/users`)
   - User list with search/filter
   - User details modal
   - Toggle active/admin status

8. **Admin Payouts** (`/admin/payouts`)
   - Pending payouts list
   - Batch payout creation
   - Process/cancel payout actions

9. **Admin Courses** (`/admin/courses`)
   - Course CRUD
   - Video upload interface
   - Publish/unpublish toggle

## 🔧 Deployment

### Backend Deployment (Railway/Render/Heroku)
1. Set environment variables
2. Use `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Ensure PostgreSQL database is accessible

### Frontend Deployment (Vercel/Netlify)
1. Connect GitHub repository
2. Set environment variables
3. Build command: `npm run build`
4. Output directory: `.next`

## 📞 Support

For issues or questions, contact the development team.

## 📄 License

Proprietary - All rights reserved

