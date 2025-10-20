"""
Migration to update notifications table with studio-related fields
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine
from sqlalchemy import text

def upgrade():
    """Add new columns to notifications table"""
    with engine.connect() as conn:
        try:
            # Add post_id column
            conn.execute(text("""
                ALTER TABLE notifications
                ADD COLUMN post_id INTEGER
            """))
            print("✓ Added post_id column")
        except Exception as e:
            print(f"✓ post_id column already exists")

        try:
            # Add comment_id column
            conn.execute(text("""
                ALTER TABLE notifications
                ADD COLUMN comment_id INTEGER
            """))
            print("✓ Added comment_id column")
        except Exception as e:
            print(f"✓ comment_id column already exists")

        try:
            # Add from_user_id column
            conn.execute(text("""
                ALTER TABLE notifications
                ADD COLUMN from_user_id INTEGER
            """))
            print("✓ Added from_user_id column")
        except Exception as e:
            print(f"✓ from_user_id column already exists")

        conn.commit()
        print("\n✅ Notifications table migration completed!")

if __name__ == "__main__":
    print("Running notifications table migration...")
    upgrade()

