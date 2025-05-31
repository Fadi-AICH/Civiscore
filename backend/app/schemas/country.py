from typing import Optional, List

from pydantic import BaseModel, Field


# Base Country schema (shared properties)
class CountryBase(BaseModel):
    name: str
    region: str


# Properties to receive via API on creation
class CountryCreate(CountryBase):
    pass


# Properties to return via API
class CountryOut(CountryBase):
    id: int

    class Config:
        orm_mode = True
