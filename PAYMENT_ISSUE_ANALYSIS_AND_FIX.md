# Payment Issue - Analysis & Fix Report

**Date**: October 19, 2025  
**Issue**: Payment creation fails with "Authentication failed" error  
**Status**: 🔍 ROOT CAUSE IDENTIFIED

---

## Issue Summary

When users try to create a payment order, the backend returns:
```
HTTP 500 Internal Server Error
{"detail":"Failed to create payment order: Authentication failed"}
```

---

## Root Cause Analysis

### Error Details
- **Error Type**: `razorpay.errors.BadRequestError`
- **Error Message**: "Authentication failed"
- **Location**: `backend/app/services/razorpay_service.py`, line 41
- **Trigger**: When calling `self.client.order.create(data=order_data)`

### Why It's Happening

The Razorpay SDK is attempting to authenticate with the provided test keys:
```
RAZORPAY_KEY_ID=rzp_test_RBrPafmy42Nmd7
RAZORPAY_KEY_SECRET=5TVK1iA2npjluW6vDb0EXIn1
```

However, the Razorpay API is rejecting these credentials with "Authentication failed", which means:

1. **Invalid Test Keys**: The keys in the README might be outdated, incorrect, or belong to a different Razorpay account
2. **Network Issue**: The backend cannot reach Razorpay API servers
3. **Key Format Issue**: The keys might not be in the correct format for the Razorpay SDK

---

## Solution Options

### Option 1: Use Real Razorpay Test Keys (RECOMMENDED)
1. Go to https://dashboard.razorpay.com
2. Login to your Razorpay account
3. Navigate to Settings → API Keys
4. Copy your Test Mode keys
5. Update `.env` file:
   ```
   RAZORPAY_KEY_ID=<your_test_key_id>
   RAZORPAY_KEY_SECRET=<your_test_key_secret>
   ```
6. Restart backend

### Option 2: Create Mock Razorpay Service (FOR DEVELOPMENT)
Create a mock service that simulates Razorpay responses without requiring real API keys.

**File**: `backend/app/services/razorpay_mock_service.py`

```python
import uuid
from datetime import datetime

class MockRazorpayService:
    """Mock Razorpay service for development/testing"""
    
    def create_order(self, amount: float, currency: str = "INR", receipt: str = None) -> dict:
        """Create a mock Razorpay order"""
        return {
            "id": f"order_{uuid.uuid4().hex[:12]}",
            "entity": "order",
            "amount": int(amount * 100),
            "amount_paid": 0,
            "amount_due": int(amount * 100),
            "currency": currency,
            "receipt": receipt or f"receipt_{uuid.uuid4().hex[:8]}",
            "offer_id": None,
            "status": "created",
            "attempts": 0,
            "notes": {},
            "created_at": int(datetime.utcnow().timestamp())
        }
    
    def verify_payment_signature(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
        """Mock signature verification - always returns True for testing"""
        return True
    
    def get_payment_details(self, payment_id: str) -> dict:
        """Mock payment details"""
        return {
            "id": payment_id,
            "entity": "payment",
            "amount": 295000,
            "currency": "INR",
            "status": "captured",
            "method": "card",
            "description": "Test payment",
            "amount_refunded": 0,
            "refund_status": None,
            "captured": True,
            "email": "test@example.com",
            "contact": "+919876543210",
            "fee": 0,
            "tax": 0,
            "error_code": None,
            "error_description": None,
            "error_source": None,
            "error_reason": None,
            "error_step": None,
            "error_field": None,
            "acquirer_data": {"auth_code": None},
            "vpa": None,
            "notes": {},
            "fee_details": None,
            "wallet": None,
            "created_at": int(datetime.utcnow().timestamp())
        }
    
    def get_order_details(self, order_id: str) -> dict:
        """Mock order details"""
        return {
            "id": order_id,
            "entity": "order",
            "amount": 295000,
            "amount_paid": 295000,
            "amount_due": 0,
            "currency": "INR",
            "receipt": f"receipt_{order_id[:8]}",
            "offer_id": None,
            "status": "paid",
            "attempts": 1,
            "notes": {},
            "created_at": int(datetime.utcnow().timestamp())
        }
```

Then update `backend/app/core/config.py` to use mock service in development:

```python
# In config.py
USE_RAZORPAY_MOCK = os.getenv("USE_RAZORPAY_MOCK", "false").lower() == "true"
```

And update `backend/app/services/razorpay_service.py`:

```python
from app.core.config import settings

if settings.USE_RAZORPAY_MOCK:
    from app.services.razorpay_mock_service import MockRazorpayService
    razorpay_service = MockRazorpayService()
else:
    razorpay_service = RazorpayService()
```

---

## Recommended Fix for Your Setup

Since you're in development with SQLite, I recommend **Option 2 (Mock Service)** because:

1. ✅ No need for real Razorpay credentials
2. ✅ Faster testing (no network calls)
3. ✅ Predictable responses
4. ✅ Can test payment flow end-to-end
5. ✅ Easy to switch to real keys later

---

## Files Affected

- `backend/.env` - Razorpay keys configuration
- `backend/app/services/razorpay_service.py` - Added detailed logging
- `backend/app/core/config.py` - Add mock flag
- `backend/app/services/razorpay_mock_service.py` - NEW (if using mock)

---

## Testing After Fix

### Test 1: Create Payment Order
```bash
curl -X POST http://localhost:8000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"package_id": 1}'
```

**Expected Response** (HTTP 200):
```json
{
  "order_id": "order_abc123...",
  "amount": 2950,
  "currency": "INR",
  "razorpay_key_id": "rzp_test_..."
}
```

### Test 2: Verify Payment
```bash
curl -X POST http://localhost:8000/api/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "razorpay_order_id": "order_abc123...",
    "razorpay_payment_id": "pay_xyz789...",
    "razorpay_signature": "signature..."
  }'
```

---

## Next Steps

1. Choose Option 1 (Real Keys) or Option 2 (Mock Service)
2. Implement the fix
3. Restart backend
4. Test payment creation
5. Test payment verification
6. Verify wallet transaction is recorded

---

**Status**: Ready for implementation  
**Priority**: HIGH (Blocks payment flow testing)  
**Estimated Fix Time**: 15-30 minutes

