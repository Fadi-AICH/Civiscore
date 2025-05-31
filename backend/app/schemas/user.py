from typing import Optional, List
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


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

    class Config:
        orm_mode = True


# Properties to return via API
class UserOut(UserBase):
    id: int

    class Config:
        orm_mode = True
