from typing import Any, Dict, Optional, Union, List, Tuple
from uuid import UUID

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc, desc, func
from sqlalchemy.sql.expression import or_

from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate


def get_services(db: Session, skip: int = 0, limit: int = 100, include_country: bool = False):
    query = db.query(Service)
    if include_country:
        query = query.join(Service.country).options(joinedload(Service.country))
    return query.offset(skip).limit(limit).all()


def get_service_by_id(db: Session, service_id: UUID, include_country: bool = False) -> Optional[Service]:
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


def update_service_rating(db: Session, service_id: UUID, new_rating: float) -> Optional[Service]:
    """Update a service's rating"""
    db_service = get_service_by_id(db, service_id)
    if not db_service:
        return None
    
    db_service.rating = new_rating
    db.commit()
    db.refresh(db_service)
    
    return db_service


def update_service(db: Session, service_id: UUID, service_update: ServiceUpdate) -> Optional[Service]:
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


def delete_service(db: Session, service_id: UUID) -> bool:
    """
    Delete a service by ID
    
    Args:
        db: Database session
        service_id: ID of the service to delete
        
    Returns:
        bool: True if service was deleted, False if service was not found
    """
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        return False
    
    db.delete(service)
    db.commit()
    return True


def get_service_by_name_and_address(db: Session, name: str, address: str) -> Optional[Service]:
    """
    Get a service by name and address to avoid duplicates
    
    Args:
        db: Database session
        name: Name of the service
        address: Address of the service
        
    Returns:
        Service object if found, None otherwise
    """
    return db.query(Service).filter(
        Service.name == name,
        Service.address == address
    ).first()
