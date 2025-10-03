# 🔧 CRITICAL FEATURES IMPLEMENTATION GUIDE

This guide provides step-by-step instructions to implement the 5 most critical missing features before production deployment.

---

## 1. RATE LIMITING (2-3 hours)

### Step 1: Install Dependencies
```bash
cd backend
pip install slowapi==0.1.9
pip freeze > requirements.txt
```

### Step 2: Create Rate Limiter Configuration
**File:** `backend/app/core/rate_limit.py`
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

# Create limiter instance
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/hour"],  # Default limit for all endpoints
    storage_uri="memory://",  # Use Redis in production: "redis://localhost:6379"
)
```

### Step 3: Add to Main App
**File:** `backend/app/main.py`
```python
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter

# Add limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

### Step 4: Apply to Critical Endpoints
**File:** `backend/app/api/auth.py`
```python
from app.core.rate_limit import limiter
from fastapi import Request

@router.post("/register")
@limiter.limit("5/hour")  # 5 registrations per hour per IP
def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    # existing code...
    pass

@router.post("/login")
@limiter.limit("10/minute")  # 10 login attempts per minute per IP
def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    # existing code...
    pass
```

**File:** `backend/app/api/payments.py`
```python
@router.post("/create-order")
@limiter.limit("5/minute")  # 5 payment attempts per minute
def create_order(request: Request, ...):
    pass

@router.post("/verify")
@limiter.limit("10/minute")  # 10 verification attempts per minute
def verify_payment(request: Request, ...):
    pass
```

---

## 2. CSRF PROTECTION (2-3 hours)

### Step 1: Install Dependencies
```bash
cd backend
pip install fastapi-csrf-protect==0.3.4
pip freeze > requirements.txt
```

### Step 2: Create CSRF Configuration
**File:** `backend/app/core/csrf.py`
```python
from fastapi_csrf_protect import CsrfProtect
from pydantic import BaseModel

class CsrfSettings(BaseModel):
    secret_key: str = "your-csrf-secret-key-change-in-production"
    cookie_samesite: str = "lax"
    cookie_secure: bool = False  # Set to True in production with HTTPS

@CsrfProtect.load_config
def get_csrf_config():
    return CsrfSettings()
```

### Step 3: Add CSRF to Main App
**File:** `backend/app/main.py`
```python
from app.core.csrf import CsrfProtect

# Add CSRF protection
csrf_protect = CsrfProtect()
```

### Step 4: Protect State-Changing Endpoints
**File:** `backend/app/api/payments.py`
```python
from app.core.csrf import CsrfProtect

@router.post("/verify")
async def verify_payment(
    request: Request,
    verification_data: PaymentVerification,
    csrf_protect: CsrfProtect = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate CSRF token
    await csrf_protect.validate_csrf(request)
    
    # existing code...
    pass
```

### Step 5: Update Frontend to Send CSRF Token
**File:** `frontend/lib/api.ts`
```typescript
// Request interceptor to add CSRF token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('fastapi-csrf-token='))
      ?.split('=')[1];
    
    if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);
```

---

## 3. EMAIL VERIFICATION (4-6 hours)

### Step 1: Update User Model
**File:** `backend/app/models/user.py`
```python
class User(Base):
    # ... existing fields ...
    
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(100), nullable=True)
    verification_token_expires = Column(DateTime, nullable=True)
```

### Step 2: Create Migration
```bash
cd backend
alembic revision --autogenerate -m "add email verification fields"
alembic upgrade head
```

### Step 3: Create Email Utility
**File:** `backend/app/utils/email.py`
```python
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import secrets

async def send_email(to_email: str, subject: str, html_content: str):
    """Send email using SMTP"""
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = settings.EMAIL_FROM
    message["To"] = to_email
    
    html_part = MIMEText(html_content, "html")
    message.attach(html_part)
    
    await aiosmtplib.send(
        message,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
        use_tls=True
    )

def generate_verification_token() -> str:
    """Generate secure verification token"""
    return secrets.token_urlsafe(32)

async def send_verification_email(user_email: str, token: str):
    """Send verification email"""
    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    
    html_content = f"""
    <html>
      <body>
        <h2>Welcome to {settings.APP_NAME}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="{verification_link}">Verify Email</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      </body>
    </html>
    """
    
    await send_email(user_email, "Verify Your Email", html_content)
```

### Step 4: Update Registration Endpoint
**File:** `backend/app/api/auth.py`
```python
from datetime import datetime, timedelta
from app.utils.email import send_verification_email, generate_verification_token

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # ... existing validation ...
    
    # Generate verification token
    verification_token = generate_verification_token()
    verification_expires = datetime.utcnow() + timedelta(hours=24)
    
    # Create user
    new_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
        referral_code=referral_code,
        referred_by_id=referred_by_id,
        is_active=True,
        is_admin=False,
        is_verified=False,  # Not verified yet
        verification_token=verification_token,
        verification_token_expires=verification_expires
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send verification email (async)
    try:
        await send_verification_email(new_user.email, verification_token)
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        # Don't fail registration if email fails
    
    # ... existing token generation ...
```

### Step 5: Add Verification Endpoints
**File:** `backend/app/api/auth.py`
```python
@router.post("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    """Verify user email with token"""
    user = db.query(User).filter(
        User.verification_token == token,
        User.verification_token_expires > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    db.commit()
    
    return {"message": "Email verified successfully"}

@router.post("/resend-verification")
async def resend_verification(email: EmailStr, db: Session = Depends(get_db)):
    """Resend verification email"""
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, a verification link has been sent"}
    
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Generate new token
    verification_token = generate_verification_token()
    verification_expires = datetime.utcnow() + timedelta(hours=24)
    
    user.verification_token = verification_token
    user.verification_token_expires = verification_expires
    db.commit()
    
    # Send email
    try:
        await send_verification_email(user.email, verification_token)
    except Exception as e:
        print(f"Failed to send verification email: {e}")
    
    return {"message": "Verification email sent"}
```

### Step 6: Create Frontend Verification Page
**File:** `frontend/app/verify-email/page.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }
    
    verifyEmail(token);
  }, [searchParams]);
  
  const verifyEmail = async (token: string) => {
    try {
      await authAPI.verifyEmail(token);
      setStatus('success');
      toast.success('Email verified successfully!');
      setTimeout(() => router.push('/login'), 3000);
    } catch (error) {
      setStatus('error');
      toast.error('Verification failed. Token may be invalid or expired.');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Verifying Email...</h2>
            <p className="text-neutral-600">Please wait while we verify your email address.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-success-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Email Verified!</h2>
            <p className="text-neutral-600">Your email has been successfully verified. Redirecting to login...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-danger-500 text-6xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Verification Failed</h2>
            <p className="text-neutral-600 mb-4">The verification link is invalid or has expired.</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

### Step 7: Update API Client
**File:** `frontend/lib/api.ts`
```typescript
export const authAPI = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (data: any) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
  verifyEmail: (token: string) => api.post('/api/auth/verify-email', null, { params: { token } }),
  resendVerification: (email: string) => api.post('/api/auth/resend-verification', { email }),
};
```

---

## 4. PASSWORD RESET (3-4 hours)

### Step 1: Update User Model (if not done in email verification)
**File:** `backend/app/models/user.py`
```python
class User(Base):
    # ... existing fields ...
    
    reset_token = Column(String(100), nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
```

### Step 2: Add Password Reset Endpoints
**File:** `backend/app/api/auth.py`
```python
from app.utils.email import send_email, generate_verification_token

@router.post("/forgot-password")
async def forgot_password(email: EmailStr, db: Session = Depends(get_db)):
    """Send password reset email"""
    user = db.query(User).filter(User.email == email).first()
    
    # Don't reveal if email exists (security best practice)
    if not user:
        return {"message": "If the email exists, a reset link has been sent"}
    
    # Generate reset token
    reset_token = generate_verification_token()
    reset_expires = datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry
    
    user.reset_token = reset_token
    user.reset_token_expires = reset_expires
    db.commit()
    
    # Send reset email
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    html_content = f"""
    <html>
      <body>
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="{reset_link}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </body>
    </html>
    """
    
    try:
        await send_email(user.email, "Password Reset Request", html_content)
    except Exception as e:
        print(f"Failed to send reset email: {e}")
    
    return {"message": "If the email exists, a reset link has been sent"}

@router.post("/reset-password")
def reset_password(data: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Reset password with token"""
    user = db.query(User).filter(
        User.reset_token == data.token,
        User.reset_token_expires > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Update password
    user.hashed_password = get_password_hash(data.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    
    return {"message": "Password reset successfully"}
```

### Step 3: Create Frontend Pages
**File:** `frontend/app/forgot-password/page.tsx`
```typescript
'use client';

import { useState } from 'react';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (error) {
      toast.error('Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };
  
  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Check Your Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600">
              If an account exists with {email}, you will receive a password reset link shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

**File:** `frontend/app/reset-password/page.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    try {
      setLoading(true);
      await authAPI.resetPassword(token!, formData.new_password);
      toast.success('Password reset successfully!');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to reset password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Card className="max-w-md w-full">
          <CardContent>
            <p className="text-danger-500">Invalid reset link</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                New Password
              </label>
              <Input
                type="password"
                required
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Confirm Password
              </label>
              <Input
                type="password"
                required
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 4: Update API Client
**File:** `frontend/lib/api.ts`
```typescript
export const authAPI = {
  // ... existing methods ...
  forgotPassword: (email: string) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token: string, new_password: string) => 
    api.post('/api/auth/reset-password', { token, new_password }),
};
```

---

## 5. ERROR TRACKING (2-3 hours)

### Step 1: Sign Up for Sentry
1. Go to https://sentry.io
2. Create free account
3. Create new project (Python/FastAPI)
4. Get DSN (Data Source Name)

### Step 2: Install Sentry
```bash
cd backend
pip install sentry-sdk[fastapi]==1.40.0
pip freeze > requirements.txt
```

### Step 3: Configure Sentry
**File:** `backend/app/core/config.py`
```python
class Settings(BaseSettings):
    # ... existing fields ...
    
    # Sentry
    SENTRY_DSN: Optional[str] = None
    ENVIRONMENT: str = "development"  # development, staging, production
```

### Step 4: Initialize Sentry
**File:** `backend/app/main.py`
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

# Initialize Sentry
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=1.0,  # Capture 100% of transactions for performance monitoring
        integrations=[
            FastApiIntegration(),
            SqlalchemyIntegration(),
        ],
    )
```

### Step 5: Add to Environment Variables
```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
ENVIRONMENT=production
```

### Step 6: Test Error Tracking
**File:** `backend/app/main.py`
```python
@app.get("/sentry-debug")
async def trigger_error():
    """Test endpoint to trigger Sentry error"""
    division_by_zero = 1 / 0
```

---

## 🎯 TESTING CHECKLIST

After implementing each feature, test:

### Rate Limiting
- [ ] Try logging in 11 times in 1 minute (should be blocked)
- [ ] Try registering 6 times in 1 hour (should be blocked)
- [ ] Verify error message is clear

### CSRF Protection
- [ ] Payment verification works with CSRF token
- [ ] Payment fails without CSRF token
- [ ] Other state-changing operations protected

### Email Verification
- [ ] Registration sends verification email
- [ ] Verification link works
- [ ] Expired token shows error
- [ ] Resend verification works

### Password Reset
- [ ] Forgot password sends email
- [ ] Reset link works
- [ ] Expired token shows error
- [ ] Password successfully changes

### Error Tracking
- [ ] Errors appear in Sentry dashboard
- [ ] Stack traces are complete
- [ ] User context is captured
- [ ] Performance metrics visible

---

## 📝 DEPLOYMENT NOTES

1. Update `requirements.txt` after installing new packages
2. Add new environment variables to Render
3. Run database migrations if schema changed
4. Test all features in staging before production
5. Monitor Sentry for errors after deployment

---

## ✅ COMPLETION CHECKLIST

- [ ] Rate limiting implemented and tested
- [ ] CSRF protection implemented and tested
- [ ] Email verification implemented and tested
- [ ] Password reset implemented and tested
- [ ] Error tracking implemented and tested
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Deployed to staging
- [ ] Tested in staging
- [ ] Ready for production


