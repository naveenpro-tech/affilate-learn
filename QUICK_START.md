# 🚀 Quick Start Guide

**Last Updated:** October 21, 2025

---

## 📋 What Was Fixed

✅ **Build Error** - Missing select component (FIXED)  
✅ **Course Enrollment Bug** - Admin courses auto-enrolling users (FIXED)  
✅ **Testing Guide** - Comprehensive manual testing guide (CREATED)  
✅ **Database Migration** - One-click PostgreSQL migration (READY)

---

## 🧪 Test the Bug Fix (5 minutes)

### **Quick Test:**

```bash
# Terminal 1: Start Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2: Start Frontend
cd frontend
npm run dev

# Terminal 3: Open browser
# Visit: http://localhost:3000
```

### **What to Test:**

1. **Login as admin** → Create a course → Logout
2. **Login as regular user** → Check "My Courses" → Should be EMPTY
3. **Click "Browse Courses"** → Should see ALL courses (with locks)
4. **Purchase a package** → Check "My Courses" → Should see enrolled courses

**Expected:** ✅ "My Courses" shows ONLY enrolled courses  
**Expected:** ✅ "Browse Courses" shows ALL courses

---

## 🗄️ Migrate to PostgreSQL (10 minutes)

### **One-Click Migration:**

```bash
# Step 1: Install PostgreSQL (if not installed)
sudo apt install postgresql postgresql-contrib  # Ubuntu
# or
brew install postgresql@15  # macOS

# Step 2: Start PostgreSQL
sudo systemctl start postgresql  # Ubuntu
# or
brew services start postgresql@15  # macOS

# Step 3: Run migration script
cd backend
python migrate_to_postgresql.py

# Step 4: Follow prompts
# - Host: localhost
# - Port: 5432
# - Database: affiliate_learning_db
# - Username: affiliate_user
# - Password: [your password]

# Step 5: Restart backend
uvicorn app.main:app --reload --port 8000
```

**That's it!** The script handles everything automatically.

---

## 📚 Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| **Testing Guide** | Manual testing instructions | `docs/guides/TESTING_GUIDE.md` |
| **Migration Guide** | PostgreSQL migration guide | `docs/guides/DATABASE_MIGRATION_GUIDE.md` |
| **Bug Fix Details** | Detailed bug analysis | `docs/guides/COURSE_ENROLLMENT_BUG_FIX.md` |
| **Complete Summary** | Summary of all work | `docs/completed/COMPLETE_FIX_SUMMARY.md` |

---

## 🔧 Troubleshooting

### **Frontend won't build:**
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

### **Backend won't start:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### **PostgreSQL migration fails:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -U postgres -c "\l"

# Re-run migration
cd backend
python migrate_to_postgresql.py
```

---

## ✅ Success Checklist

- [ ] Frontend builds successfully
- [ ] Backend starts without errors
- [ ] "My Courses" shows only enrolled courses
- [ ] "Browse Courses" shows all courses
- [ ] Navigation works correctly
- [ ] PostgreSQL migration completed (optional)

---

## 🎯 Next Steps

**Immediate:**
1. Test the bug fix (follow TESTING_GUIDE.md)
2. Verify all features work correctly

**Production:**
1. Run PostgreSQL migration
2. Deploy to production
3. Backup database

---

**Need Help?** Check the detailed guides in `docs/guides/`

**Status:** ✅ Ready for Testing & Production

