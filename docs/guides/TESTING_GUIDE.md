# 🧪 Course Enrollment Bug Fix - Testing Guide

**Date:** October 21, 2025  
**Purpose:** Verify the course enrollment bug fix works correctly

---

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd backend
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
uvicorn app.main:app --reload --port 8000
```

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## ✅ Test Scenarios

### **Test 1: Admin Creates Course - Should NOT Auto-Enroll Users**

**Steps:**
1. Login as admin (email: admin@example.com, password: admin123)
2. Navigate to Admin Panel → Courses
3. Click "Create New Course"
4. Fill in course details:
   - Title: "Test Platinum Course"
   - Description: "This is a test course"
   - Package: Select "Platinum"
   - Individual Price: 999
   - Check "Available for Individual Purchase"
   - Check "Published"
5. Click "Create Course"
6. Logout from admin account
7. Login as regular user (create new user if needed)
8. Navigate to "My Courses" (sidebar → Learning → My Courses)

**Expected Result:**
- ✅ "My Courses" page should show EMPTY STATE
- ✅ Message: "You haven't enrolled in any courses yet"
- ✅ Action buttons: "View Packages" and "Browse All Courses"
- ❌ The new "Test Platinum Course" should NOT appear

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### **Test 2: Browse Courses - Should Show ALL Courses**

**Steps:**
1. Continue from Test 1 (logged in as regular user)
2. Click "Browse All Courses" button (or sidebar → Learning → Browse Courses)

**Expected Result:**
- ✅ "Browse All Courses" page loads
- ✅ Shows ALL courses including "Test Platinum Course"
- ✅ "Test Platinum Course" has a LOCK icon overlay
- ✅ Package badge shows "Platinum"
- ✅ Button says "Unlock Course"

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### **Test 3: User with Silver Package - Access Control**

**Steps:**
1. Login as user with Silver package (or purchase Silver package)
2. Navigate to "My Courses"
3. Navigate to "Browse Courses"

**Expected Result:**

**My Courses:**
- ✅ Shows ONLY Silver-tier courses
- ❌ Does NOT show Gold or Platinum courses

**Browse Courses:**
- ✅ Shows ALL courses (Silver, Gold, Platinum)
- ✅ Silver courses are UNLOCKED (no lock icon)
- ✅ Gold courses are LOCKED (lock icon + "Unlock Course" button)
- ✅ Platinum courses are LOCKED (lock icon + "Unlock Course" button)

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### **Test 4: Individual Course Purchase**

**Steps:**
1. Login as user with Silver package
2. Navigate to "Browse Courses"
3. Find a Gold-tier course
4. Click "Unlock Course" → Should redirect to packages page
5. Navigate to the specific course page: `/courses/{course_id}`
6. Click "Purchase This Course" (if available)
7. Complete payment (use test Razorpay credentials)
8. After successful payment, navigate to "My Courses"

**Expected Result:**
- ✅ The purchased Gold course NOW appears in "My Courses"
- ✅ Course shows "individual" access type
- ✅ User can access course content
- ✅ Other Gold courses remain locked

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### **Test 5: Package Upgrade - Dynamic Access**

**Steps:**
1. Login as user with Silver package
2. Navigate to "My Courses" → Note which courses are visible
3. Navigate to Packages page
4. Upgrade to Gold package
5. Complete payment
6. Navigate back to "My Courses"

**Expected Result:**
- ✅ "My Courses" now shows Silver + Gold courses
- ✅ Platinum courses still NOT visible in "My Courses"
- ✅ In "Browse Courses", Silver and Gold are unlocked, Platinum locked

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### **Test 6: Empty State Messages**

**Steps:**
1. Create a new user account (no package, no purchases)
2. Navigate to "My Courses"

**Expected Result:**
- ✅ Shows empty state with icon 🎓
- ✅ Heading: "No Enrolled Courses"
- ✅ Message: "You haven't enrolled in any courses yet. Purchase a package or buy individual courses to get started!"
- ✅ Two buttons visible:
  - "View Packages" → Links to /packages
  - "Browse All Courses" → Links to /courses/browse

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### **Test 7: Navigation Between Pages**

**Steps:**
1. Login as any user
2. Click sidebar → Learning → My Courses
3. Verify URL is `/courses`
4. Verify page title is "My Courses"
5. Click sidebar → Learning → Browse Courses
6. Verify URL is `/courses/browse`
7. Verify page title is "Browse All Courses"

**Expected Result:**
- ✅ Navigation works smoothly
- ✅ URLs are correct
- ✅ Page titles match navigation labels
- ✅ No console errors

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### **Test 8: Search and Filter (Browse Page)**

**Steps:**
1. Navigate to "Browse Courses"
2. Type in search box: "Test"
3. Verify courses filter by title/description
4. Clear search
5. Use package filter dropdown → Select "Silver"
6. Verify only Silver courses show
7. Select "All Packages"
8. Verify all courses show again

**Expected Result:**
- ✅ Search filters courses correctly
- ✅ Package filter works correctly
- ✅ Filters can be combined
- ✅ Clearing filters shows all courses

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### **Test 9: Admin Bypass - Admin Sees All Courses**

**Steps:**
1. Login as admin
2. Navigate to "My Courses"

**Expected Result:**
- ✅ Admin sees ALL courses in "My Courses" (admin bypass)
- ✅ All courses are unlocked for admin
- ✅ Admin can access any course content

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

### **Test 10: Course Progress Display**

**Steps:**
1. Login as user with access to at least one course
2. Start watching a video in a course (watch at least 50%)
3. Navigate back to "My Courses"
4. Check if progress is displayed

**Expected Result:**
- ✅ Course card shows progress percentage (e.g., "25% complete")
- ✅ Progress is accurate
- ✅ Progress persists across page reloads

**Actual Result:**
- [ ] Pass
- [ ] Fail (describe issue): _______________

---

## 🔧 API Endpoint Testing

### Test Endpoints Directly

**1. Get My Courses (Only Enrolled)**
```bash
curl -X GET "http://localhost:8000/api/courses/my-courses" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** Returns only courses user has access to

**2. Get All Courses with Access (For Browsing)**
```bash
curl -X GET "http://localhost:8000/api/courses/all-with-access" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** Returns all courses with `has_access` and `is_locked` flags

---

## 🐛 Common Issues to Check

### Issue 1: Courses Not Loading
- Check browser console for errors
- Verify backend is running on port 8000
- Check network tab for failed API calls

### Issue 2: All Courses Showing in "My Courses"
- This was the original bug - should be FIXED
- If still happening, check:
  - Is `/api/courses/my-courses` endpoint being called?
  - Check Network tab → XHR requests
  - Verify response only includes accessible courses

### Issue 3: Lock Icons Not Showing
- Check "Browse Courses" page
- Verify `is_locked` flag in API response
- Check browser console for rendering errors

### Issue 4: Package Filter Not Working
- Check if select component is rendering
- Verify onChange handler is firing
- Check filtered courses array in React DevTools

---

## 📊 Test Results Summary

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Admin Creates Course | ⬜ | |
| 2 | Browse Courses | ⬜ | |
| 3 | Silver Package Access | ⬜ | |
| 4 | Individual Purchase | ⬜ | |
| 5 | Package Upgrade | ⬜ | |
| 6 | Empty State | ⬜ | |
| 7 | Navigation | ⬜ | |
| 8 | Search & Filter | ⬜ | |
| 9 | Admin Bypass | ⬜ | |
| 10 | Course Progress | ⬜ | |

**Legend:**
- ⬜ Not Tested
- ✅ Pass
- ❌ Fail

---

## 🎯 Success Criteria

**All tests must pass for the bug fix to be considered complete:**

- ✅ Admin-created courses do NOT auto-enroll users
- ✅ "My Courses" shows ONLY enrolled/purchased courses
- ✅ "Browse Courses" shows ALL courses with lock indicators
- ✅ Package tier access control works correctly
- ✅ Individual course purchases grant access
- ✅ Package upgrades immediately grant access to new courses
- ✅ Empty states display correctly
- ✅ Navigation works smoothly
- ✅ Search and filters work correctly
- ✅ Admin bypass works correctly

---

## 📝 Notes

**Test Environment:**
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Database: SQLite (development)

**Test Accounts:**
- Admin: admin@example.com / admin123
- Regular User: Create new account or use existing

**Test Data:**
- Create at least 3 courses (Silver, Gold, Platinum)
- Create at least 1 user with each package tier
- Create at least 1 user with no package

---

**Generated:** October 21, 2025  
**Status:** Ready for Testing

