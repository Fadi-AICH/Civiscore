from typing import Any, Dict, Optional, Union, List

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc, desc

from app.models.service import Service
from app.schemas.service import ServiceCreate


def get_services(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    country_id: Optional[int] = None,
    category: Optional[str] = None,
    min_rating: Optional[float] = None,
    sort_by: Optional[str] = "name",
    sort_desc: bool = False,
    include_country: bool = False
) -> List[Service]:
    """Get all services with optional filtering and sorting"""
    # Start with base query
    if include_country:
        query = db.query(Service).options(joinedload(Service.country))
    else:
        query = db.query(Service)
    
    # Apply filters
    if country_id is not None:
        query = query.filter(Service.country_id == country_id)
    
    if category:
        query = query.filter(Service.category == category)
    
    if min_rating is not None:
        query = query.filter(Service.rating >= min_rating)
    
    # Apply sorting
    if sort_by:
        sort_column = getattr(Service, sort_by, Service.name)
        if sort_desc:
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    return query.all()


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
