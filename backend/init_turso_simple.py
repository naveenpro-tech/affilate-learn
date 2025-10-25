"""
Turso Database Initialization using Schema File
This script reads and executes the SQL schema from turso_schema.sql
"""

import libsql_experimental as libsql
import os
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv('TURSO_DATABASE_URL')
auth_token = os.getenv('TURSO_AUTH_TOKEN')

print("=" * 80)
print("TURSO DATABASE INITIALIZATION")
print("=" * 80)
print()
print(f"📊 Database URL: {db_url}")
print()

# Connect to Turso
print("🔄 Connecting to Turso...")
conn = libsql.connect(db_url, auth_token=auth_token)
cursor = conn.cursor()

print("✅ Connected successfully!")
print()

# Drop all existing tables
print("🔄 Dropping existing tables...")
print()

# Disable foreign key constraints temporarily
cursor.execute("PRAGMA foreign_keys = OFF")

# Get all table names
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
tables = cursor.fetchall()

if tables:
    for table in tables:
        table_name = table[0]
        cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
        print(f"✅ Dropped table: {table_name}")
    conn.commit()
    print()
else:
    print("No existing tables found.")
    print()

# Re-enable foreign key constraints
cursor.execute("PRAGMA foreign_keys = ON")

# Read schema file
schema_file = os.path.join(os.path.dirname(__file__), 'turso_schema.sql')
print(f"📄 Reading schema from: {schema_file}")

try:
    with open(schema_file, 'r') as f:
        schema_sql = f.read()

    print("✅ Schema file loaded successfully!")
    print()

    # Remove comment lines from the schema
    print("🔄 Parsing SQL statements...")
    print()

    # Remove comment lines (lines starting with --)
    lines = schema_sql.split('\n')
    cleaned_lines = [line for line in lines if not line.strip().startswith('--')]
    cleaned_sql = '\n'.join(cleaned_lines)

    # Split by semicolon
    statements = [stmt.strip() for stmt in cleaned_sql.split(';') if stmt.strip()]

    # Separate CREATE TABLE and CREATE INDEX statements
    table_statements = []
    index_statements = []

    for statement in statements:
        # Skip empty statements
        if not statement:
            continue

        if 'CREATE TABLE' in statement.upper():
            table_statements.append(statement)
        elif 'CREATE INDEX' in statement.upper() or 'CREATE UNIQUE INDEX' in statement.upper():
            index_statements.append(statement)

    # Execute CREATE TABLE statements first
    print("🔄 Creating tables...")
    print()

    table_count = 0
    for statement in table_statements:
        cursor.execute(statement)
        table_count += 1
        # Extract table name for logging
        table_name = statement.split('CREATE TABLE IF NOT EXISTS')[1].split('(')[0].strip()
        print(f"✅ Created table: {table_name}")

    # Then execute CREATE INDEX statements
    print()
    print("🔄 Creating indexes...")
    print()

    index_count = 0
    for statement in index_statements:
        try:
            cursor.execute(statement)
            index_count += 1
        except Exception as e:
            print(f"❌ Error creating index: {e}")
            print(f"Statement: {statement[:100]}...")
            raise

    conn.commit()

    print()
    print("=" * 80)
    print("✅ DATABASE INITIALIZATION COMPLETE!")
    print("=" * 80)
    print()
    print(f"📊 Summary:")
    print(f"   - Tables created: {table_count}")
    print(f"   - Indexes created: {index_count}")
    print()
    print("Next steps:")
    print("1. Run seed_admin_packages.py to create admin user and packages")
    print("2. Run seed_courses.py to populate course data")
    print()

except FileNotFoundError:
    print(f"❌ Error: Schema file not found at {schema_file}")
    print("Please ensure turso_schema.sql exists in the backend directory.")
except Exception as e:
    print(f"❌ Error executing schema: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()
finally:
    cursor.close()
    conn.close()

