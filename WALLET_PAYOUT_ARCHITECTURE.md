# 💰 WALLET & PAYOUT SYSTEM ARCHITECTURE

**Date:** January 15, 2025  
**Status:** ✅ **IMPLEMENTED - WALLET AS SINGLE SOURCE OF TRUTH**

---

## 📋 **OVERVIEW**

This document explains the corrected architecture for the Wallet and Payout system, which now uses **Wallet as the single source of truth** for all commission earnings and payouts.

---

## 🎯 **CORE PRINCIPLE**

**Wallet Balance = Single Source of Truth**

All money flows through the wallet:
1. Commissions earned → Auto-credited to Wallet
2. Payout requested → Debited from Wallet
3. Admin approves → Payout processed
4. Bank transfer → Payout completed

---

## 🔄 **COMPLETE FLOW**

### **Step 1: Commission Earned**
```
User A refers User B
    ↓
User B purchases package
    ↓
Commission calculated (40% Level 1 or 10% Level 2)
    ↓
TWO things happen:
    1. Commission record created (for audit/history)
    2. Wallet auto-credited (money added to balance)
```

**Backend Code:**
```python
# In referral_service.py
# 1. Create commission record
commission = Commission(
    user_id=referrer.id,
    amount=commission_amount,
    status="pending"  # For history/audit only
)

# 2. Auto-credit wallet (SINGLE SOURCE OF TRUTH)
credit_wallet_internal(
    db=db,
    user_id=referrer.id,
    amount=commission_amount,
    source=TransactionSource.COMMISSION,
    description=f"Level 1 commission from {referee.full_name}'s package"
)
```

### **Step 2: User Requests Payout**
```
User navigates to Payout page
    ↓
Sees Wallet Balance (e.g., ₹11,400)
    ↓
Clicks "Request Payout"
    ↓
Backend checks:
    - Wallet balance >= ₹500 (minimum)
    - Bank details exist
    - No pending payout already
    ↓
Wallet debited immediately
    ↓
Payout record created (status: pending)
    ↓
Wallet transaction created (audit trail)
```

**Backend Code:**
```python
# In payouts.py - request_payout()
wallet = get_or_create_wallet(db, current_user.id)

# Check balance
if wallet.balance < settings.MINIMUM_PAYOUT_AMOUNT:
    raise HTTPException(...)

# Create payout
payout = Payout(
    user_id=current_user.id,
    amount=wallet.balance,  # Full wallet balance
    status='pending'
)

# Debit wallet immediately
create_transaction(
    db=db,
    wallet=wallet,
    transaction_type=TransactionType.DEBIT,
    source=TransactionSource.PAYOUT,
    amount=wallet.balance,
    description=f"Payout request #{payout.id}"
)
```

### **Step 3: Admin Approves Payout**
```
Admin views pending payouts
    ↓
Approves payout
    ↓
Payout status: pending → processing
    ↓
Admin initiates bank transfer
```

### **Step 4: Payout Completed**
```
Bank transfer successful
    ↓
Admin marks payout as completed
    ↓
Payout status: processing → completed
    ↓
Money transferred to user's bank account
```

---

## 📊 **DATABASE MODELS**

### **Wallet Model**
```python
class Wallet(Base):
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    balance = Column(Float, default=0.0)           # Current balance
    total_earned = Column(Float, default=0.0)      # All-time earnings
    total_withdrawn = Column(Float, default=0.0)   # All-time withdrawals
    total_spent = Column(Float, default=0.0)       # Purchases (future)
```

**Purpose:** Single source of truth for user's money

### **WalletTransaction Model**
```python
class WalletTransaction(Base):
    id = Column(Integer, primary_key=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"))
    type = Column(Enum(TransactionType))      # CREDIT or DEBIT
    source = Column(Enum(TransactionSource))  # COMMISSION, PAYOUT, etc.
    amount = Column(Float)
    balance_before = Column(Float)
    balance_after = Column(Float)
    description = Column(Text)
    reference_id = Column(String)  # Links to commission_id, payout_id
```

**Purpose:** Complete audit trail of all wallet transactions

### **Commission Model**
```python
class Commission(Base):
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    referral_id = Column(Integer, ForeignKey("referrals.id"))
    amount = Column(Float)
    commission_type = Column(String)  # level1, level2
    status = Column(String)  # pending (for history only)
    payout_id = Column(Integer, nullable=True)  # Not used anymore
```

**Purpose:** History and audit log of which referrals generated which commissions

### **Payout Model**
```python
class Payout(Base):
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    status = Column(String)  # pending, processing, completed, failed
    bank_account_number = Column(String)
    bank_ifsc = Column(String)
    upi_id = Column(String)
```

**Purpose:** Track payout requests and their status

---

## 🔧 **API ENDPOINTS**

### **Wallet Endpoints**
```
GET  /api/wallet/                    - Get wallet details
GET  /api/wallet/stats               - Get wallet statistics
GET  /api/wallet/transactions        - Get transaction history
POST /api/wallet/credit              - Credit wallet (internal/admin)
POST /api/wallet/debit               - Debit wallet (internal)
```

### **Payout Endpoints**
```
GET  /api/payouts/available-balance  - Get wallet balance (for payout)
POST /api/payouts/request            - Request payout (debits wallet)
GET  /api/payouts/my-payouts         - Get payout history
```

### **Admin Endpoints**
```
GET  /api/admin/payouts/all          - Get all payouts
PUT  /api/admin/payouts/{id}/approve - Approve payout
PUT  /api/admin/payouts/{id}/complete - Mark as completed
PUT  /api/admin/payouts/{id}/reject  - Reject payout
```

---

## 💡 **KEY CHANGES FROM OLD ARCHITECTURE**

### **OLD (Problematic):**
```
Commission Earned
    ├─→ Commission Table (status: pending)
    │   └─→ Payout reads from here ❌
    └─→ Wallet (auto-credit)
        └─→ Ignored by payout ❌

Result: Money counted twice!
```

### **NEW (Correct):**
```
Commission Earned
    ├─→ Commission Table (history/audit only)
    └─→ Wallet (SINGLE SOURCE OF TRUTH) ✅
        └─→ Payout reads from here ✅

Result: One balance, clear flow!
```

---

## 📱 **FRONTEND CHANGES**

### **Payout Page (`frontend/app/payouts/page.tsx`)**

**Updated Cards:**
1. **Wallet Balance** (was "Available Balance")
   - Shows `wallet.balance`
   - Subtitle: "Available for withdrawal"

2. **Total Earnings** (unchanged)
   - Shows `wallet.total_earned`
   - Subtitle: "All-time commissions"

3. **Pending Payouts** (unchanged)
   - Shows sum of pending/processing payouts
   - Subtitle: "Awaiting approval"

4. **Total Withdrawn** (was "Paid Amount")
   - Shows `wallet.total_withdrawn`
   - Subtitle: "Completed payouts"

**Added Info Banner:**
```
💡 Your wallet balance includes all earned commissions.
When you request a payout, the amount is deducted from your
wallet and sent for admin approval.
```

**Updated Request Payout Section:**
- Shows full wallet balance to be withdrawn
- Clarifies funds are deducted immediately
- Minimum amount check against wallet balance

---

## ✅ **BENEFITS OF NEW ARCHITECTURE**

1. **Single Source of Truth**
   - No confusion about which balance to use
   - Wallet balance is always accurate

2. **Better Audit Trail**
   - WalletTransaction table tracks every change
   - Balance before/after for each transaction
   - Reference IDs link to commissions/payouts

3. **Flexibility**
   - Can add purchases, refunds, admin adjustments
   - Can implement wallet-based course purchases
   - Can add bonus credits, promotions

4. **User Clarity**
   - Users see one balance
   - Clear flow: Earn → Wallet → Withdraw
   - Transaction history shows everything

5. **Commission Table Preserved**
   - Still tracks which referrals earned what
   - Useful for reports and analytics
   - Audit trail for commission calculations

---

## 🧪 **TESTING CHECKLIST**

### **Test 1: Commission Earning**
- [ ] User A refers User B
- [ ] User B purchases package
- [ ] Commission created in Commission table
- [ ] Wallet auto-credited with same amount
- [ ] Wallet transaction created
- [ ] Wallet balance increased

### **Test 2: Payout Request**
- [ ] User has wallet balance >= ₹500
- [ ] User has bank details
- [ ] Request payout succeeds
- [ ] Wallet balance decreased to 0
- [ ] Payout created with status "pending"
- [ ] Wallet transaction created (DEBIT)

### **Test 3: Payout Approval**
- [ ] Admin sees pending payout
- [ ] Admin approves payout
- [ ] Payout status changes to "processing"
- [ ] Admin completes payout
- [ ] Payout status changes to "completed"

### **Test 4: Multiple Commissions**
- [ ] Earn 3 commissions (₹1000, ₹2000, ₹3000)
- [ ] Wallet balance = ₹6000
- [ ] Request payout
- [ ] Wallet balance = ₹0
- [ ] Payout amount = ₹6000

### **Test 5: Rejected Payout**
- [ ] Request payout (wallet debited)
- [ ] Admin rejects payout
- [ ] Wallet balance restored (credit transaction)
- [ ] Payout status = "failed"

---

## 📝 **MIGRATION NOTES**

**No database migration needed!**

The Wallet and Commission tables already exist. We're just changing the logic:
- Commissions continue to be created (for history)
- Commissions continue to auto-credit wallet (already implemented)
- Payouts now read from wallet instead of commissions

**Existing data:**
- Users with existing commissions: Already in wallet
- Users with pending payouts: Will complete normally
- No data loss or corruption

---

## 🚀 **FUTURE ENHANCEMENTS**

1. **Wallet-Based Course Purchases**
   - Use wallet balance to buy individual courses
   - Debit wallet, credit course access

2. **Referral Bonuses**
   - Admin can credit bonus to wallet
   - Special promotions, contests

3. **Partial Payouts**
   - Allow users to withdraw partial amounts
   - Keep some balance in wallet

4. **Wallet Top-Up**
   - Users can add money to wallet
   - Use for purchases, courses

5. **Wallet-to-Wallet Transfer**
   - Send money to other users
   - Gift courses, bonuses

---

## 📞 **SUPPORT**

For questions about the Wallet/Payout system:
1. Check this documentation
2. Review WalletTransaction history for audit trail
3. Check Commission table for earning history
4. Contact admin for payout status

---

**Last Updated:** January 15, 2025  
**Version:** 2.0 (Wallet-based architecture)  
**Status:** ✅ Production Ready

