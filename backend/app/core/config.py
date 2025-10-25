from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Database
    DATABASE_URL: str
    TURSO_DATABASE_URL: Optional[str] = None  # Turso database URL
    TURSO_AUTH_TOKEN: Optional[str] = None  # Turso auth token
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    
    # Email
    EMAIL_FROM: str
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str
    SMTP_FROM_EMAIL: str = "roprly@bilvanaturals.online"  # Must match SMTP account
    SMTP_USERNAME: str = ""  # Will use SMTP_USER if not set
    SMTP_USE_TLS: bool = True
    
    # Razorpay
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    
    # Application
    APP_NAME: str = "Affiliate Learning Platform"
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"
    API_BASE_URL: str = "http://localhost:8000"  # For generating public URLs
    
    # Payout
    PAYOUT_DAY: str = "MONDAY"
    MINIMUM_PAYOUT_AMOUNT: float = 500.0

    # Sentry (Error Tracking)
    SENTRY_DSN: Optional[str] = None
    ENVIRONMENT: str = "development"

    # Mock Services (for development)
    # Default to real Razorpay; can be overridden via .env USE_RAZORPAY_MOCK=true if ever needed locally
    USE_RAZORPAY_MOCK: bool = False

    # Community AI Studio - Image Generation
    # Supports multiple providers: openai_dalle, huggingface, gemini_nano_banana, auto
    IMAGEGEN_PROVIDER: str = "auto"  # Auto-select best available provider
    IMAGEGEN_API_KEY: Optional[str] = None  # Deprecated (Replicate)
    IMAGEGEN_API_BASE: str = "https://generativelanguage.googleapis.com"
    IMAGEGEN_MODEL_ID: str = "gemini-2.5-flash-image"  # Nano Banana
    IMAGEGEN_GEMINI_MODEL_ID: str = "gemini-2.5-flash-image"  # Nano Banana
    IMAGEGEN_DEFAULT_TIER: str = "standard"

    # Image Generation API Keys
    OPENAI_API_KEY: Optional[str] = None  # OpenAI DALL-E 3
    HUGGINGFACE_API_KEY: Optional[str] = None  # Hugging Face (Free tier: 1000 calls/day)
    GEMINI_API_KEY: Optional[str] = None  # Google Gemini (Nano Banana + Prompt Enhancement)

    # Community AI Studio - Prompt Enhancement
    PROMPT_ENHANCER_PROVIDER: str = "gemini"
    PROMPT_ENHANCER_API_BASE: str = "https://generativelanguage.googleapis.com"
    PROMPT_ENHANCER_MODEL_ID: str = "gemini-1.5-flash-latest"
    PROMPT_ENHANCER_TIMEOUT_SECONDS: float = 3.0

    # Community AI Studio - Storage
    STORAGE_PROVIDER: str = "cloudinary"

    # Community AI Studio - Credit Economy
    CREDIT_PRICE_INR: float = 5.0
    CREDIT_STANDARD_TIER_COST: int = 1
    CREDIT_PREMIUM_TIER_2_COST: int = 2
    CREDIT_PREMIUM_TIER_4_COST: int = 4
    CREDIT_REUSE_REWARD: float = 0.5
    CREDIT_REUSE_CAP_PER_ASSET: int = 20
    CREDIT_REUSE_CAP_PER_DAY: int = 10

    # Feature Flags
    FEATURE_FLAGS: Optional[str] = '{"premium_tiers":true,"ab_test_pricing":true,"community_feed":true}'

    # Admin Key Management
    KEY_ENCRYPTION_SECRET: str = "dev-key-encryption-secret-change-in-production"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables


settings = Settings()

