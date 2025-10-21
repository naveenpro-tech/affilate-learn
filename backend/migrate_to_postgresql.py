#!/usr/bin/env python3
"""
PostgreSQL Migration Script
Migrates data from SQLite to PostgreSQL with one command
"""

import os
import sys
import sqlite3
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
import getpass
from datetime import datetime

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_success(message):
    print(f"{GREEN}✅ {message}{RESET}")

def print_error(message):
    print(f"{RED}❌ {message}{RESET}")

def print_warning(message):
    print(f"{YELLOW}⚠️  {message}{RESET}")

def print_info(message):
    print(f"{BLUE}ℹ️  {message}{RESET}")

def print_header(message):
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}{message.center(80)}{RESET}")
    print(f"{BLUE}{'='*80}{RESET}\n")

class PostgreSQLMigration:
    def __init__(self):
        self.sqlite_db = "affiliate_learning.db"
        self.postgres_url = None
        self.sqlite_engine = None
        self.postgres_engine = None
        
    def check_sqlite_exists(self):
        """Check if SQLite database exists"""
        print_info("Checking SQLite database...")
        if not os.path.exists(self.sqlite_db):
            print_error(f"SQLite database not found: {self.sqlite_db}")
            return False
        print_success(f"SQLite database found: {self.sqlite_db}")
        return True
    
    def get_postgres_credentials(self):
        """Get PostgreSQL credentials from user"""
        print_header("PostgreSQL Configuration")
        print_info("Please provide PostgreSQL connection details:")
        
        host = input(f"Host (default: localhost): ").strip() or "localhost"
        port = input(f"Port (default: 5432): ").strip() or "5432"
        database = input(f"Database name (default: affiliate_learning_db): ").strip() or "affiliate_learning_db"
        username = input(f"Username (default: affiliate_user): ").strip() or "affiliate_user"
        password = getpass.getpass("Password: ")
        
        self.postgres_url = f"postgresql://{username}:{password}@{host}:{port}/{database}"
        print_success("PostgreSQL configuration saved")
        return True
    
    def test_postgres_connection(self):
        """Test PostgreSQL connection"""
        print_info("Testing PostgreSQL connection...")
        try:
            self.postgres_engine = create_engine(self.postgres_url)
            with self.postgres_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print_success("PostgreSQL connection successful")
            return True
        except Exception as e:
            print_error(f"PostgreSQL connection failed: {str(e)}")
            return False
    
    def create_tables(self):
        """Create tables in PostgreSQL using SQLAlchemy models"""
        print_info("Creating tables in PostgreSQL...")
        try:
            # Import models to create tables
            from app.database import Base
            from app.models import user, package, course, module, topic, video
            from app.models import user_package, user_course_purchase, payment
            from app.models import video_progress, referral, wallet, payout
            from app.models import certificate, notification, reward
            from app.models import studio_creation, studio_comment, studio_like
            
            # Create all tables
            Base.metadata.create_all(bind=self.postgres_engine)
            print_success("Tables created successfully")
            return True
        except Exception as e:
            print_error(f"Failed to create tables: {str(e)}")
            return False
    
    def get_table_names(self):
        """Get all table names from SQLite"""
        try:
            self.sqlite_engine = create_engine(f"sqlite:///{self.sqlite_db}")
            inspector = inspect(self.sqlite_engine)
            tables = inspector.get_table_names()
            # Filter out alembic version table if exists
            tables = [t for t in tables if t != 'alembic_version']
            return tables
        except Exception as e:
            print_error(f"Failed to get table names: {str(e)}")
            return []
    
    def migrate_table_data(self, table_name):
        """Migrate data from SQLite table to PostgreSQL"""
        try:
            # Read data from SQLite
            sqlite_session = sessionmaker(bind=self.sqlite_engine)()
            result = sqlite_session.execute(text(f"SELECT * FROM {table_name}"))
            rows = result.fetchall()
            columns = result.keys()
            
            if not rows:
                print_warning(f"Table '{table_name}' is empty, skipping...")
                return True
            
            # Insert data into PostgreSQL
            postgres_session = sessionmaker(bind=self.postgres_engine)()
            
            for row in rows:
                # Convert row to dict
                row_dict = dict(zip(columns, row))
                
                # Build INSERT query
                cols = ', '.join(row_dict.keys())
                placeholders = ', '.join([f":{key}" for key in row_dict.keys()])
                query = f"INSERT INTO {table_name} ({cols}) VALUES ({placeholders})"
                
                try:
                    postgres_session.execute(text(query), row_dict)
                except Exception as e:
                    # Handle duplicate key errors gracefully
                    if "duplicate key" in str(e).lower():
                        continue
                    else:
                        raise
            
            postgres_session.commit()
            print_success(f"Migrated {len(rows)} rows from '{table_name}'")
            return True
            
        except Exception as e:
            print_error(f"Failed to migrate table '{table_name}': {str(e)}")
            return False
    
    def update_sequences(self):
        """Update PostgreSQL sequences to match current max IDs"""
        print_info("Updating PostgreSQL sequences...")
        try:
            postgres_session = sessionmaker(bind=self.postgres_engine)()
            tables = self.get_table_names()
            
            for table in tables:
                try:
                    # Get max ID
                    result = postgres_session.execute(text(f"SELECT MAX(id) FROM {table}"))
                    max_id = result.scalar()
                    
                    if max_id:
                        # Update sequence
                        sequence_name = f"{table}_id_seq"
                        postgres_session.execute(text(f"SELECT setval('{sequence_name}', {max_id})"))
                except Exception:
                    # Some tables might not have id column or sequence
                    continue
            
            postgres_session.commit()
            print_success("Sequences updated successfully")
            return True
        except Exception as e:
            print_error(f"Failed to update sequences: {str(e)}")
            return False
    
    def verify_migration(self):
        """Verify data migration by comparing row counts"""
        print_header("Verification")
        print_info("Comparing row counts...")
        
        sqlite_session = sessionmaker(bind=self.sqlite_engine)()
        postgres_session = sessionmaker(bind=self.postgres_engine)()
        
        tables = self.get_table_names()
        all_match = True
        
        print(f"\n{'Table':<30} {'SQLite':<15} {'PostgreSQL':<15} {'Status':<10}")
        print("-" * 70)
        
        for table in tables:
            try:
                sqlite_count = sqlite_session.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
                postgres_count = postgres_session.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
                
                status = "✅ OK" if sqlite_count == postgres_count else "❌ MISMATCH"
                if sqlite_count != postgres_count:
                    all_match = False
                
                print(f"{table:<30} {sqlite_count:<15} {postgres_count:<15} {status:<10}")
            except Exception as e:
                print(f"{table:<30} {'ERROR':<15} {'ERROR':<15} {'❌ ERROR':<10}")
                all_match = False
        
        print("-" * 70)
        
        if all_match:
            print_success("\nAll tables migrated successfully!")
        else:
            print_warning("\nSome tables have mismatched row counts. Please review.")
        
        return all_match
    
    def update_env_file(self):
        """Update .env file with PostgreSQL connection string"""
        print_info("Updating .env file...")
        try:
            env_file = ".env"
            
            # Read current .env
            if os.path.exists(env_file):
                with open(env_file, 'r') as f:
                    lines = f.readlines()
            else:
                lines = []
            
            # Update DATABASE_URL
            updated = False
            for i, line in enumerate(lines):
                if line.startswith('DATABASE_URL='):
                    lines[i] = f"DATABASE_URL={self.postgres_url}\n"
                    updated = True
                    break
            
            if not updated:
                lines.append(f"DATABASE_URL={self.postgres_url}\n")
            
            # Write back
            with open(env_file, 'w') as f:
                f.writelines(lines)
            
            print_success(".env file updated with PostgreSQL connection")
            return True
        except Exception as e:
            print_error(f"Failed to update .env file: {str(e)}")
            return False
    
    def run(self):
        """Run the complete migration process"""
        print_header("PostgreSQL Migration Tool")
        print_info(f"Migration started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Step 1: Check SQLite
        if not self.check_sqlite_exists():
            return False
        
        # Step 2: Get PostgreSQL credentials
        if not self.get_postgres_credentials():
            return False
        
        # Step 3: Test PostgreSQL connection
        if not self.test_postgres_connection():
            return False
        
        # Step 4: Create tables
        if not self.create_tables():
            return False
        
        # Step 5: Migrate data
        print_header("Data Migration")
        tables = self.get_table_names()
        print_info(f"Found {len(tables)} tables to migrate")
        
        for table in tables:
            print_info(f"Migrating table: {table}")
            if not self.migrate_table_data(table):
                print_warning(f"Failed to migrate {table}, continuing...")
        
        # Step 6: Update sequences
        if not self.update_sequences():
            print_warning("Failed to update sequences, but migration can continue")
        
        # Step 7: Verify migration
        self.verify_migration()
        
        # Step 8: Update .env file
        if not self.update_env_file():
            print_warning(".env file not updated, please update manually")
        
        print_header("Migration Complete")
        print_success(f"Migration completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print_info("\nNext steps:")
        print("  1. Restart your backend server")
        print("  2. Test the application thoroughly")
        print("  3. Backup your PostgreSQL database")
        
        return True

if __name__ == "__main__":
    migration = PostgreSQLMigration()
    success = migration.run()
    sys.exit(0 if success else 1)

