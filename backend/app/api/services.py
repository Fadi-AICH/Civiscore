from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud.crud_service import get_services, get_service_by_id, create_service, update_service, delete_service
from app.models.user import User
from app.schemas.service import ServiceOut, ServiceWithCountry, ServiceCreate, ServiceUpdate

router = APIRouter()


@router.post("/", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
def create_service_route(
    service_in: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new service (requires authentication)
    """
    try:
        # Create new service
        service = create_service(db=db, service=service_in)
        return service
    except Exception as e:
        # Log the error for debugging
        print(f"Error creating service: {str(e)}")
        # Return a generic error message to the client
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the service. Please try again later."
        )


@router.get("/", response_model=List[ServiceOut])
def read_services(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    country_id: Optional[int] = None,
    category: Optional[str] = None,
    min_rating: Optional[float] = None,
    region: Optional[str] = None,
    sort_by: Optional[str] = "name",
    sort_desc: bool = False,
    include_country: bool = False,
) -> Any:
    """
    Retrieve services with optional filtering by country, category, rating, and region
    """
    # If region is provided, we need to filter by countries in that region
    # This will be handled in the API layer since it requires joining with countries
    
    services = get_services(
        db=db,
        skip=skip,
        limit=limit,
        country_id=country_id,
        category=category,
        min_rating=min_rating,
        sort_by=sort_by,
        sort_desc=sort_desc,
        include_country=include_country
    )
    
    return services


@router.get("/{service_id}", response_model=ServiceWithCountry)
def read_service(
    service_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get service by ID with country details
    """
    service = get_service_by_id(db=db, service_id=service_id, include_country=True)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    return service


@router.put("/{service_id}", response_model=ServiceOut)
def update_service_route(
    service_id: int,
    service_update: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a service by ID (requires authentication)
    """
    # First check if service exists
    service = get_service_by_id(db=db, service_id=service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    try:
        # Update service
        updated_service = update_service(db=db, service_id=service_id, service_update=service_update)
        return updated_service
    except Exception as e:
        # Log the error for debugging
        print(f"Error updating service: {str(e)}")
        # Return a generic error message to the client
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the service. Please try again later."
        )


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service_route(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> None:
    """
    Delete a service by ID (requires authentication)
    """
    try:
        # Delete service
        deleted = delete_service(db=db, service_id=service_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found"
            )
        # Pour 204 No Content, on ne retourne rien
        return None
    except Exception as e:
        # Log the error for debugging
        print(f"Error deleting service: {str(e)}")
        # Return a generic error message to the client
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the service. Please try again later."
        )
