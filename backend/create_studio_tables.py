#!/usr/bin/env python3
"""
Create Community AI Studio tables in the database.
This script creates all necessary tables for the studio feature.
"""

import sys
from sqlalchemy import create_engine
from app.core.database import Base
from app.models import (
    ImageTemplate,
    ImageCategory,
    GeneratedImage,
    CommunityPost,
    PostLike,
    PostReport,
    PromptReuseEvent,
    CreditLedger,
    ReferralEvent,
)

# Import all models to ensure they're registered
from app.models import User, Package, UserPackage, Referral, Commission, Payout
from app.models import Course, Video, Payment, BankDetails, VideoProgress
from app.models import Profile, Certificate, Module, Topic, Notification, Wallet

def create_tables():
    """Create all studio tables"""
    try:
        # Get database URL from environment or use default
        from dotenv import load_dotenv
        import os
        
        load_dotenv()
        database_url = os.getenv("DATABASE_URL", "sqlite:///./app.db")
        
        print(f"Connecting to database: {database_url}")
        engine = create_engine(database_url, echo=True)
        
        print("Creating Community AI Studio tables...")
        Base.metadata.create_all(bind=engine)
        
        print("✅ All tables created successfully!")
        print("\nCreated tables:")
        print("  - image_categories")
        print("  - image_templates")
        print("  - generated_images")
        print("  - community_posts")
        print("  - post_likes")
        print("  - post_reports")
        print("  - prompt_reuse_events")
        print("  - credit_ledger")
        print("  - referral_events")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = create_tables()
    sys.exit(0 if success else 1)

