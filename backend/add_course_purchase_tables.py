"""
Script to add individual course purchase tables and columns
"""
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.core.database import engine

def add_course_purchase_features():
    """Add individual course purchase tables and columns"""
    
    with engine.connect() as conn:
        # Start transaction
        trans = conn.begin()
        
        try:
            # Add columns to courses table if they don't exist
            print("Adding individual_price column to courses table...")
            try:
                conn.execute(text("""
                    ALTER TABLE courses 
                    ADD COLUMN IF NOT EXISTS individual_price FLOAT DEFAULT 199.0
                """))
                print("✓ Added individual_price column")
            except Exception as e:
                print(f"Note: {e}")
            
            print("Adding available_for_individual_purchase column to courses table...")
            try:
                conn.execute(text("""
                    ALTER TABLE courses 
                    ADD COLUMN IF NOT EXISTS available_for_individual_purchase BOOLEAN DEFAULT true
                """))
                print("✓ Added available_for_individual_purchase column")
            except Exception as e:
                print(f"Note: {e}")
            
            # Create user_course_purchases table
            print("Creating user_course_purchases table...")
            try:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS user_course_purchases (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                        amount_paid FLOAT NOT NULL,
                        payment_id INTEGER REFERENCES payments(id),
                        purchase_date TIMESTAMP DEFAULT NOW() NOT NULL,
                        access_expires_at TIMESTAMP,
                        is_active BOOLEAN DEFAULT true NOT NULL,
                        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
                        UNIQUE(user_id, course_id)
                    )
                """))
                print("✓ Created user_course_purchases table")
            except Exception as e:
                print(f"Note: {e}")
            
            # Create indexes
            print("Creating indexes...")
            try:
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_user_course_purchases_user_id 
                    ON user_course_purchases(user_id)
                """))
                print("✓ Created index on user_id")
            except Exception as e:
                print(f"Note: {e}")
            
            try:
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_user_course_purchases_course_id 
                    ON user_course_purchases(course_id)
                """))
                print("✓ Created index on course_id")
            except Exception as e:
                print(f"Note: {e}")
            
            try:
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_user_course_purchases_is_active 
                    ON user_course_purchases(is_active)
                """))
                print("✓ Created index on is_active")
            except Exception as e:
                print(f"Note: {e}")
            
            # Commit transaction
            trans.commit()
            print("\n✅ Successfully added course purchase features!")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Error: {e}")
            raise

if __name__ == "__main__":
    print("Adding individual course purchase features...\n")
    add_course_purchase_features()

