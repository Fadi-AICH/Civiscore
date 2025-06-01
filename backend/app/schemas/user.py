from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.models.user import UserRole
from app.schemas.pagination import PaginatedResponse


class UserRoleEnum(str, Enum):
    ADMIN = "admin"
    USER = "user"


# Base User schema (shared properties)
class UserBase(BaseModel):
    username: str
    email: EmailStr
    is_active: Optional[bool] = True
    role: Optional[UserRoleEnum] = UserRoleEnum.USER


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str


# Properties to receive via API on update
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    role: Optional[UserRoleEnum] = None
    password: Optional[str] = None


# Properties stored in DB
class UserInDB(UserBase):
    id: int
    hashed_password: str
    
    model_config = ConfigDict(from_attributes=True)


# Properties to return via API
class UserOut(UserBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)


# Paginated response for users
class UserPagination(PaginatedResponse):
    items: List[UserOut]
