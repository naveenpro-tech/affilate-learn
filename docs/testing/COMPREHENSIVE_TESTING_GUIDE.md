# 🧪 COMPREHENSIVE TESTING GUIDE

**Date:** January 15, 2025  
**Backend:** http://localhost:8000  
**Frontend:** http://localhost:3000  
**API Docs:** http://localhost:8000/redoc  

---

## ✅ SERVERS STATUS

- **Backend Server:** ✅ Running on port 8000
- **Frontend Server:** ✅ Running on port 3000
- **Import Fixes Applied:** ✅ All import errors resolved

---

## PART 1: BACKEND API TESTING

### 📍 Access ReDoc Documentation
**URL:** http://localhost:8000/redoc

### API Endpoints to Test:

#### 1. **Authentication Endpoints** (`/api/auth`)
- [ ] `POST /api/auth/register` - User registration
  - Test with valid data
  - Test with duplicate email
  - Test with invalid referral code
  - **Expected:** 201 Created, returns user + token

- [ ] `POST /api/auth/login` - User login
  - Test with valid credentials
  - Test with invalid credentials
  - **Expected:** 200 OK, returns token

- [ ] `GET /api/auth/me` - Get current user
  - Test with valid token
  - Test without token
  - **Expected:** 200 OK, returns user data

- [ ] `PUT /api/auth/me` - Update user profile
  - Test updating username, bio, social links
  - **Expected:** 200 OK, returns updated user

- [ ] `POST /api/auth/forgot-password` - Request password reset
  - Test with valid email
  - **Expected:** 200 OK, sends reset email

- [ ] `POST /api/auth/reset-password` - Reset password
  - Test with valid token
  - **Expected:** 200 OK, password changed

- [ ] `GET /api/auth/stats` - Get user stats
  - **Expected:** 200 OK, returns referral/earnings stats

#### 2. **Package Endpoints** (`/api/packages`)
- [ ] `GET /api/packages/` - List all packages
  - **Expected:** 200 OK, returns Silver, Gold, Platinum

- [ ] `GET /api/packages/{id}` - Get package details
  - **Expected:** 200 OK, returns package info

#### 3. **Course/Module/Topic Endpoints** (`/api/courses`, `/api/modules`)
- [ ] `GET /api/courses/` - List all courses
  - **Expected:** 200 OK, returns course list

- [ ] `GET /api/courses/{id}` - Get course details
  - **Expected:** 200 OK, returns course with modules

- [ ] `GET /api/courses/{id}/modules` - Get course modules
  - **Expected:** 200 OK, returns modules list

- [ ] `GET /api/modules/{id}/topics` - Get module topics
  - **Expected:** 200 OK, returns topics list

- [ ] `GET /api/modules/topics/{id}` - Get topic details
  - **Expected:** 200 OK, returns topic with video info

#### 4. **Payment Endpoints** (`/api/payments`)
- [ ] `POST /api/payments/create-order` - Create Razorpay order
  - Test with valid package_id
  - **Expected:** 200 OK, returns order_id

- [ ] `POST /api/payments/verify` - Verify payment
  - Test with valid Razorpay signature
  - **Expected:** 200 OK, activates package, triggers commissions

- [ ] `GET /api/payments/my-payments` - Get payment history
  - **Expected:** 200 OK, returns user's payments

#### 5. **Commission & Referral Endpoints** (`/api/commissions`, `/api/referrals`)
- [ ] `GET /api/commissions/my-commissions` - Get user commissions
  - **Expected:** 200 OK, returns commission list

- [ ] `GET /api/commissions/summary` - Get commission summary
  - **Expected:** 200 OK, returns total/pending/paid amounts

- [ ] `GET /api/referrals/my-referrals` - Get user referrals
  - **Expected:** 200 OK, returns referral tree

- [ ] `GET /api/referrals/tree` - Get referral tree
  - **Expected:** 200 OK, returns hierarchical tree

#### 6. **Notification Endpoints** (`/api/notifications`)
- [ ] `GET /api/notifications/` - Get notifications
  - Test with unread_only=true
  - **Expected:** 200 OK, returns notification list

- [ ] `GET /api/notifications/stats` - Get notification stats
  - **Expected:** 200 OK, returns total/unread/read counts

- [ ] `PATCH /api/notifications/{id}/read` - Mark as read
  - **Expected:** 200 OK, updates notification

- [ ] `POST /api/notifications/mark-all-read` - Mark all as read
  - **Expected:** 200 OK, updates all notifications

- [ ] `DELETE /api/notifications/{id}` - Delete notification
  - **Expected:** 204 No Content

#### 7. **Wallet Endpoints** (`/api/wallet`)
- [ ] `GET /api/wallet/` - Get wallet
  - **Expected:** 200 OK, returns wallet with balance

- [ ] `GET /api/wallet/stats` - Get wallet stats
  - **Expected:** 200 OK, returns balance/earned/withdrawn

- [ ] `GET /api/wallet/transactions` - Get transactions
  - **Expected:** 200 OK, returns transaction history

- [ ] `POST /api/wallet/withdraw` - Withdraw from wallet
  - Test with amount >= 500
  - **Expected:** 200 OK, creates payout request

#### 8. **Certificate Endpoints** (`/api/certificates`)
- [ ] `GET /api/certificates/my-certificates` - Get user certificates
  - **Expected:** 200 OK, returns certificate list

- [ ] `GET /api/certificates/verify/{number}` - Verify certificate
  - **Expected:** 200 OK, returns certificate details

- [ ] `GET /api/certificates/{id}` - Get certificate by ID
  - **Expected:** 200 OK, returns certificate

#### 9. **Payout Endpoints** (`/api/payouts`)
- [ ] `GET /api/payouts/my-payouts` - Get payout history
  - **Expected:** 200 OK, returns payout list

- [ ] `GET /api/payouts/my-pending-amount` - Get pending amount
  - **Expected:** 200 OK, returns pending commission amount

- [ ] `POST /api/payouts/request` - Request payout
  - Test with amount >= 500
  - **Expected:** 201 Created, creates payout request

#### 10. **Admin Endpoints** (`/api/admin`)
- [ ] `GET /api/admin/dashboard` - Get admin dashboard
  - **Expected:** 200 OK, returns stats (admin only)

- [ ] `GET /api/admin/users` - List all users
  - **Expected:** 200 OK, returns user list (admin only)

- [ ] `GET /api/admin/courses` - List all courses
  - **Expected:** 200 OK, returns course list (admin only)

- [ ] `POST /api/admin/courses` - Create course
  - **Expected:** 201 Created (admin only)

---

## PART 2: FRONTEND INTEGRATION TESTING

### 📍 Access Frontend
**URL:** http://localhost:3000

### Features to Test:

#### 1. **User Registration & Login**
- [ ] Navigate to `/register`
- [ ] Fill registration form with referral code
- [ ] Verify referrer name displays (if referral code valid)
- [ ] Submit registration
- [ ] Verify redirect to dashboard
- [ ] Logout
- [ ] Login with credentials
- [ ] Verify successful login

#### 2. **Package Browsing & Purchase**
- [ ] Navigate to `/packages`
- [ ] View all 3 packages (Silver, Gold, Platinum)
- [ ] Click "Buy Now" on a package
- [ ] Verify Razorpay modal opens
- [ ] Complete test payment
- [ ] Verify package activation
- [ ] Verify commission credited to referrer's wallet

#### 3. **Course Viewing & Video Playback**
- [ ] Navigate to `/courses`
- [ ] Click on a course
- [ ] View modules list
- [ ] Click on a module
- [ ] View topics list
- [ ] Click on a topic
- [ ] Verify video player loads
- [ ] Test all 4 video sources:
  - YouTube video
  - Vimeo video
  - Cloudinary video
  - External video
- [ ] Verify previous/next navigation works
- [ ] Verify progress tracking

#### 4. **Notifications Bell & Page**
- [ ] Check notification bell in navbar
- [ ] Verify unread count badge
- [ ] Click bell to open dropdown
- [ ] Verify notifications list
- [ ] Click a notification
- [ ] Verify mark as read
- [ ] Navigate to `/notifications`
- [ ] Verify full notification history
- [ ] Test filters (all/unread)
- [ ] Test delete notification

#### 5. **Wallet Page & Transactions**
- [ ] Navigate to `/wallet`
- [ ] Verify wallet balance displays
- [ ] Verify stats cards (earned/withdrawn/spent)
- [ ] Verify transaction history
- [ ] Test withdraw modal
- [ ] Verify minimum withdrawal (₹500)
- [ ] Verify transaction details

#### 6. **Certificates Page**
- [ ] Navigate to `/certificates`
- [ ] Verify certificate list
- [ ] Click "View Certificate"
- [ ] Verify certificate details
- [ ] Test certificate verification

#### 7. **Referrals & Earnings Pages**
- [ ] Navigate to `/referrals`
- [ ] Verify referral tree visualization
- [ ] Verify direct/indirect referral counts
- [ ] Navigate to `/earnings`
- [ ] Verify commission list
- [ ] Verify earnings summary

#### 8. **Profile Management**
- [ ] Navigate to `/profile`
- [ ] Update username
- [ ] Update bio
- [ ] Update social links (Instagram, Twitter, LinkedIn)
- [ ] Upload avatar
- [ ] Verify changes saved

---

## PART 3: EMAIL SERVICE INTEGRATION

### Email Features to Implement:

#### 1. **Referral Code Validation on Sign Up**
**File:** `frontend/app/register/page.tsx`

**Implementation:**
- When user enters referral code, call API to validate
- Display referrer's name if code is valid
- Show error if code is invalid

**API Endpoint Needed:**
```typescript
GET /api/auth/validate-referral-code?code={code}
Response: { valid: boolean, referrer_name: string }
```

#### 2. **Package Purchase Confirmation Email**
**File:** `backend/app/api/payments.py`

**Implementation:**
- After successful payment verification
- Send email with package details
- Include transaction ID, purchase date
- Add link to access courses

**Email Template:**
```
Subject: Package Purchase Confirmation - {Package Name}

Dear {User Name},

Thank you for purchasing the {Package Name} package!

Purchase Details:
- Package: {Package Name}
- Price: ₹{Price}
- Transaction ID: {Transaction ID}
- Purchase Date: {Date}

You can now access all courses included in your package.

Access Your Courses: {Link}

Best regards,
MLM Learning Platform Team
```

#### 3. **Referrer Commission Notification Email**
**File:** `backend/app/services/referral_service.py`

**Implementation:**
- After commission is created and credited to wallet
- Send email to referrer
- Include commission amount and details

**Email Template:**
```
Subject: You Earned a Commission! 💰

Dear {Referrer Name},

Great news! You've earned a commission.

Commission Details:
- Amount: ₹{Amount}
- Level: {Level 1/Level 2}
- From: {Referee Name}
- Package: {Package Name}
- Date: {Date}

This amount has been automatically credited to your wallet.

View Your Wallet: {Link}

Keep referring to earn more!

Best regards,
MLM Learning Platform Team
```

---

## PART 4: TESTING & VERIFICATION

### Complete User Flow Test:

#### Step 1: New User Signs Up with Referral Code
1. Open `/register`
2. Enter referral code
3. **Verify:** Referrer name displays
4. Complete registration
5. **Verify:** Welcome email sent
6. **Verify:** User redirected to dashboard

#### Step 2: User Purchases Package
1. Navigate to `/packages`
2. Select a package
3. Complete payment
4. **Verify:** Purchase confirmation email sent
5. **Verify:** Package activated
6. **Verify:** User can access courses

#### Step 3: Referrer Receives Commission
1. **Verify:** Commission created in database
2. **Verify:** Commission auto-credited to wallet
3. **Verify:** Referrer receives commission notification email
4. **Verify:** Wallet balance updated
5. **Verify:** Transaction appears in wallet history

#### Step 4: Referrer's Referrer Receives Level 2 Commission
1. **Verify:** Level 2 commission created
2. **Verify:** Level 2 commission auto-credited to wallet
3. **Verify:** Level 2 referrer receives email
4. **Verify:** Wallet balance updated

---

## 📝 ISSUES FOUND

### Backend Issues:
- [x] Import errors in notifications.py and wallet.py - **FIXED**
- [ ] (Add any issues found during testing)

### Frontend Issues:
- [ ] (Add any issues found during testing)

### Email Integration Issues:
- [ ] Referral code validation API endpoint missing
- [ ] Purchase confirmation email not implemented
- [ ] Commission notification email not implemented

---

## ✅ NEXT STEPS

1. **Test all backend API endpoints** using ReDoc interface
2. **Test all frontend features** manually in browser
3. **Implement email service integration:**
   - Create referral code validation endpoint
   - Add purchase confirmation email
   - Add commission notification email
4. **Test complete user flow** end-to-end
5. **Document any issues** found
6. **Fix issues** and retest

---

**Testing Status:** IN PROGRESS  
**Last Updated:** January 15, 2025

