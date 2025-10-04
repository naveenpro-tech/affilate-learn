"""
Add username, bio, and social link columns to users table
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def add_columns():
    DATABASE_URL = os.getenv("DATABASE_URL")
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    try:
        # Add username column
        try:
            cur.execute("ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE")
            conn.commit()
            print("✅ Added username column")
        except Exception as e:
            conn.rollback()
            if "already exists" in str(e):
                print("⏭️  username column already exists")
            else:
                print(f"❌ Error adding username: {e}")

        # Add bio column
        try:
            cur.execute("ALTER TABLE users ADD COLUMN bio VARCHAR(500)")
            conn.commit()
            print("✅ Added bio column")
        except Exception as e:
            conn.rollback()
            if "already exists" in str(e):
                print("⏭️  bio column already exists")
            else:
                print(f"❌ Error adding bio: {e}")

        # Add instagram_url column
        try:
            cur.execute("ALTER TABLE users ADD COLUMN instagram_url VARCHAR(200)")
            conn.commit()
            print("✅ Added instagram_url column")
        except Exception as e:
            conn.rollback()
            if "already exists" in str(e):
                print("⏭️  instagram_url column already exists")
            else:
                print(f"❌ Error adding instagram_url: {e}")

        # Add twitter_url column
        try:
            cur.execute("ALTER TABLE users ADD COLUMN twitter_url VARCHAR(200)")
            conn.commit()
            print("✅ Added twitter_url column")
        except Exception as e:
            conn.rollback()
            if "already exists" in str(e):
                print("⏭️  twitter_url column already exists")
            else:
                print(f"❌ Error adding twitter_url: {e}")

        # Add linkedin_url column
        try:
            cur.execute("ALTER TABLE users ADD COLUMN linkedin_url VARCHAR(200)")
            conn.commit()
            print("✅ Added linkedin_url column")
        except Exception as e:
            conn.rollback()
            if "already exists" in str(e):
                print("⏭️  linkedin_url column already exists")
            else:
                print(f"❌ Error adding linkedin_url: {e}")

    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    print("🔧 Adding new columns to users table...")
    add_columns()
    print("✅ Migration complete!")

