from typing import Any, Dict, Optional, Union, Tuple, List
from uuid import UUID

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: UUID) -> Optional[User]:
    """Get a user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_users(
    db: Session, 
    *, 
    page: int = 1, 
    limit: int = 10,
    search: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    sort_by: str = "id",
    sort_order: str = "asc"
) -> Tuple[List[User], int]:
    """Get users with pagination, filtering, and sorting"""
    query = db.query(User)
    
    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                User.username.ilike(search_term),
                User.email.ilike(search_term)
            )
        )
    
    if role:
        query = query.filter(User.role == role)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply sorting
    if sort_by and hasattr(User, sort_by):
        column = getattr(User, sort_by)
        if sort_order.lower() == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())
    
    # Apply pagination
    query = query.offset((page - 1) * limit).limit(limit)
    
    return query.all(), total


def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user"""
    try:
        # Hash the password
        hashed_password = get_password_hash(user.password)
        
        # Create user object with is_active from user input or default to True
        db_user = User(
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            hashed_password=hashed_password,
            is_active=user.is_active if user.is_active is not None else True,
            role=UserRole(user.role.value) if user.role is not None else UserRole.user
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


def update_user(
    db: Session, *, user_id: UUID, user_in: UserUpdate
) -> Optional[User]:
    """Update user information"""
    try:
        db_user = get_user_by_id(db, user_id)
        if not db_user:
            return None
        
        # Prepare update data
        update_data = user_in.model_dump(exclude_unset=True)
        
        # If password is being updated, hash it
        if "password" in update_data:
            hashed_password = get_password_hash(update_data["password"])
            update_data["hashed_password"] = hashed_password
            del update_data["password"]
        
        # Update user attributes
        for field, value in update_data.items():
            if hasattr(db_user, field):
                setattr(db_user, field, value)
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        raise e


def delete_user(db: Session, user_id: UUID) -> Tuple[bool, str]:
    """Delete a user"""
    try:
        user = get_user_by_id(db, user_id)
        if not user:
            return False, "User not found"
        
        # Check if user has evaluations
        if user.evaluations and len(user.evaluations) > 0:
            return False, f"Cannot delete user with ID {user_id} because it has {len(user.evaluations)} evaluations"
        
        db.delete(user)
        db.commit()
        return True, ""
    except Exception as e:
        db.rollback()
        return False, str(e)


# Les fonctions verify_password et get_password_hash sont maintenant importées depuis app.core.security
