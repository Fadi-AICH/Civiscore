from typing import Any, Dict, Optional, Union

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get a user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user"""
    try:
        # Hash the password
        hashed_password = get_password_hash(user.password)
        
        # Create user object with is_active from user input or default to True
        db_user = User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password,
            is_active=user.is_active if user.is_active is not None else True
        )
        
        # Add to database
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
    except Exception as e:
        db.rollback()
        # Re-raise the exception after rollback
        raise e


# Les fonctions verify_password et get_password_hash sont maintenant importées depuis app.core.security
