# Quick Start Testing Guide

## System Status

✅ **Backend**: Running on `http://localhost:8000`  
✅ **Frontend**: Running on `http://localhost:3001`  
✅ **Database**: SQLite operational  
✅ **Admin User**: naveenvide@gmail.com / admin123

---

## Quick Test Checklist

### 1. Frontend Access
```
URL: http://localhost:3001
Expected: Landing page loads without errors
Status: ✅ Ready
```

### 2. Admin Login
```
Email: naveenvide@gmail.com
Password: admin123
Expected: Redirects to dashboard
Status: ✅ Ready
```

### 3. Check Wallet (Sign-up Bonus)
```
After login, navigate to: /wallet
Expected: Shows ₹10 sign-up bonus
Status: ✅ Ready
```

### 4. Purchase Studio Credits
```
Endpoint: POST /api/studio/credits/purchase?amount=10
Expected: Converts ₹50 from wallet to 10 credits
Status: ✅ Ready
```

### 5. Check Studio Credits
```
Endpoint: GET /api/studio/credits/balance
Expected: Shows updated credit balance
Status: ✅ Ready
```

### 6. Create Payment Order
```
Endpoint: POST /api/payments/create-order
Body: {"package_id": 1}
Expected: Returns order_id from mock Razorpay
Status: ✅ Ready
```

### 7. Verify Payment
```
Endpoint: POST /api/payments/verify
Body: {
  "razorpay_order_id": "{order_id}",
  "razorpay_payment_id": "pay_mock_test",
  "razorpay_signature": "mock_signature"
}
Expected: Payment marked as success
Status: ✅ Ready
```

---

## API Documentation

### Authentication
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "naveenvide@gmail.com", "password": "admin123"}'

# Response includes: access_token
```

### Wallet Operations
```bash
# Get wallet balance
curl -X GET http://localhost:8000/api/wallet/ \
  -H "Authorization: Bearer {token}"

# Get wallet with transactions
curl -X GET http://localhost:8000/api/wallet/with-transactions \
  -H "Authorization: Bearer {token}"
```

### Studio Credits
```bash
# Get credit balance
curl -X GET http://localhost:8000/api/studio/credits/balance \
  -H "Authorization: Bearer {token}"

# Purchase credits (10 credits for ₹50)
curl -X POST "http://localhost:8000/api/studio/credits/purchase?amount=10" \
  -H "Authorization: Bearer {token}"
```

### Payments
```bash
# Create payment order
curl -X POST http://localhost:8000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"package_id": 1}'

# Verify payment
curl -X POST http://localhost:8000/api/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "signature_xxx"
  }'
```

---

## Swagger UI

Access API documentation at: `http://localhost:8000/docs`

All endpoints are documented with:
- Request/response schemas
- Authentication requirements
- Example payloads
- Error codes

---

## Common Issues & Solutions

### Issue: 402 Payment Required on Credits Purchase
**Cause**: Wallet balance insufficient  
**Solution**: 
1. Check wallet balance: `GET /api/wallet/`
2. Ensure sign-up bonus was credited (₹10)
3. Verify wallet balance > (amount * 5)

### Issue: 401 Unauthorized
**Cause**: Invalid or missing token  
**Solution**:
1. Login again to get fresh token
2. Include token in Authorization header
3. Format: `Authorization: Bearer {token}`

### Issue: 422 Unprocessable Entity
**Cause**: Invalid request body  
**Solution**:
1. Check request schema in Swagger UI
2. Verify all required fields present
3. Validate data types

---

## Testing Workflow

### Step 1: Register New User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!",
    "full_name": "Test User",
    "phone": "+91 9876543210"
  }'
```

### Step 2: Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!"
  }'
```

### Step 3: Check Wallet (Should have ₹10)
```bash
curl -X GET http://localhost:8000/api/wallet/ \
  -H "Authorization: Bearer {token}"
```

### Step 4: Purchase Credits
```bash
curl -X POST "http://localhost:8000/api/studio/credits/purchase?amount=2" \
  -H "Authorization: Bearer {token}"
```

### Step 5: Verify Credits
```bash
curl -X GET http://localhost:8000/api/studio/credits/balance \
  -H "Authorization: Bearer {token}"
```

---

## Next Steps

1. **Test Image Generation** (requires Replicate API key)
   - Add `IMAGEGEN_API_KEY` to `.env`
   - Restart backend
   - Test `/api/studio/generate` endpoint

2. **Seed Test Data**
   - Create sample courses
   - Create test users with various packages
   - Populate community feed

3. **Run E2E Tests**
   - Execute Playwright tests
   - Test critical user journeys
   - Verify payment flows

---

## Support

For issues or questions:
1. Check Swagger UI: `http://localhost:8000/docs`
2. Review backend logs: Terminal 97
3. Check frontend console: Browser DevTools
4. Review error responses for detailed messages

---

**Last Updated**: 2025-10-19  
**Status**: ✅ All systems operational

