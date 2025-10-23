# 🌐 Access Guide - Affiliate Learning Platform

**Status:** ✅ All services are running and accessible

---

## 🎯 Quick Access Links

### Frontend Application
| Service | URL | Status |
|---------|-----|--------|
| **Main App** | http://localhost:3000 | ✅ Running |
| **Register** | http://localhost:3000/register | ✅ Ready |
| **Login** | http://localhost:3000/login | ✅ Ready |
| **Dashboard** | http://localhost:3000/dashboard | ✅ Ready |

### Backend API
| Service | URL | Status |
|---------|-----|--------|
| **API Base** | http://localhost:8000 | ✅ Running |
| **Swagger UI** | http://localhost:8000/docs | ✅ Ready |
| **ReDoc** | http://localhost:8000/redoc | ✅ Ready |
| **OpenAPI JSON** | http://localhost:8000/openapi.json | ✅ Ready |

---

## 📱 Frontend URLs

### Public Pages
- **Home:** http://localhost:3000
- **Register:** http://localhost:3000/register
- **Login:** http://localhost:3000/login

### User Pages (After Login)
- **Dashboard:** http://localhost:3000/dashboard
- **Packages:** http://localhost:3000/packages
- **Courses:** http://localhost:3000/courses
- **Earnings:** http://localhost:3000/earnings
- **Profile:** http://localhost:3000/profile

### Admin Pages (Admin Only)
- **Admin Dashboard:** http://localhost:3000/admin
- **Admin Users:** http://localhost:3000/admin/users
- **Admin Payouts:** http://localhost:3000/admin/payouts
- **Admin Courses:** http://localhost:3000/admin/courses

---

## 🔌 Backend API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/auth/referral-stats
```

### Packages
```
GET    /api/packages/
GET    /api/packages/{id}
```

### Payments
```
POST   /api/payments/create-order
POST   /api/payments/verify
GET    /api/payments/my-payments
```

### Referrals
```
GET    /api/referrals/my-referrals
GET    /api/referrals/tree
GET    /api/referrals/stats
```

### Commissions
```
GET    /api/commissions/my-commissions
GET    /api/commissions/summary
```

### Courses
```
GET    /api/courses/
GET    /api/courses/{id}
POST   /api/courses/{id}/videos
```

### Payouts
```
GET    /api/payouts/my-payouts
GET    /api/payouts/my-pending-amount
POST   /api/payouts/request
```

### Admin
```
GET    /api/admin/dashboard
GET    /api/admin/users
PUT    /api/admin/users/{id}/toggle-active
POST   /api/payouts/batch-create
```

---

## 🧪 Testing the API

### Using Swagger UI
1. Go to http://localhost:8000/docs
2. Click on any endpoint
3. Click "Try it out"
4. Fill in parameters
5. Click "Execute"

### Using cURL

#### Register User
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "full_name": "Test User",
    "phone": "+919876543210"
  }'
```

#### Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

#### Get Current User
```bash
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get Packages
```bash
curl -X GET "http://localhost:8000/api/packages/"
```

---

## 🗄️ Database Access

### SQLite Database
- **Location:** `backend/app.db`
- **Type:** SQLite 3

### View Database with SQLite CLI
```bash
# Open database
sqlite3 backend/app.db

# List tables
.tables

# View users
SELECT * FROM users;

# View packages
SELECT * FROM packages;

# Exit
.quit
```

### View Database with GUI Tools
- **SQLite Browser:** https://sqlitebrowser.org/
- **DBeaver:** https://dbeaver.io/
- **VS Code Extension:** SQLite

---

## 🔐 Test Credentials

### Admin User
- **Email:** naveenvide@gmail.com
- **Status:** Admin account exists
- **Password:** Check backend logs or create new

### Test User (Create Your Own)
1. Go to http://localhost:3000/register
2. Fill in the form
3. Submit

---

## 📊 API Documentation

### Swagger UI (Interactive)
- **URL:** http://localhost:8000/docs
- **Features:**
  - Try out endpoints
  - See request/response examples
  - View schemas
  - Test authentication

### ReDoc (Beautiful Docs)
- **URL:** http://localhost:8000/redoc
- **Features:**
  - Clean documentation
  - Search functionality
  - Code examples

### OpenAPI JSON
- **URL:** http://localhost:8000/openapi.json
- **Use:** Import into Postman, Insomnia, etc.

---

## 🛠️ Development Tools

### Recommended Tools
1. **Postman** - API testing
   - Import: http://localhost:8000/openapi.json
   
2. **Insomnia** - API client
   - Import: http://localhost:8000/openapi.json
   
3. **VS Code Extensions**
   - REST Client
   - SQLite
   - Thunder Client
   
4. **Browser DevTools**
   - Network tab for API calls
   - Console for errors
   - Application tab for storage

---

## 🔄 Common Workflows

### 1. Register and Login
```
1. POST /api/auth/register
2. POST /api/auth/login
3. Copy token from response
4. Use token in Authorization header
```

### 2. Browse Packages
```
1. GET /api/packages/
2. View available packages
3. Get package ID
```

### 3. Create Payment Order
```
1. POST /api/payments/create-order
2. Get Razorpay order ID
3. Complete payment in frontend
```

### 4. Check Referrals
```
1. GET /api/referrals/my-referrals
2. View referral tree
3. Check commissions
```

---

## 📈 Monitoring

### Backend Logs
- Check terminal where backend is running
- Look for INFO, WARNING, ERROR messages

### Frontend Logs
- Open browser DevTools (F12)
- Check Console tab
- Check Network tab for API calls

### Database
- Use SQLite CLI or GUI tools
- Query tables directly
- Check data consistency

---

## 🚨 Troubleshooting Access

### Can't access http://localhost:3000?
```bash
# Check if frontend is running
lsof -i :3000

# Restart frontend
cd frontend
npm run dev
```

### Can't access http://localhost:8000?
```bash
# Check if backend is running
lsof -i :8000

# Restart backend
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload
```

### API returns 401 Unauthorized?
- Make sure you're logged in
- Check token in Authorization header
- Token format: `Bearer YOUR_TOKEN`

### CORS errors?
- Backend CORS is configured
- Check browser console for details
- Verify API_URL in frontend .env

---

## 📞 Support

- **API Docs:** http://localhost:8000/docs
- **Frontend:** http://localhost:3000
- **Database:** `backend/app.db`
- **Logs:** Terminal output

---

**All services are ready to use! 🎉**

Start with:
1. Frontend: http://localhost:3000
2. API Docs: http://localhost:8000/docs
3. Register a test user
4. Explore the application

