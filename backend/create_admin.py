"""
Create an admin user for testing
"""
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from app.utils.referral_code import generate_referral_code

def create_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if admin:
            print("Admin user already exists!")
            print(f"Email: admin@example.com")
            print(f"Password: admin123")
            return
        
        # Create admin user
        admin = User(
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            phone="1234567890",
            referral_code=generate_referral_code(),
            is_admin=True,
            is_active=True
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("✅ Admin user created successfully!")
        print(f"Email: admin@example.com")
        print(f"Password: admin123")
        print(f"Referral Code: {admin.referral_code}")
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()

