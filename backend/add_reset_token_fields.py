"""
Migration script to add reset_token and reset_token_expires fields to users table
"""
from sqlalchemy import create_engine, text
from app.core.config import settings

def migrate():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Add reset_token column
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR"))
            conn.commit()
            print("✅ Added reset_token column")
        except Exception as e:
            if "already exists" in str(e) or "duplicate column" in str(e).lower():
                print("ℹ️  reset_token column already exists")
            else:
                print(f"❌ Error adding reset_token: {e}")
        
        # Add reset_token_expires column
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP"))
            conn.commit()
            print("✅ Added reset_token_expires column")
        except Exception as e:
            if "already exists" in str(e) or "duplicate column" in str(e).lower():
                print("ℹ️  reset_token_expires column already exists")
            else:
                print(f"❌ Error adding reset_token_expires: {e}")
    
    print("\n✅ Migration completed successfully!")

if __name__ == "__main__":
    migrate()

