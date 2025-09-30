"""
Script to seed initial package data (Silver, Gold, Platinum)
"""
from app.core.database import SessionLocal
from app.models import Package

def seed_packages():
    """Create the three package tiers"""
    db = SessionLocal()
    
    try:
        # Check if packages already exist
        existing = db.query(Package).count()
        if existing > 0:
            print(f"⚠️  {existing} packages already exist. Skipping seed.")
            return
        
        packages = [
            Package(
                name="Silver",
                slug="silver",
                description="Access to basic courses and features",
                base_price=2500.0,
                gst_amount=450.0,
                final_price=2950.0,
                display_order=1,
                is_active=True
            ),
            Package(
                name="Gold",
                slug="gold",
                description="Access to intermediate courses and premium features",
                base_price=4500.0,
                gst_amount=810.0,
                final_price=5310.0,
                display_order=2,
                is_active=True
            ),
            Package(
                name="Platinum",
                slug="platinum",
                description="Access to all courses and exclusive features",
                base_price=7500.0,
                gst_amount=1350.0,
                final_price=8850.0,
                display_order=3,
                is_active=True
            ),
        ]
        
        db.add_all(packages)
        db.commit()
        
        print("✅ Successfully seeded 3 packages:")
        for pkg in packages:
            print(f"   - {pkg.name}: ₹{pkg.final_price}")
        
    except Exception as e:
        print(f"❌ Error seeding packages: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_packages()

