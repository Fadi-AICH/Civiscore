from typing import Any, Dict, Optional, Union, List, Tuple
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, func

from app.models.country import Country
from app.models.service import Service
from app.schemas.country import CountryCreate, CountryUpdate


def get_countries(
    db: Session, 
    page: int = 1, 
    limit: int = 10,
    region: Optional[str] = None,
    sort_by: str = "id",
    order: str = "asc"
) -> Tuple[List[Country], int]:
    """
    Get all countries with optional filtering, sorting and pagination
    
    Args:
        db: Database session
        page: Page number (1-indexed)
        limit: Number of items per page
        region: Filter by region
        sort_by: Field to sort by (id, name, region)
        order: Sort order (asc or desc)
        
    Returns:
        Tuple of (list of countries, total count)
    """
    # Calculate offset from page and limit
    offset = (page - 1) * limit
    
    # Start with base query
    query = db.query(Country)
    
    # Apply region filter if provided
    if region:
        query = query.filter(Country.region == region)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply sorting
    if sort_by:
        # Ensure sort_by is a valid column
        valid_columns = ["id", "name", "region"]
        if sort_by not in valid_columns:
            sort_by = "id"  # Default to id if invalid column
            
        sort_column = getattr(Country, sort_by)
        if order.lower() == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
    
    # Apply pagination
    query = query.offset(offset).limit(limit)
    
    return query.all(), total


def get_country_by_id(db: Session, country_id: UUID) -> Optional[Country]:
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


def update_country(
    db: Session, country_id: UUID, country_update: CountryUpdate
) -> Optional[Country]:
    """
    Update a country's name
    
    Args:
        db: Database session
        country_id: ID of the country to update
        country_update: New country data
        
    Returns:
        Updated country or None if country not found
    """
    db_country = get_country_by_id(db, country_id)
    if not db_country:
        return None
    
    # Update name
    db_country.name = country_update.name
    
    try:
        db.commit()
        db.refresh(db_country)
        return db_country
    except Exception as e:
        db.rollback()
        raise e


def delete_country(db: Session, country_id: UUID) -> Tuple[bool, Optional[str]]:
    """
    Delete a country by ID if it's not used by any service
    
    Args:
        db: Database session
        country_id: ID of the country to delete
        
    Returns:
        Tuple of (success, error_message)
        - success: True if country was deleted, False otherwise
        - error_message: None if successful, error message if failed
    """
    db_country = get_country_by_id(db, country_id)
    if not db_country:
        return False, "Country not found"
    
    # Check if country is used by any service
    service_count = db.query(func.count(Service.id)).filter(Service.country_id == country_id).scalar()
    if service_count > 0:
        return False, f"Cannot delete country: it is used by {service_count} service(s)"
    
    try:
        db.delete(db_country)
        db.commit()
        return True, None
    except Exception as e:
        db.rollback()
        return False, str(e)
