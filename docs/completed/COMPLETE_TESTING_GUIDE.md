# 🧪 Complete Testing Guide - Affiliate Learning Platform

## 📋 Summary of Fixes

### ✅ Issue 1: Hydration Error - FIXED
**Problem:** React hydration mismatch on login/register pages due to missing `autoComplete` attributes

**Solution:** Added proper `autoComplete` attributes to all form inputs:
- Login page: `autoComplete="email"` and `autoComplete="current-password"`
- Register page: `autoComplete="name"`, `autoComplete="email"`, `autoComplete="tel"`, `autoComplete="new-password"`

**Files Modified:**
- `frontend/app/login/page.tsx`
- `frontend/app/register/page.tsx`

---

### ✅ Issue 2: Database Tables Empty - EXPLAINED
**Problem:** `referrals` and `commissions` tables are empty

**Root Cause:** These tables are ONLY populated after a referred user purchases a package AND the referrer has an active package.

**Current State:**
```
Users: 9 users exist, some with referral relationships
Packages: 3 packages available (Silver, Gold, Platinum)
User Packages: 0 ❌ (No purchases yet)
Referrals: 0 ❌ (No purchases yet)
Commissions: 0 ❌ (No purchases yet)
```

**Why Tables Are Empty:**
1. No one has purchased a package yet
2. Referral records are created ONLY when:
   - A referred user purchases a package
   - The referrer has an active package
3. Commission records are created at the same time as referral records

---

### ✅ Issue 3: Commission Flow - DOCUMENTED
**Complete documentation created in:** `REFERRAL_SYSTEM_DOCUMENTATION.md`

**Key Points:**
1. **Registration:** User B registers with User A's referral code → `referred_by_id` is set
2. **Purchase Trigger:** User B purchases a package → Commission calculation starts
3. **Referrer Check:** System checks if User A has an active package
4. **Commission Creation:** If yes, creates `Referral` and `Commission` records
5. **Level 2:** If User A was also referred, creates Level 2 commission for User A's referrer

---

## 🧪 Step-by-Step Testing Instructions

### Test 1: Basic Level 1 Commission

**Objective:** Verify that a direct referral generates a commission

**Step 1: Referrer Purchases Package**
```
1. Open browser: http://localhost:3000/login
2. Login:
   Email: testfrontend@example.com
   Password: testpass123
3. Navigate to Packages: http://localhost:3000/packages
4. Click "Buy Now" on Silver package (₹2,950)
5. Razorpay modal opens:
   - Select "UPI payment"
   - Enter UPI ID: test@paytm
   - Press Enter
   - Payment succeeds automatically
6. Verify: Dashboard shows "Current Package: Silver"
```

**Step 2: Referred User Purchases Package**
```
1. Logout
2. Login:
   Email: referreduser1@example.com
   Password: password123
   (This user was already referred by testfrontend)
3. Navigate to Packages
4. Click "Buy Now" on Gold package (₹5,310)
5. Complete payment (same UPI process)
6. Verify: Dashboard shows "Current Package: Gold"
```

**Step 3: Verify Commission Created**
```
1. Logout
2. Login as testfrontend@example.com
3. Check Dashboard:
   - Total Referrals: 1
   - L1: 1 | L2: 0
   - Total Earnings: ₹2,375.00
   - Pending: ₹2,375.00
4. Navigate to Earnings page
5. Verify commission record:
   - From: referreduser1@example.com
   - Package: Gold
   - Amount: ₹2,375
   - Type: Level 1
   - Status: Pending
```

**Expected Database State:**
```sql
-- Check user_packages
SELECT * FROM user_packages;
-- Should show 2 records (testfrontend with Silver, referreduser1 with Gold)

-- Check referrals
SELECT * FROM referrals;
-- Should show 1 record (referrer: 3, referee: 8, level: 1, package: 2)

-- Check commissions
SELECT * FROM commissions;
-- Should show 1 record (user: 3, amount: 2375.0, type: level1, status: pending)
```

---

### Test 2: 2-Level Commission (Level 1 + Level 2)

**Objective:** Verify that indirect referrals generate both Level 1 and Level 2 commissions

**Setup:**
```
User A (naveenvide@gmail.com) → Refers → User B (om@gmail.com) → Refers → User C (new)
```

**Step 1: User A Purchases Platinum**
```
1. Login: naveenvide@gmail.com (password: password123)
2. Purchase Platinum package (₹8,850)
3. Complete payment
```

**Step 2: User B Purchases Gold**
```
1. Login: om@gmail.com (password: password123)
2. Purchase Gold package (₹5,310)
3. Complete payment
4. Verify User A's commission:
   - Login as naveenvide@gmail.com
   - Total Earnings: ₹3,875 (Platinum → Gold → Level 1)
```

**Step 3: Register User C with User B's Code**
```
1. Logout
2. Navigate to: http://localhost:3000/register?ref=HJPAEUIM
3. Register:
   Email: userC@example.com
   Password: password123
   Full Name: User C
   Phone: +91 9876543210
   Referral Code: HJPAEUIM (auto-filled)
4. Registration succeeds
```

**Step 4: User C Purchases Silver**
```
1. Login as userC@example.com
2. Purchase Silver package (₹2,950)
3. Complete payment
```

**Step 5: Verify TWO Commissions Created**
```
1. Login as om@gmail.com (User B - direct referrer)
   - Total Referrals: 1
   - Total Earnings: ₹3,375 (Gold → Silver → Level 1)

2. Login as naveenvide@gmail.com (User A - indirect referrer)
   - Total Referrals: 2 (1 direct + 1 indirect)
   - L1: 1 | L2: 1
   - Total Earnings: ₹3,875 + ₹600 = ₹4,475
   - Should see 2 commission records:
     * ₹3,875 from om@gmail.com (Level 1)
     * ₹600 from userC@example.com (Level 2)
```

---

### Test 3: Referrer Without Package (No Commission)

**Objective:** Verify that referrers without packages don't earn commissions

**Step 1: Register New User with Referral Code**
```
1. Navigate to: http://localhost:3000/register?ref=71HD4HZ2
   (testuser@example.com's referral code)
2. Register:
   Email: nopackage@example.com
   Password: password123
   Full Name: No Package User
   Phone: +91 9876543210
```

**Step 2: New User Purchases Package**
```
1. Login as nopackage@example.com
2. Purchase Silver package (₹2,950)
3. Complete payment
```

**Step 3: Verify NO Commission Created**
```
1. Login as testuser@example.com
2. Check Dashboard:
   - Total Referrals: 0 ❌
   - Total Earnings: ₹0.00 ❌
3. Why? testuser doesn't have a package, so no commission is created
```

---

## 🔧 Razorpay Test Mode Guide

### Quick Payment Method (UPI):
1. Payment modal opens
2. Click "UPI" tab
3. Enter: `test@paytm` or `success@razorpay`
4. Press Enter
5. Payment succeeds automatically

### Alternative Methods:
- **Card:** `4111 1111 1111 1111`, any future expiry, any CVV
- **Net Banking:** Select any bank, auto-succeeds
- **Wallet:** Select any wallet, auto-succeeds

### Test UPI IDs:
- `success@razorpay` → Always succeeds
- `failure@razorpay` → Always fails (for error testing)

---

## 📊 Commission Matrix Reference

| Referrer Package | Referee Package | Level 1 | Level 2 |
|------------------|-----------------|---------|---------|
| Silver           | Silver          | ₹1,875  | ₹150    |
| Silver           | Gold            | ₹2,375  | ₹350    |
| Silver           | Platinum        | ₹2,875  | ₹400    |
| Gold             | Silver          | ₹1,875  | ₹200    |
| Gold             | Gold            | ₹3,375  | ₹400    |
| Gold             | Platinum        | ₹3,875  | ₹600    |
| Platinum         | Silver          | ₹1,875  | ₹200    |
| Platinum         | Gold            | ₹3,375  | ₹500    |
| Platinum         | Platinum        | ₹5,625  | ₹1,000  |

---

## 🐛 Troubleshooting

### Payment Modal Doesn't Open
- Check browser console for errors
- Verify Razorpay key is loaded
- Check network tab for API errors

### Commission Not Created
- Verify referrer has an active package
- Check backend logs: `Terminal 75`
- Verify payment status is "success"

### Wrong Commission Amount
- Check referrer's package tier
- Check referee's purchased package tier
- Verify commission matrix in `backend/app/services/commission_calculator.py`

---

## ✅ Expected Results After Testing

### Database State:
```
User Packages: 5+ records (multiple users with packages)
Referrals: 3+ records (Level 1 and Level 2)
Commissions: 4+ records (various amounts and types)
```

### Dashboard Display:
- Referrers see accurate referral counts
- Earnings are calculated correctly
- Commission details are visible in Earnings page
- Referral links work properly

---

## 📝 Additional Documentation

- **System Architecture:** `REFERRAL_SYSTEM_DOCUMENTATION.md`
- **Commission Logic:** `backend/app/services/referral_service.py`
- **Commission Matrix:** `backend/app/services/commission_calculator.py`
- **Payment Flow:** `backend/app/api/payments.py`

---

## 🎯 Next Steps

1. ✅ Complete all 3 test scenarios
2. ✅ Verify database records are created correctly
3. ✅ Check dashboard displays are accurate
4. 📸 Take screenshots of working features
5. 📊 Create demo data for presentation
6. 🚀 Prepare for production deployment

