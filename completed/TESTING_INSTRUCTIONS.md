# 🧪 Complete Testing Instructions

## Prerequisites

1. **Backend running:** `cd backend && .\venv\Scripts\activate && uvicorn app.main:app --reload`
2. **Frontend running:** `cd frontend && npm run dev`
3. **Playwright installed:** `pip install playwright && playwright install chromium`

---

## 🤖 Automated Testing with Playwright

### Run the Automated Test Script

```bash
python playwright_test_flow.py
```

### What the Script Does:

1. **Test 1: User A Login**
   - Logs in as `naveenvide@gmail.com`
   - Captures referral code
   - Takes screenshot of dashboard

2. **Test 2: User B Registration**
   - Registers new user with User A's referral code
   - Verifies referral code is pre-filled
   - Takes screenshot after registration

3. **Test 3: Verify Referral Appears**
   - Logs back in as User A
   - Checks referrals list
   - Verifies User B appears with "No Package" status

4. **Test 4: User B Purchases Package**
   - Logs in as User B
   - Navigates to packages page
   - Clicks "Buy Now" for Silver package
   - **⚠️ MANUAL STEP:** Complete Razorpay payment (UPI: test@paytm)
   - Verifies redirect to dashboard
   - Checks package status

5. **Test 5: Verify Commission**
   - Logs back in as User A
   - Checks earnings on dashboard
   - Views earnings page
   - Views updated referrals list

### Screenshots Generated:
- `01_user_a_dashboard.png`
- `02_user_a_referral_code.png`
- `03_user_b_registration.png`
- `04_user_b_dashboard.png`
- `05_user_a_referrals_list.png`
- `06_packages_page.png`
- `07_razorpay_modal.png`
- `08_user_b_after_purchase.png`
- `09_user_a_dashboard_after_commission.png`
- `10_user_a_earnings_page.png`
- `11_user_a_referrals_after_purchase.png`

---

## 🔍 Manual Database Verification

After running the automated test, verify database records:

### 1. Check User Packages

```bash
cd backend
.\venv\Scripts\activate
python -c "from app.core.database import SessionLocal; from app.models.user_package import UserPackage; from app.models.user import User; from app.models.package import Package; db = SessionLocal(); packages = db.query(UserPackage).all(); print(f'Total user packages: {len(packages)}'); [print(f'User: {db.query(User).filter(User.id == p.user_id).first().email}, Package: {db.query(Package).filter(Package.id == p.package_id).first().name}, Status: {p.status}') for p in packages]; db.close()"
```

**Expected Output:**
```
Total user packages: 1
User: testuser<timestamp>@example.com, Package: Silver, Status: active
```

### 2. Check Referrals

```bash
python -c "from app.core.database import SessionLocal; from app.models.referral import Referral; from app.models.user import User; from app.models.package import Package; db = SessionLocal(); referrals = db.query(Referral).all(); print(f'Total referrals: {len(referrals)}'); [print(f'Referrer: {db.query(User).filter(User.id == r.referrer_id).first().email}, Referee: {db.query(User).filter(User.id == r.referee_id).first().email}, Level: {r.level}, Package: {db.query(Package).filter(Package.id == r.package_id).first().name}') for r in referrals]; db.close()"
```

**Expected Output:**
```
Total referrals: 1
Referrer: naveenvide@gmail.com, Referee: testuser<timestamp>@example.com, Level: 1, Package: Silver
```

### 3. Check Commissions

```bash
python -c "from app.core.database import SessionLocal; from app.models.commission import Commission; from app.models.user import User; db = SessionLocal(); commissions = db.query(Commission).all(); print(f'Total commissions: {len(commissions)}'); [print(f'User: {db.query(User).filter(User.id == c.user_id).first().email}, Amount: ₹{c.amount}, Type: {c.commission_type}, Status: {c.status}') for c in commissions]; db.close()"
```

**Expected Output:**
```
Total commissions: 1
User: naveenvide@gmail.com, Amount: ₹1875.0, Type: level1, Status: pending
```

**Note:** The commission amount depends on User A's package tier. If User A has no package, no commission will be created.

### 4. Check Courses

```bash
python -c "from app.core.database import SessionLocal; from app.models.course import Course; from app.models.package import Package; db = SessionLocal(); courses = db.query(Course).all(); print(f'Total courses: {len(courses)}'); silver = db.query(Package).filter(Package.name == 'Silver').first(); gold = db.query(Package).filter(Package.name == 'Gold').first(); platinum = db.query(Package).filter(Package.name == 'Platinum').first(); print(f'Silver courses: {db.query(Course).filter(Course.package_id == silver.id).count()}'); print(f'Gold courses: {db.query(Course).filter(Course.package_id == gold.id).count()}'); print(f'Platinum courses: {db.query(Course).filter(Course.package_id == platinum.id).count()}'); db.close()"
```

**Expected Output:**
```
Total courses: 15
Silver courses: 5
Gold courses: 5
Platinum courses: 5
```

---

## 🎯 Manual Testing Scenarios

### Scenario 1: Test Referral Without Purchase

1. User A logs in and copies referral link
2. User B registers with referral link
3. **VERIFY:** User B appears in User A's referrals immediately
4. **VERIFY:** User B shows "No Package" status
5. **VERIFY:** No commission created yet

### Scenario 2: Test Commission Creation

**Prerequisites:** User A must have an active package

1. User A purchases a package (Silver/Gold/Platinum)
2. User B (referred by User A) purchases a package
3. **VERIFY:** Commission created for User A
4. **VERIFY:** Commission amount matches commission matrix
5. **VERIFY:** Commission status is "pending"

### Scenario 3: Test 2-Level Referral

1. User A purchases a package
2. User B (referred by User A) registers and purchases a package
3. User C (referred by User B) registers and purchases a package
4. **VERIFY:** User A gets Level 2 commission from User C's purchase
5. **VERIFY:** User B gets Level 1 commission from User C's purchase

### Scenario 4: Test Course Access

1. User with Silver package logs in
2. Navigate to Courses page
3. **VERIFY:** Can see 5 Silver courses
4. **VERIFY:** Cannot see Gold/Platinum courses
5. Repeat for Gold and Platinum packages

---

## 📊 Commission Matrix Reference

### User A (Referrer) has Silver Package:
- User B buys Silver: ₹1,875 (Level 1), ₹150 (Level 2)
- User B buys Gold: ₹2,375 (Level 1), ₹350 (Level 2)
- User B buys Platinum: ₹2,875 (Level 1), ₹400 (Level 2)

### User A (Referrer) has Gold Package:
- User B buys Silver: ₹1,875 (Level 1), ₹200 (Level 2)
- User B buys Gold: ₹3,375 (Level 1), ₹400 (Level 2)
- User B buys Platinum: ₹3,875 (Level 1), ₹600 (Level 2)

### User A (Referrer) has Platinum Package:
- User B buys Silver: ₹1,875 (Level 1), ₹200 (Level 2)
- User B buys Gold: ₹3,375 (Level 1), ₹500 (Level 2)
- User B buys Platinum: ₹5,625 (Level 1), ₹1,000 (Level 2)

---

## 🚨 Important Notes

### Razorpay Test Mode:
- Use test API keys in `.env`
- In payment modal, select "UPI payment"
- Enter any UPI ID (e.g., `test@paytm`)
- Press Enter - payment auto-accepted in test mode

### Commission Requirements:
- **Referrer MUST have an active package** to earn commissions
- If referrer has no package, no commission is created
- Commission status starts as "pending"

### Course Access Logic:
- Silver: Access to 5 Silver courses only
- Gold: Access to 5 Silver + 5 Gold courses (10 total)
- Platinum: Access to all 15 courses

---

## 🐛 Troubleshooting

### Issue: Referrals not showing
- **Check:** Is the backend API `/api/referrals/my-referrals` returning data?
- **Fix:** Verify the API was updated to query `users` table

### Issue: Commission not created
- **Check:** Does the referrer have an active package?
- **Fix:** Referrer must purchase a package first

### Issue: Package not showing after purchase
- **Check:** Is `fetchUser()` being called after payment?
- **Fix:** Verify the payment success handler refreshes user data

### Issue: Courses not showing
- **Check:** Were courses seeded successfully?
- **Fix:** Run `python seed_courses.py` in backend directory

---

## ✅ Success Criteria

After completing all tests, you should have:

1. ✅ User B appears in User A's referrals immediately after registration
2. ✅ User B's package status updates after purchase
3. ✅ Commission created for User A (if User A has a package)
4. ✅ Dashboard shows correct earnings and referral counts
5. ✅ Database has records in `user_packages`, `referrals`, `commissions`
6. ✅ Courses are accessible based on package tier
7. ✅ No console errors or React errors
8. ✅ Screenshots document the complete flow

---

## 📝 Next Steps After Testing

1. Create demo payout records
2. Test payout display in Earnings page
3. Implement course enrollment functionality
4. Test video playback
5. Create comprehensive demo data for presentation
6. Deploy to production

---

**All critical issues have been fixed and the system is ready for comprehensive testing!**

