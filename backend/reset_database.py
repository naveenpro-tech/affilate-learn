"""
Script to reset the database by dropping all tables
WARNING: This will delete all data!
"""
import psycopg2
from app.core.config import settings

def reset_database():
    """Drop all tables in the database"""
    # Parse DATABASE_URL
    db_url = settings.DATABASE_URL
    
    # Connect to database
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cursor = conn.cursor()
    
    print("Dropping all tables...")
    
    # Drop all tables
    cursor.execute("""
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
        GRANT ALL ON SCHEMA public TO neondb_owner;
        GRANT ALL ON SCHEMA public TO public;
    """)
    
    print("✅ All tables dropped successfully!")
    print("Now run: alembic upgrade head")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    confirm = input("⚠️  This will DELETE ALL DATA in the database. Type 'YES' to confirm: ")
    if confirm == "YES":
        reset_database()
    else:
        print("Operation cancelled.")

