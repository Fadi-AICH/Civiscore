from typing import Optional, List

from pydantic import BaseModel, Field, ConfigDict
from app.schemas.country import CountryOut


# Base Service schema (shared properties)
class ServiceBase(BaseModel):
    name: str
    category: str
    rating: Optional[float] = 0.0


# Properties to receive via API on creation
class ServiceCreate(ServiceBase):
    country_id: int


# Properties to receive via API on update
class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    country_id: Optional[int] = None


# Properties to return via API
class ServiceOut(ServiceBase):
    id: int
    country_id: int
    
    model_config = ConfigDict(from_attributes=True)


# Service with country details
class ServiceWithCountry(ServiceOut):
    country: CountryOut
    
    model_config = ConfigDict(from_attributes=True)
