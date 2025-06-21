from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from urllib.parse import urlparse

from app.core.config import settings

# Determine database type from URL
def get_engine_args():
    """Return SQLAlchemy engine arguments based on the configured database URL.

    * For MySQL we enable `pool_pre_ping` so that stale connections are
      recycled automatically.
    * For SQLite (mainly used in local tests) we keep the `check_same_thread`
      flag for compatibility.

    The function will raise a ``ValueError`` if ``settings.DATABASE_URL`` is
    empty to avoid silently falling back to SQLite in production.
    """

    if not settings.DATABASE_URL:
        raise ValueError(
            "DATABASE_URL is not set. Please provide a valid MySQL connection "
            "string, e.g. 'mysql+pymysql://user:password@localhost:3306/civiscore'."
        )

    parsed_url = urlparse(settings.DATABASE_URL)

    # MySQL specific arguments
    if parsed_url.scheme.startswith("mysql"):
        # `pool_pre_ping` helps to gracefully handle dropped connections.
        # It issues a lightweight ping before each checkout.
        return {"pool_pre_ping": True}

    # SQLite specific arguments (used mainly for local development/tests)
    if parsed_url.scheme == "sqlite":
        return {"connect_args": {"check_same_thread": False}}

    # For any other database types return an empty configuration
    return {}

# Create SQLAlchemy engine configured for MySQL (or the DB specified in DATABASE_URL)
if not settings.DATABASE_URL:
    raise ValueError(
        "DATABASE_URL is not set. Please provide a valid MySQL connection string, "
        "e.g. mysql+pymysql://user:password@localhost:3306/civiscore"
    )

engine = create_engine(
    settings.DATABASE_URL,
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
