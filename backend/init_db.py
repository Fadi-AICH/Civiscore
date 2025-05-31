import logging
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine, Base
from app.models import user, country, service, evaluation
from app.schemas.user import UserCreate
from app.crud.crud_auth import create_user
from app.crud.crud_country import create_country
from app.crud.crud_service import create_service
from app.schemas.country import CountryCreate
from app.schemas.service import ServiceCreate

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db() -> None:
    """Initialize database with sample data"""
    db = SessionLocal()
    try:
        # Create tables
        Base.metadata.create_all(bind=engine)
        
        # Check if database is already initialized
        user_exists = db.query(user.User).first()
        if user_exists:
            logger.info("Database already contains data, skipping initialization")
            return
        
        # Create sample users
        logger.info("Creating sample users")
        user1 = create_user(
            db=db,
            user=UserCreate(
                username="testuser",
                email="test@example.com",
                password="password123",
                is_active=True
            )
        )
        
        user2 = create_user(
            db=db,
            user=UserCreate(
                username="admin",
                email="admin@example.com",
                password="admin123",
                is_active=True
            )
        )
        
        # Create sample countries
        logger.info("Creating sample countries")
        country1 = create_country(
            db=db,
            country=CountryCreate(
                name="United States",
                region="North America"
            )
        )
        
        country2 = create_country(
            db=db,
            country=CountryCreate(
                name="France",
                region="Europe"
            )
        )
        
        country3 = create_country(
            db=db,
            country=CountryCreate(
                name="Japan",
                region="Asia"
            )
        )
        
        # Create sample services
        logger.info("Creating sample services")
        service1 = create_service(
            db=db,
            service=ServiceCreate(
                name="Healthcare",
                category="Public Health",
                country_id=country1.id,
                rating=0.0
            )
        )
        
        service2 = create_service(
            db=db,
            service=ServiceCreate(
                name="Education",
                category="Public Education",
                country_id=country1.id,
                rating=0.0
            )
        )
        
        service3 = create_service(
            db=db,
            service=ServiceCreate(
                name="Transportation",
                category="Public Transport",
                country_id=country2.id,
                rating=0.0
            )
        )
        
        service4 = create_service(
            db=db,
            service=ServiceCreate(
                name="Healthcare",
                category="Public Health",
                country_id=country3.id,
                rating=0.0
            )
        )
        
        logger.info("Sample data created successfully")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    logger.info("Creating initial data")
    init_db()
    logger.info("Initial data created")
