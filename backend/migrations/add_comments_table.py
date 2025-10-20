"""
Migration script to add comments table
Run this script to create the comments table in the database
"""

from app.core.database import SessionLocal, engine
from app.models.comment import Comment
from app.core.database import Base
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_migration():
    """Create comments table"""
    try:
        logger.info("Creating comments table...")
        
        # Create all tables (will only create missing ones)
        Base.metadata.create_all(bind=engine)
        
        logger.info("✅ Comments table created successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error creating comments table: {e}")
        raise


if __name__ == "__main__":
    run_migration()

