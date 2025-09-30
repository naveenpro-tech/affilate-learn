"""
Script to create all database tables
"""
from app.core.database import engine, Base
from app.models import (
    User, Package, UserPackage, Referral,
    Commission, Payout, Course, Video, Payment
)

def create_tables():
    """Create all tables in the database"""
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully!")

if __name__ == "__main__":
    create_tables()

