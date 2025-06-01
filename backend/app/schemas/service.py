from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict
from app.schemas.country import CountryOut
from app.schemas.utils import UUIDType


# Base Service schema (shared properties)
class ServiceBase(BaseModel):
    name: str
    category: str
    rating: Optional[float] = 0.0


# Properties to receive via API on creation
class ServiceCreate(ServiceBase, UUIDType):
    country_id: UUID


# Properties to receive via API on update
class ServiceUpdate(BaseModel, UUIDType):
    name: Optional[str] = None
    category: Optional[str] = None
    country_id: Optional[UUID] = None


# Properties to return via API
class ServiceOut(ServiceBase, UUIDType):
    id: UUID
    country_id: UUID
    rating: float = 0.0
    
    model_config = ConfigDict(from_attributes=True)


# Service with country details
class ServiceWithCountry(ServiceOut):
    country: CountryOut
    
    model_config = ConfigDict(from_attributes=True)
