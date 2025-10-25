"""
Initialize Turso Database Schema

This script creates all database tables in Turso (LibSQL) database.
Run this script after deploying to production to initialize the database.

Usage:
    python init_turso_database.py
"""

import os
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import engine, Base
from app.core.config import settings

# Import all models to ensure they're registered with Base
from app.models.user import User
from app.models.package import Package
from app.models.payment import Payment
from app.models.commission import Commission
from app.models.payout import Payout
from app.models.course import Course
from app.models.module import Module
from app.models.topic import Topic
from app.models.video import Video
from app.models.video_progress import VideoProgress
from app.models.certificate import Certificate
from app.models.invoice import Invoice
from app.models.bank_details import BankDetails
from app.models.user_package import UserPackage
from app.models.user_course_purchase import UserCoursePurchase
from app.models.studio import (
    ImageCategory,
    ImageTemplate,
    GeneratedImage,
    CommunityPost,
    PostLike,
    PostReport,
    PromptReuseEvent,
    CreditLedger,
    ReferralEvent
)
from app.models.comment import Comment


def init_database():
    """Initialize database schema"""
    print("=" * 60)
    print("TURSO DATABASE INITIALIZATION")
    print("=" * 60)
    print()
    
    # Display database info
    print(f"📊 Database URL: {settings.DATABASE_URL}")
    print(f"🌍 Environment: {settings.ENVIRONMENT}")
    print()
    
    # Confirm before proceeding
    if settings.ENVIRONMENT == "production":
        print("⚠️  WARNING: You are about to initialize PRODUCTION database!")
        print("   This will create all tables if they don't exist.")
        print()
        response = input("   Continue? (yes/no): ")
        if response.lower() != "yes":
            print("❌ Aborted.")
            return
    
    print("🔄 Creating database tables...")
    print()
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ Database tables created successfully!")
        print()
        
        # List all created tables
        print("📋 Created tables:")
        for table in Base.metadata.sorted_tables:
            print(f"   - {table.name}")
        
        print()
        print("=" * 60)
        print("✅ DATABASE INITIALIZATION COMPLETE")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Create admin user (if not exists)")
        print("2. Create packages (Silver, Gold, Platinum)")
        print("3. Create courses and content")
        print("4. Test the application")
        print()
        
    except Exception as e:
        print(f"❌ Error creating database tables: {str(e)}")
        print()
        print("Troubleshooting:")
        print("1. Verify TURSO_AUTH_TOKEN is correct")
        print("2. Verify database URL is accessible")
        print("3. Check network connectivity")
        print("4. Review error message above")
        sys.exit(1)


def create_admin_user():
    """Create default admin user if it doesn't exist"""
    from app.core.database import SessionLocal
    from app.core.security import get_password_hash
    import secrets
    import string
    
    print("👤 Creating admin user...")
    
    db = SessionLocal()
    try:
        # Check if admin user exists
        admin = db.query(User).filter(User.email == "naveenvide@gmail.com").first()
        
        if admin:
            print("   ℹ️  Admin user already exists")
            return
        
        # Generate referral code
        referral_code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        
        # Create admin user
        admin = User(
            email="naveenvide@gmail.com",
            username="admin",
            full_name="Admin User",
            hashed_password=get_password_hash("admin123"),  # Change this password!
            is_admin=True,
            is_active=True,
            is_email_verified=True,
            referral_code=referral_code
        )
        
        db.add(admin)
        db.commit()
        
        print("   ✅ Admin user created successfully!")
        print(f"   📧 Email: naveenvide@gmail.com")
        print(f"   🔑 Password: admin123 (CHANGE THIS IMMEDIATELY!)")
        print(f"   🔗 Referral Code: {referral_code}")
        
    except Exception as e:
        print(f"   ❌ Error creating admin user: {str(e)}")
        db.rollback()
    finally:
        db.close()


def create_default_packages():
    """Create default packages if they don't exist"""
    from app.core.database import SessionLocal
    
    print("📦 Creating default packages...")
    
    db = SessionLocal()
    try:
        # Check if packages exist
        existing_packages = db.query(Package).count()
        
        if existing_packages > 0:
            print(f"   ℹ️  {existing_packages} packages already exist")
            return
        
        # Create packages
        packages = [
            Package(
                name="Silver",
                tier="SILVER",
                price=999.0,
                description="Access to basic courses",
                features=["Access to Silver tier courses", "Basic support", "Certificate of completion"],
                is_active=True
            ),
            Package(
                name="Gold",
                tier="GOLD",
                price=1999.0,
                description="Access to intermediate courses",
                features=["Access to Gold tier courses", "Priority support", "Certificate of completion", "Exclusive content"],
                is_active=True
            ),
            Package(
                name="Platinum",
                tier="PLATINUM",
                price=2999.0,
                description="Access to all courses",
                features=["Access to all courses", "24/7 support", "Certificate of completion", "Exclusive content", "1-on-1 mentoring"],
                is_active=True
            )
        ]
        
        for package in packages:
            db.add(package)
        
        db.commit()
        
        print("   ✅ Default packages created successfully!")
        print("   - Silver: ₹999")
        print("   - Gold: ₹1999")
        print("   - Platinum: ₹2999")
        
    except Exception as e:
        print(f"   ❌ Error creating packages: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print()
    
    # Initialize database
    init_database()
    
    # Create admin user
    create_admin_user()
    
    # Create default packages
    create_default_packages()
    
    print()
    print("🎉 Setup complete! Your database is ready to use.")
    print()

