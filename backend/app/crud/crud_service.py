from typing import Any, Dict, Optional, Union, List, Tuple

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc, desc, func
from sqlalchemy.sql.expression import or_

from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate


def get_services(
    db: Session, 
    page: int = 1,
    limit: int = 10,
    keyword: Optional[str] = None,
    country_id: Optional[int] = None,
    category: Optional[str] = None,
    min_rating: Optional[float] = None,
    sort_by: str = "id",
    order: str = "asc",
    include_country: bool = False
) -> Tuple[List[Service], int]:
    """Get all services with optional filtering, sorting and pagination
    
    Args:
        db: Database session
        page: Page number (1-indexed)
        limit: Number of items per page
        keyword: Search term for service name
        country_id: Filter by country ID
        category: Filter by service category
        min_rating: Filter by minimum rating
        sort_by: Field to sort by (id, name, category, rating)
        order: Sort order (asc or desc)
        include_country: Whether to include country details
        
    Returns:
        Tuple of (list of services, total count)
    """
    # Calculate offset from page and limit
    offset = (page - 1) * limit
    
    # Start with base query
    if include_country:
        query = db.query(Service).options(joinedload(Service.country))
    else:
        query = db.query(Service)
    
    # Apply filters
    if keyword:
        search_term = f"%{keyword}%"
        query = query.filter(Service.name.ilike(search_term))
    
    if country_id is not None:
        query = query.filter(Service.country_id == country_id)
    
    if category:
        query = query.filter(Service.category == category)
    
    if min_rating is not None:
        query = query.filter(Service.rating >= min_rating)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply sorting
    if sort_by:
        # Ensure sort_by is a valid column
        valid_columns = ["id", "name", "category", "rating"]
        if sort_by not in valid_columns:
            sort_by = "id"  # Default to id if invalid column
            
        sort_column = getattr(Service, sort_by)
        if order.lower() == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
    
    # Apply pagination
    query = query.offset(offset).limit(limit)
    
    return query.all(), total


def get_service_by_id(db: Session, service_id: int, include_country: bool = False) -> Optional[Service]:
    """Get a service by ID with optional country details"""
    query = db.query(Service)
    
    if include_country:
        query = query.options(joinedload(Service.country))
    
    return query.filter(Service.id == service_id).first()


def create_service(db: Session, service: ServiceCreate) -> Service:
    """Create a new service"""
    db_service = Service(
        name=service.name,
        category=service.category,
        country_id=service.country_id,
        rating=service.rating if service.rating is not None else 0.0
    )
    
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    
    return db_service


def update_service_rating(db: Session, service_id: int, new_rating: float) -> Optional[Service]:
    """Update a service's rating"""
    db_service = get_service_by_id(db, service_id)
    if not db_service:
        return None
    
    db_service.rating = new_rating
    db.commit()
    db.refresh(db_service)
    
    return db_service


def update_service(db: Session, service_id: int, service_update: ServiceUpdate) -> Optional[Service]:
    """Update a service's details"""
    db_service = get_service_by_id(db, service_id)
    if not db_service:
        return None
    
    # Update fields if provided in the update schema
    update_data = service_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        # Skip rating field as it should be updated through a separate endpoint
        if field != "rating" and value is not None:
            setattr(db_service, field, value)
    
    try:
        db.commit()
        db.refresh(db_service)
        return db_service
    except Exception as e:
        db.rollback()
        raise e


def delete_service(db: Session, service_id: int) -> bool:
    """Delete a service by ID
    
    Args:
        db: Database session
        service_id: ID of the service to delete
        
    Returns:
        bool: True if service was deleted, False if service was not found
    """
    db_service = get_service_by_id(db, service_id)
    if not db_service:
        return False
    
    try:
        db.delete(db_service)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise e
