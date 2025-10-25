"""
Seed admin user and default packages to Turso database
"""

import libsql_experimental as libsql
import os
import secrets
import string
import hashlib
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv('TURSO_DATABASE_URL')
auth_token = os.getenv('TURSO_AUTH_TOKEN')

def hash_password(password: str) -> str:
    """Simple password hashing (use bcrypt in production)"""
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.hash(password)

print("=" * 60)
print("SEED ADMIN USER AND PACKAGES")
print("=" * 60)
print()

# Connect to Turso
print("🔄 Connecting to Turso...")
conn = libsql.connect(db_url, auth_token=auth_token)
cursor = conn.cursor()
print("✅ Connected successfully!")
print()

try:
    # Check if admin user exists
    cursor.execute("SELECT id, email FROM users WHERE email = ?", ("naveenvide@gmail.com",))
    admin = cursor.fetchone()
    
    if admin:
        print(f"ℹ️  Admin user already exists (ID: {admin[0]})")
    else:
        # Generate referral code
        referral_code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        
        # Hash password
        hashed_password = hash_password("admin123")
        
        # Create admin user
        cursor.execute("""
            INSERT INTO users (
                email, username, full_name, hashed_password,
                is_admin, is_active, email_verified, referral_code,
                onboarding_completed
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "naveenvide@gmail.com",
            "admin",
            "Admin User",
            hashed_password,
            1,  # is_admin
            1,  # is_active
            1,  # email_verified
            referral_code,
            1   # onboarding_completed
        ))
        
        conn.commit()
        
        print("✅ Admin user created successfully!")
        print(f"   📧 Email: naveenvide@gmail.com")
        print(f"   🔑 Password: admin123 (CHANGE THIS IMMEDIATELY!)")
        print(f"   🔗 Referral Code: {referral_code}")
    
    print()
    
    # Check if packages exist
    cursor.execute("SELECT COUNT(*) FROM packages")
    package_count = cursor.fetchone()[0]
    
    if package_count > 0:
        print(f"ℹ️  {package_count} packages already exist")
    else:
        # Create packages with GST calculation (18%)
        packages = [
            {
                "name": "Silver",
                "slug": "silver",
                "description": "Access to basic courses",
                "base_price": 2500.0,
                "gst_amount": 450.0,  # 18% GST
                "final_price": 2950.0,
                "display_order": 1
            },
            {
                "name": "Gold",
                "slug": "gold",
                "description": "Access to intermediate courses",
                "base_price": 4500.0,
                "gst_amount": 810.0,  # 18% GST
                "final_price": 5310.0,
                "display_order": 2
            },
            {
                "name": "Platinum",
                "slug": "platinum",
                "description": "Access to all courses",
                "base_price": 7500.0,
                "gst_amount": 1350.0,  # 18% GST
                "final_price": 8850.0,
                "display_order": 3
            }
        ]

        for package in packages:
            cursor.execute("""
                INSERT INTO packages (name, slug, description, base_price, gst_amount, final_price, display_order, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                package["name"],
                package["slug"],
                package["description"],
                package["base_price"],
                package["gst_amount"],
                package["final_price"],
                package["display_order"],
                1  # is_active
            ))

        conn.commit()

        print("✅ Default packages created successfully!")
        print("   - Silver: ₹2,950 (Base: ₹2,500 + GST: ₹450)")
        print("   - Gold: ₹5,310 (Base: ₹4,500 + GST: ₹810)")
        print("   - Platinum: ₹8,850 (Base: ₹7,500 + GST: ₹1,350)")
    
    print()
    print("=" * 60)
    print("✅ SEEDING COMPLETE!")
    print("=" * 60)
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()
finally:
    cursor.close()
    conn.close()

print()

