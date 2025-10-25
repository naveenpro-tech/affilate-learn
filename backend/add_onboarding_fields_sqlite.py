"""
Migration script to add onboarding fields to users table (SQLite version)
Run this script to add onboarding_completed and onboarding_completed_at columns
"""

import sqlite3
import os

def add_onboarding_fields():
    """Add onboarding fields to users table"""
    
    # Connect to SQLite database
    db_path = os.path.join(os.path.dirname(__file__), "app.db")
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    try:
        # Add onboarding_completed column
        try:
            cur.execute("ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT 0")
            conn.commit()
            print("✅ Added onboarding_completed column")
        except sqlite3.OperationalError as e:
            if "duplicate column" in str(e).lower():
                print("⏭️  onboarding_completed column already exists")
            else:
                print(f"❌ Error adding onboarding_completed: {e}")
        
        # Add onboarding_completed_at column
        try:
            cur.execute("ALTER TABLE users ADD COLUMN onboarding_completed_at TIMESTAMP")
            conn.commit()
            print("✅ Added onboarding_completed_at column")
        except sqlite3.OperationalError as e:
            if "duplicate column" in str(e).lower():
                print("⏭️  onboarding_completed_at column already exists")
            else:
                print(f"❌ Error adding onboarding_completed_at: {e}")
        
        print("\n✅ Migration complete!")
        print("📊 Verifying columns...")
        
        # Verify columns exist
        cur.execute("PRAGMA table_info(users)")
        columns = cur.fetchall()
        
        onboarding_cols = [col for col in columns if 'onboarding' in col[1]]
        if onboarding_cols:
            print("\n✅ Onboarding columns verified:")
            for col in onboarding_cols:
                print(f"   - {col[1]} ({col[2]})")
        else:
            print("\n⚠️  Warning: Onboarding columns not found in table")
        
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    print("🔧 Adding onboarding fields to users table (SQLite)...")
    add_onboarding_fields()
    print("✅ Done!")

