# 🚀 How to Run the Affiliate Learning Platform

## Quick Start (Already Running!)

The application is **already set up and running**:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## Starting the Application (If Stopped)

### Terminal 1: Start Backend

```bash
cd /home/butta/Music/affilate-learn/backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Terminal 2: Start Frontend

```bash
cd /home/butta/Music/affilate-learn/frontend
npm run dev
```

**Expected Output:**
```
✓ Ready in 1694ms
- Local:        http://localhost:3000
```

---

## Accessing the Application

### 1. Frontend (User Interface)
- **URL:** http://localhost:3000
- **Features:**
  - User registration and login
  - Package browsing
  - Course viewing
  - Referral tracking
  - Earnings dashboard

### 2. Backend API Documentation
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json

### 3. Database
- **Type:** SQLite
- **Location:** `backend/app.db`
- **View with:** Any SQLite viewer or `sqlite3 backend/app.db`

---

## Testing the Application

### 1. Register a New User
1. Go to http://localhost:3000
2. Click "Register"
3. Fill in the form with:
   - Email: test@example.com
   - Password: Test@123
   - Full Name: Test User
   - Phone: +919876543210

### 2. Login
1. Use the credentials from registration
2. You should see the dashboard

### 3. Test Referral System
1. Get your referral code from the dashboard
2. Register another user with your referral code
3. Check the referral tracking

### 4. Browse Courses
1. Click "Browse Courses"
2. View available courses
3. Purchase a package to access courses

---

## Common Commands

### Backend Commands

```bash
# Activate virtual environment
cd backend
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create database tables
python create_tables.py

# Seed initial packages
python seed_packages.py

# Run tests
python -m pytest

# Run server with reload
python -m uvicorn app.main:app --reload

# Run server without reload
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## Stopping the Application

### Stop Backend
- Press `Ctrl+C` in the backend terminal

### Stop Frontend
- Press `Ctrl+C` in the frontend terminal

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill the process if needed
kill -9 <PID>

# Try a different port
python -m uvicorn app.main:app --port 8001
```

### Frontend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill the process if needed
kill -9 <PID>

# Try a different port
npm run dev -- -p 3001
```

### Database errors
```bash
# Recreate database
cd backend
rm app.db
python create_tables.py
python seed_packages.py
```

### Module not found errors
```bash
# Reinstall dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt --force-reinstall
```

---

## Environment Variables

### Backend (.env)
Located at: `backend/.env`

Key variables:
- `DATABASE_URL` - Database connection string
- `SECRET_KEY` - JWT secret key
- `RAZORPAY_KEY_ID` - Payment gateway key
- `CLOUDINARY_CLOUD_NAME` - Cloud storage

### Frontend (.env.local)
Located at: `frontend/.env.local`

Key variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Payment gateway key

---

## Project Structure

```
affilate-learn/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py      # Application entry point
│   │   ├── api/         # API routes
│   │   ├── models/      # Database models
│   │   └── services/    # Business logic
│   ├── venv/            # Python virtual environment
│   ├── .env             # Environment variables
│   └── app.db           # SQLite database
│
├── frontend/            # Next.js frontend
│   ├── app/             # Next.js app directory
│   ├── components/      # React components
│   ├── .env.local       # Environment variables
│   └── package.json     # Dependencies
│
└── docs/                # Documentation
```

---

## Next Steps

1. **Explore the API:** Visit http://localhost:8000/docs
2. **Test the Frontend:** Visit http://localhost:3000
3. **Read Documentation:** Check `docs/` folder
4. **Deploy:** Follow deployment guides in `docs/deployment/`

---

**Happy coding! 🎉**

