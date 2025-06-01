from typing import List, Optional, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud.crud_service import get_services, get_service_by_id
from app.models.user import User
from app.schemas.service import ServiceOut, ServiceWithCountry
from app.schemas.pagination import PaginatedResponse

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[ServiceOut])
def list_services(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Number of items per page"),
    keyword: Optional[str] = Query(None, description="Search term for service name"),
    category: Optional[str] = Query(None, description="Filter by service category"),
    country_id: Optional[int] = Query(None, description="Filter by country ID"),
    sort_by: str = Query("id", description="Field to sort by (id, name, category, rating)"),
    order: str = Query("asc", description="Sort order (asc or desc)")
) -> Any:
    """
    List services with filtering, sorting and pagination.
    
    - **keyword**: Search term for service name
    - **category**: Filter by service category
    - **country_id**: Filter by country ID
    - **page**: Page number (1-indexed)
    - **limit**: Number of items per page
    - **sort_by**: Field to sort by (id, name, category, rating)
    - **order**: Sort order (asc or desc)
    """
    try:
        # Get services with pagination and filtering
        services, total = get_services(
            db=db,
            page=page,
            limit=limit,
            keyword=keyword,
            category=category,
            country_id=country_id,
            sort_by=sort_by,
            order=order
        )
        
        # Return paginated response
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "items": services
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while retrieving services: {str(e)}"
        )


@router.get("/{service_id}", response_model=ServiceWithCountry)
def get_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a specific service by ID with country details
    """
    service = get_service_by_id(db, service_id=service_id, include_country=True)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    return service
