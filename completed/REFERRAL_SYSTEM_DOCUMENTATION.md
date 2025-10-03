# Affiliate Learning Platform - Referral & Commission System Documentation

## 🎯 System Overview

This is a **2-Level MLM (Multi-Level Marketing)** system where users earn commissions when their referrals purchase packages.

---

## 📊 Database Tables

### 1. **users** table
- Stores user information
- `referred_by_id`: Tracks who referred this user (populated at registration)
- `referral_code`: Unique code for each user to share

### 2. **packages** table
- Three tiers: Silver (₹2,950), Gold (₹5,310), Platinum (₹8,850)
- Each package has `base_price`, `gst_amount`, and `final_price`

### 3. **payments** table
- Tracks Razorpay payment transactions
- Status: created → success/failed
- Links to user and package

### 4. **user_packages** table
- Records which packages users have purchased
- Status: active/expired/cancelled
- Links to user, package, and payment

### 5. **referrals** table ⚠️ **ONLY POPULATED AFTER PURCHASE**
- `referrer_id`: Person who earns commission
- `referee_id`: Person who was referred and made a purchase
- `level`: 1 (direct) or 2 (indirect)
- `package_id`: Package purchased by referee
- **IMPORTANT**: Records are created ONLY when referee purchases a package, NOT at registration

### 6. **commissions** table ⚠️ **ONLY POPULATED AFTER PURCHASE**
- `user_id`: Person who earned the commission
- `referral_id`: Links to referral record
- `amount`: Commission amount in INR
- `commission_type`: "level1" or "level2"
- `status`: "pending" (default), "paid", "cancelled"
- **IMPORTANT**: Created only when referee purchases AND referrer has an active package

---

## 🔄 Complete Referral Flow

### Step 1: User Registration with Referral Code
```
User A (existing user) → Shares referral link: /register?ref=ABC123
User B (new user) → Registers using the link
Database: User B's record has referred_by_id = User A's ID
Result: NO records in referrals or commissions tables yet
```

### Step 2: Package Purchase Triggers Commission Calculation
```
User B → Purchases Silver package (₹2,950)
Payment verified → process_referral_commissions() is called
System checks:
  1. Does User B have a referrer? (User A) ✓
  2. Does User A have an active package? 
     - If YES → Calculate commission and create records
     - If NO → Skip commission (no records created)
```

### Step 3: Level 1 (Direct) Commission
```
IF User A has an active package:
  1. Create Referral record:
     - referrer_id: User A
     - referee_id: User B
     - level: 1
     - package_id: Silver
  
  2. Calculate commission based on matrix:
     - User A's package: Gold
     - User B's package: Silver
     - Level: 1
     - Commission: ₹1,875
  
  3. Create Commission record:
     - user_id: User A
     - amount: ₹1,875
     - commission_type: "level1"
     - status: "pending"
```

### Step 4: Level 2 (Indirect) Commission
```
IF User A was also referred by someone (User C):
  AND User C has an active package:
    1. Create Referral record:
       - referrer_id: User C
       - referee_id: User B
       - level: 2
       - package_id: Silver
    
    2. Calculate commission based on matrix:
       - User C's package: Platinum
       - User B's package: Silver
       - Level: 2
       - Commission: ₹200
    
    3. Create Commission record:
       - user_id: User C
       - amount: ₹200
       - commission_type: "level2"
       - status: "pending"
```

---

## 💰 Commission Matrix

Commission amount depends on:
1. **Referrer's Package Tier** (the person earning commission)
2. **Referee's Package Tier** (the person who purchased)
3. **Commission Level** (1 = direct, 2 = indirect)

### Matrix Table

| Referrer Package | Referee Package | Level 1 Commission | Level 2 Commission |
|------------------|-----------------|--------------------|--------------------|
| **Silver**       | Silver          | ₹1,875             | ₹150               |
| **Silver**       | Gold            | ₹2,375             | ₹350               |
| **Silver**       | Platinum        | ₹2,875             | ₹400               |
| **Gold**         | Silver          | ₹1,875             | ₹200               |
| **Gold**         | Gold            | ₹3,375             | ₹400               |
| **Gold**         | Platinum        | ₹3,875             | ₹600               |
| **Platinum**     | Silver          | ₹1,875             | ₹200               |
| **Platinum**     | Gold            | ₹3,375             | ₹500               |
| **Platinum**     | Platinum        | ₹5,625             | ₹1,000             |

**Example:**
- User A has Gold package
- User B (referred by A) purchases Silver package
- User A earns: ₹1,875 (Level 1)
- If User C referred User A and has Platinum package:
  - User C earns: ₹200 (Level 2)

---

## ⚠️ Critical Requirements for Commission Creation

### Requirement 1: Referrer MUST Have an Active Package
```python
# From referral_service.py line 80-83
referrer_package = get_user_current_package(referrer.id, db)
if not referrer_package:
    # Referrer doesn't have a package yet, no commission
    return
```

**This means:**
- If User A refers User B, but User A hasn't purchased a package yet
- When User B purchases a package, User A gets NOTHING
- User A must purchase a package FIRST to earn commissions

### Requirement 2: Payment Must Be Verified
```python
# From payments.py line 164-170
# Trigger referral commission calculation (async task in production)
from app.services.referral_service import process_referral_commissions
try:
    process_referral_commissions(current_user.id, payment.package_id, db)
except Exception as e:
    print(f"Error processing referral commissions: {e}")
```

Commission calculation only happens after:
1. Razorpay payment is created
2. User completes payment
3. Payment signature is verified
4. Payment status is set to "success"

---

## 🧪 Testing Workflow

### Scenario 1: Basic Referral (Both Users Have Packages)

**Step 1:** User A purchases Silver package
```
POST /api/payments/create-order {"package_id": 1}
Complete Razorpay payment
POST /api/payments/verify {razorpay_order_id, razorpay_payment_id, razorpay_signature}
Result: User A has Silver package
```

**Step 2:** User B registers with User A's referral code
```
POST /api/auth/register {email, password, referral_code: "ABC123"}
Result: User B's referred_by_id = User A's ID
```

**Step 3:** User B purchases Gold package
```
POST /api/payments/create-order {"package_id": 2}
Complete Razorpay payment
POST /api/payments/verify {...}
Result:
  - User B has Gold package
  - Referral record created (referrer: A, referee: B, level: 1)
  - Commission created (user: A, amount: ₹2,375, type: level1)
```

**Step 4:** Check User A's dashboard
```
GET /api/referrals/stats
Response: {total_referrals: 1, level1_referrals: 1, level2_referrals: 0}

GET /api/commissions/summary
Response: {total_earnings: 2375.0, pending_amount: 2375.0, paid_amount: 0}
```

### Scenario 2: Referrer Without Package (No Commission)

**Step 1:** User A registers (no package purchase)

**Step 2:** User B registers with User A's referral code

**Step 3:** User B purchases Silver package
```
Result:
  - User B has Silver package
  - NO referral record created
  - NO commission created
  - User A sees 0 referrals and ₹0 earnings
```

**Why?** User A doesn't have an active package, so they don't qualify for commissions.

---

## 🐛 Why Your Tables Are Empty

Based on your description, the tables are empty because:

1. **No one has completed a package purchase yet**
   - The `referred_by_id` field is populated at registration ✓
   - But `referrals` and `commissions` tables are only populated after purchase ✗

2. **Possible scenarios:**
   - Users registered with referral codes but didn't purchase packages
   - Users purchased packages but weren't referred by anyone
   - Referrers don't have active packages themselves

---

## 🔧 Code Locations

- **Payment verification**: `backend/app/api/payments.py` line 97-172
- **Commission trigger**: `backend/app/api/payments.py` line 165
- **Referral service**: `backend/app/services/referral_service.py`
- **Commission calculator**: `backend/app/services/commission_calculator.py`
- **Commission matrix**: `backend/app/services/commission_calculator.py` line 11-27

---

## 📝 Commission Status Lifecycle

1. **pending** (default): Commission created but not paid out
2. **paid**: Commission has been paid to the user (linked to payout_id)
3. **cancelled**: Commission was cancelled (e.g., refund, fraud)

Commissions remain "pending" until an admin creates a payout and marks them as paid.

