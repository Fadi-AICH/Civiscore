from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, get_current_admin_user
from app.crud.crud_auth import (
    get_users, 
    get_user_by_id, 
    get_user_by_email, 
    update_user, 
    delete_user
)
from app.models.user import User, UserRole
from app.schemas.user import UserOut, UserUpdate, UserPagination

router = APIRouter()


@router.get("/", response_model=UserPagination)
def read_users(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by username or email"),
    role: Optional[str] = Query(None, description="Filter by role (admin or user)"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    sort_by: str = Query("id", description="Sort by field"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)")
) -> Any:
    """
    Retrieve users with pagination, filtering and sorting.
    
    Only accessible to admin users.
    """
    users, total = get_users(
        db=db,
        page=page,
        limit=limit,
        search=search,
        role=role,
        is_active=is_active,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    return {
        "items": users,
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get("/{user_id}", response_model=UserOut)
def read_user(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_id: UUID
) -> Any:
    """
    Get a specific user by id.
    
    Regular users can only access their own user information.
    Admin users can access any user's information.
    """
    # Check if user is trying to access their own info or is an admin
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this user's information"
        )
    
    user = get_user_by_id(db=db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.put("/{user_id}", response_model=UserOut)
def update_user_route(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    user_id: UUID,
    user_in: UserUpdate
) -> Any:
    """
    Update a user.
    
    Regular users can only update their own information and cannot change their role.
    Admin users can update any user and change roles.
    """
    # Check if user is trying to update their own info or is an admin
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this user"
        )
    
    # Regular users cannot change their role
    if current_user.role != UserRole.ADMIN and user_in.role is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Regular users cannot change their role"
        )
    
    # Check if user exists
    db_user = get_user_by_id(db=db, user_id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if email is being updated and if it's already taken
    if user_in.email is not None and user_in.email != db_user.email:
        if get_user_by_email(db=db, email=user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Check if username is being updated and if it's already taken
    if user_in.username is not None and user_in.username != db_user.username:
        existing_username = db.query(User).filter(User.username == user_in.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    try:
        updated_user = update_user(db=db, user_id=user_id, user_in=user_in)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return updated_user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while updating the user: {str(e)}"
        )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_route(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    user_id: UUID
) -> None:
    """
    Delete a user.
    
    Only accessible to admin users.
    Will fail if the user has evaluations.
    """
    # Prevent admin from deleting themselves
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin users cannot delete their own account"
        )
    
    success, error_message = delete_user(db=db, user_id=user_id)
    
    if not success:
        if error_message == "User not found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_message
            )
        elif "Cannot delete user" in error_message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_message
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred while deleting the user: {error_message}"
            )
    # No return value for 204 response
