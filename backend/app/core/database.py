from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create database engine with appropriate settings for SQLite, LibSQL (Turso), or PostgreSQL
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite-specific configuration
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
elif settings.DATABASE_URL.startswith("libsql"):
    # Turso LibSQL configuration
    # Format: libsql://[database-name].turso.io?authToken=[token]
    # Or use TURSO_DATABASE_URL and TURSO_AUTH_TOKEN separately
    import libsql_experimental as libsql
    from sqlalchemy.pool import StaticPool

    # Wrapper class to add missing methods
    class LibSQLConnectionWrapper:
        def __init__(self, conn):
            self._conn = conn

        def __getattr__(self, name):
            # Add dummy create_function method
            if name == 'create_function':
                return lambda *args, **kwargs: None
            return getattr(self._conn, name)

        def __enter__(self):
            return self

        def __exit__(self, *args):
            return self._conn.__exit__(*args)

    # Extract database URL and auth token
    db_url = settings.TURSO_DATABASE_URL if hasattr(settings, 'TURSO_DATABASE_URL') else settings.DATABASE_URL
    auth_token = settings.TURSO_AUTH_TOKEN if hasattr(settings, 'TURSO_AUTH_TOKEN') else None

    # Create connection URL for SQLAlchemy
    if auth_token:
        # Use libsql connector with auth token
        def creator():
            conn = libsql.connect(db_url, auth_token=auth_token)
            return LibSQLConnectionWrapper(conn)

        engine = create_engine(
            "sqlite://",  # Dummy URL for SQLAlchemy
            creator=creator,
            poolclass=StaticPool,
            connect_args={"check_same_thread": False}
        )
    else:
        # Fallback to direct URL (if auth token is in URL)
        engine = create_engine(
            settings.DATABASE_URL,
            connect_args={"check_same_thread": False}
        )
else:
    # PostgreSQL-specific configuration
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


# Dependency to get database session
def get_db():
    """
    Database session dependency for FastAPI routes
    Usage: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

