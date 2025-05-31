from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from urllib.parse import urlparse

from app.core.config import settings

# Determine database type from URL
def get_engine_args():
    """Return appropriate engine arguments based on database type"""
    if not settings.DATABASE_URL:
        # Default to SQLite if no URL is provided
        return {"connect_args": {"check_same_thread": False}}
    
    parsed_url = urlparse(settings.DATABASE_URL)
    if parsed_url.scheme == "sqlite":
        return {"connect_args": {"check_same_thread": False}}
    return {}

# Create SQLAlchemy engine
engine = create_engine(
    settings.DATABASE_URL or "sqlite:///./civiscore.db",
    **get_engine_args()
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    """
    Dependency function to get a database session
    
    Usage in FastAPI routes:
    ```
    @app.get("/items/")
    def read_items(db: Session = Depends(get_db)):
        ...
    ```
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
