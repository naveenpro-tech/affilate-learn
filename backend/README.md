# Affiliate Learning Platform - Backend

FastAPI backend for the Affiliate Video Learning Platform with multi-level referral system.

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- PostgreSQL database (Neon)
- Virtual environment tool (venv/virtualenv)

### Installation

1. **Create virtual environment**
```bash
python -m venv venv
```

2. **Activate virtual environment**
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
# Copy .env.example to .env and update with your credentials
cp .env.example .env
```

5. **Run database migrations**
```bash
alembic upgrade head
```

6. **Start the development server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/              # API route handlers
│   ├── core/             # Core configuration and security
│   ├── models/           # SQLAlchemy database models
│   ├── schemas/          # Pydantic schemas for validation
│   ├── services/         # Business logic services
│   ├── utils/            # Utility functions
│   └── main.py           # FastAPI application entry point
├── alembic/              # Database migrations
├── requirements.txt      # Python dependencies
└── .env                  # Environment variables (not in git)
```

## 🔧 Configuration

Key environment variables in `.env`:

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `RAZORPAY_KEY_ID` - Razorpay API key
- `RAZORPAY_KEY_SECRET` - Razorpay secret
- `CLOUDINARY_*` - Cloudinary credentials
- `SMTP_*` - Email server configuration

## 📚 API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🧪 Testing

```bash
pytest
```

## 📦 Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback migration:
```bash
alembic downgrade -1
```

