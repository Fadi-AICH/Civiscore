from typing import Optional, List, Dict, Any
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, ConfigDict


# Base User schema (shared properties)
class UserBase(BaseModel):
    username: str
    email: EmailStr
    is_active: Optional[bool] = True


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str


# Properties stored in DB
class UserInDB(UserBase):
    id: int
    hashed_password: str
    
    model_config = ConfigDict(from_attributes=True)


# Properties to return via API
class UserOut(UserBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)
