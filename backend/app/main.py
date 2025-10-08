from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration

# Initialize Sentry for error tracking
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=1.0 if settings.ENVIRONMENT == "development" else 0.1,
        profiles_sample_rate=1.0 if settings.ENVIRONMENT == "development" else 0.1,
        integrations=[
            FastApiIntegration(),
            StarletteIntegration(),
        ],
    )

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Affiliate Video Learning Platform API",
    version="1.0.0"
)

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS - Must be added first to handle preflight requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Middleware to disable caching
class NoCacheMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response

# Add no-cache middleware
app.add_middleware(NoCacheMiddleware)


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Affiliate Learning Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/sentry-test")
async def sentry_test():
    """Test endpoint to trigger Sentry error tracking"""
    # This will trigger a division by zero error
    result = 1 / 0
    return {"result": result}


# Import and include routers
from app.api import auth, packages, payments, referrals, commissions, courses, payouts, admin, bank_details, profile, modules, certificates, notifications, wallet, course_purchases, video_progress, email_verification

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(email_verification.router, prefix="/api/email-verification", tags=["Email Verification"])
app.include_router(packages.router, prefix="/api/packages", tags=["Packages"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(referrals.router, prefix="/api/referrals", tags=["Referrals"])
app.include_router(commissions.router, prefix="/api/commissions", tags=["Commissions"])
app.include_router(courses.router, prefix="/api/courses", tags=["Courses"])
app.include_router(course_purchases.router, prefix="/api/course-purchases", tags=["Course Purchases"])
app.include_router(modules.router, prefix="/api/modules", tags=["Modules & Topics"])
app.include_router(certificates.router, prefix="/api/certificates", tags=["Certificates"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(wallet.router, prefix="/api/wallet", tags=["Wallet"])
app.include_router(video_progress.router, prefix="/api/video-progress", tags=["Video Progress"])
app.include_router(payouts.router, prefix="/api/payouts", tags=["Payouts"])
app.include_router(bank_details.router, prefix="/api/bank-details", tags=["Bank Details"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

