"""
Create admin user if it doesn't exist
"""
from app.core.database import SessionLocal
# Import all models to ensure relationships are properly configured
from app.models.user import User
from app.models.notification import Notification
from app.models.wallet import Wallet
from app.core.security import get_password_hash
import secrets
import string

def generate_referral_code():
    """Generate a unique 8-character referral code"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))

def create_admin_user():
    db = SessionLocal()
    
    try:
        # Check if admin user exists
        admin = db.query(User).filter(User.email == "naveenvide@gmail.com").first()
        
        if admin:
            print(f"✅ Admin user already exists: {admin.email}")
            print(f"   Is Admin: {admin.is_admin}")
            print(f"   Is Active: {admin.is_active}")
            
            # Update to ensure is_admin is True
            if not admin.is_admin:
                admin.is_admin = True
                db.commit()
                print("   ✅ Updated to admin status")
        else:
            # Create admin user
            admin = User(
                email="naveenvide@gmail.com",
                full_name="Admin User",
                hashed_password=get_password_hash("admin123"),
                referral_code=generate_referral_code(),
                is_admin=True,
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            
            print(f"✅ Created admin user: {admin.email}")
            print(f"   Password: admin123")
            print(f"   Referral Code: {admin.referral_code}")
        
        return admin
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()

