from typing import Optional, List

from pydantic import BaseModel, Field
from app.schemas.country import CountryOut


# Base Service schema (shared properties)
class ServiceBase(BaseModel):
    name: str
    category: str
    rating: Optional[float] = 0.0


# Properties to receive via API on creation
class ServiceCreate(ServiceBase):
    country_id: int


# Properties to return via API
class ServiceOut(ServiceBase):
    id: int
    country_id: int
    
    class Config:
        orm_mode = True


# Service with country details
class ServiceWithCountry(ServiceOut):
    country: CountryOut
    
    class Config:
        orm_mode = True
