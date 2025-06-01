from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict
from app.schemas.utils import UUIDType


# Base Country schema (shared properties)
class CountryBase(BaseModel):
    name: str
    region: str


# Properties to receive via API on creation
class CountryCreate(CountryBase):
    pass


# Properties to receive via API on update
class CountryUpdate(BaseModel):
    name: str


# Properties to return via API
class CountryOut(CountryBase, UUIDType):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# Paginated response for countries
class CountryPagination(BaseModel):
    total: int
    page: int
    limit: int
    items: List[CountryOut]
