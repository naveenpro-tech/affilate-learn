"""
Create bank_details table in the database
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine
from app.models.bank_details import BankDetails
from sqlalchemy import inspect

def create_bank_details_table():
    """Create the bank_details table"""
    print("Checking database connection...")

    # Check if table already exists
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    if 'bank_details' in existing_tables:
        print("✅ bank_details table already exists!")
        return

    print("Creating bank_details table in remote database...")

    try:
        # Create only the bank_details table
        BankDetails.__table__.create(engine, checkfirst=True)
        print("✅ bank_details table created successfully!")
    except Exception as e:
        print(f"❌ Error creating table: {e}")
        raise

if __name__ == "__main__":
    create_bank_details_table()

