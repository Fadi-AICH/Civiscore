from typing import Any, Dict, Optional, Union, List

from sqlalchemy.orm import Session
from sqlalchemy import asc, desc

from app.models.country import Country
from app.schemas.country import CountryCreate


def get_countries(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    region: Optional[str] = None,
    sort_by: Optional[str] = "name",
    sort_desc: bool = False
) -> List[Country]:
    """Get all countries with optional filtering and sorting"""
    query = db.query(Country)
    
    # Apply region filter if provided
    if region:
        query = query.filter(Country.region == region)
    
    # Apply sorting
    if sort_by:
        sort_column = getattr(Country, sort_by, Country.name)
        if sort_desc:
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    return query.all()


def get_country_by_id(db: Session, country_id: int) -> Optional[Country]:
    """Get a country by ID"""
    return db.query(Country).filter(Country.id == country_id).first()


def get_country_by_name(db: Session, name: str) -> Optional[Country]:
    """Get a country by name"""
    return db.query(Country).filter(Country.name == name).first()


def create_country(db: Session, country: CountryCreate) -> Country:
    """Create a new country"""
    db_country = Country(
        name=country.name,
        region=country.region
    )
    
    db.add(db_country)
    db.commit()
    db.refresh(db_country)
    
    return db_country
