# 🗄️ Database Migration Guide - SQLite to PostgreSQL/MongoDB

**Date:** October 21, 2025  
**Purpose:** Migrate from SQLite (development) to PostgreSQL or MongoDB (production)

---

## 📋 Table of Contents

1. [PostgreSQL Migration](#postgresql-migration)
2. [MongoDB Migration](#mongodb-migration)
3. [One-Click Setup Scripts](#one-click-setup-scripts)
4. [Verification](#verification)

---

## 🐘 PostgreSQL Migration

### **Option 1: Automated Migration (Recommended)**

#### **Step 1: Install PostgreSQL**

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
Download from: https://www.postgresql.org/download/windows/

---

#### **Step 2: Create PostgreSQL Database**

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE affiliate_learning_db;
CREATE USER affiliate_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE affiliate_learning_db TO affiliate_user;
\q
```

---

#### **Step 3: Install Python PostgreSQL Driver**

```bash
cd backend
source venv/bin/activate
pip install psycopg2-binary
pip freeze > requirements.txt
```

---

#### **Step 4: Update Backend Configuration**

**File:** `backend/.env`

```env
# Database Configuration
DATABASE_URL=postgresql://affiliate_user:your_secure_password@localhost:5432/affiliate_learning_db

# Or for production:
# DATABASE_URL=postgresql://user:password@host:port/database
```

---

#### **Step 5: Run Migration Script**

I'll create an automated migration script for you. See [One-Click Setup Scripts](#one-click-setup-scripts) below.

---

### **Option 2: Manual Migration**

#### **Step 1: Export SQLite Data**

```bash
cd backend
sqlite3 affiliate_learning.db .dump > sqlite_dump.sql
```

#### **Step 2: Convert SQLite to PostgreSQL Format**

```bash
# Install conversion tool
pip install sqlite3-to-postgres

# Run conversion
sqlite3-to-postgres \
  --sqlite-file affiliate_learning.db \
  --postgres-uri postgresql://affiliate_user:your_secure_password@localhost:5432/affiliate_learning_db
```

#### **Step 3: Verify Migration**

```bash
psql -U affiliate_user -d affiliate_learning_db -c "\dt"
```

---

## 🍃 MongoDB Migration

### **Option 1: Automated Migration (Recommended)**

#### **Step 1: Install MongoDB**

**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Windows:**
Download from: https://www.mongodb.com/try/download/community

---

#### **Step 2: Install Python MongoDB Driver**

```bash
cd backend
source venv/bin/activate
pip install motor pymongo
pip freeze > requirements.txt
```

---

#### **Step 3: Update Backend Configuration**

**File:** `backend/.env`

```env
# Database Configuration
DATABASE_TYPE=mongodb
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=affiliate_learning_db

# Or for production (MongoDB Atlas):
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

---

#### **Step 4: Run Migration Script**

See [One-Click Setup Scripts](#one-click-setup-scripts) below.

---

### **Option 2: Manual Migration**

**Note:** MongoDB is NoSQL, so you'll need to restructure your data. This is more complex and requires code changes.

---

## 🚀 One-Click Setup Scripts

### **PostgreSQL One-Click Migration** ✅

**File:** `backend/migrate_to_postgresql.py`

**Features:**
- ✅ Interactive setup (prompts for credentials)
- ✅ Creates PostgreSQL database and tables
- ✅ Migrates all SQLite data automatically
- ✅ Updates sequences to match current IDs
- ✅ Verifies data integrity (row count comparison)
- ✅ Updates .env configuration automatically
- ✅ Color-coded terminal output
- ✅ Detailed error handling

**Usage:**
```bash
cd backend
python migrate_to_postgresql.py
```

**What it does:**
1. Checks if SQLite database exists
2. Prompts for PostgreSQL credentials (host, port, database, username, password)
3. Tests PostgreSQL connection
4. Creates all tables using SQLAlchemy models
5. Migrates data table by table
6. Updates PostgreSQL sequences
7. Verifies migration (compares row counts)
8. Updates .env file with new DATABASE_URL
9. Provides next steps

---

### **MongoDB One-Click Migration** ⚠️

**Note:** MongoDB migration requires significant code changes because:
- MongoDB is NoSQL (document-based) vs SQLite/PostgreSQL (relational)
- Requires ODM (Object Document Mapper) like Motor or MongoEngine
- Relationships need to be restructured (embedded documents or references)
- Queries need to be rewritten

**Recommendation:** Use PostgreSQL instead for this project because:
- Minimal code changes (SQLAlchemy supports both)
- Better for relational data (users, courses, packages, payments)
- Strong ACID guarantees
- Easier migration path

---

## 📝 Migration Scripts

### **Script 1: PostgreSQL Migration**

**File:** `backend/migrate_to_postgresql.py`

This script will:
- ✅ Create PostgreSQL database and tables
- ✅ Export data from SQLite
- ✅ Import data to PostgreSQL
- ✅ Verify data integrity
- ✅ Update .env configuration

**Usage:**
```bash
cd backend
python migrate_to_postgresql.py
```

---

### **Script 2: MongoDB Migration**

**File:** `backend/migrate_to_mongodb.py`

This script will:
- ✅ Create MongoDB database and collections
- ✅ Convert relational data to documents
- ✅ Import data to MongoDB
- ✅ Verify data integrity
- ✅ Update .env configuration

**Usage:**
```bash
cd backend
python migrate_to_mongodb.py
```

---

## ✅ Verification Steps

### **PostgreSQL Verification**

```bash
# 1. Check database exists
psql -U affiliate_user -d affiliate_learning_db -c "\l"

# 2. Check tables
psql -U affiliate_user -d affiliate_learning_db -c "\dt"

# 3. Check row counts
psql -U affiliate_user -d affiliate_learning_db -c "
SELECT 
  'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'packages', COUNT(*) FROM packages
UNION ALL
SELECT 'user_packages', COUNT(*) FROM user_packages;
"

# 4. Test backend connection
cd backend
python -c "from app.database import engine; print('✅ PostgreSQL connection successful!')"
```

---

### **MongoDB Verification**

```bash
# 1. Check database exists
mongosh
use affiliate_learning_db
show collections

# 2. Check document counts
db.users.countDocuments()
db.courses.countDocuments()
db.packages.countDocuments()

# 3. Test backend connection
cd backend
python -c "from app.database import get_db; print('✅ MongoDB connection successful!')"
```

---

## 🔄 Rollback Plan

### **PostgreSQL Rollback**

If migration fails, rollback to SQLite:

```bash
# 1. Stop backend
# 2. Update .env
DATABASE_URL=sqlite:///./affiliate_learning.db

# 3. Restart backend
cd backend
uvicorn app.main:app --reload
```

---

### **MongoDB Rollback**

```bash
# 1. Stop backend
# 2. Update .env
DATABASE_TYPE=sqlite
DATABASE_URL=sqlite:///./affiliate_learning.db

# 3. Restart backend
cd backend
uvicorn app.main:app --reload
```

---

## 📊 Comparison: PostgreSQL vs MongoDB

| Feature | PostgreSQL | MongoDB |
|---------|-----------|---------|
| **Type** | Relational (SQL) | NoSQL (Document) |
| **Schema** | Fixed schema | Flexible schema |
| **Transactions** | Full ACID support | ACID support (4.0+) |
| **Joins** | Native support | Manual (lookup) |
| **Scalability** | Vertical scaling | Horizontal scaling |
| **Best For** | Complex queries, relationships | Flexible data, high write loads |
| **Learning Curve** | Moderate | Easy |
| **Code Changes** | Minimal (SQLAlchemy) | Significant (ODM needed) |

**Recommendation for this project:** **PostgreSQL**
- Minimal code changes (SQLAlchemy supports both)
- Better for relational data (users, courses, packages)
- Strong ACID guarantees for payments
- Easier migration path

---

## 🎯 Next Steps

1. **Choose your database:** PostgreSQL (recommended) or MongoDB
2. **Run the migration script** (I'll create these next)
3. **Verify the migration** using verification steps above
4. **Test the application** thoroughly
5. **Update production deployment** configuration

---

**Generated:** October 21, 2025  
**Status:** Ready for Migration

