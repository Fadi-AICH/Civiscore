from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud.crud_country import (
    get_countries, 
    get_country_by_id, 
    get_country_by_name, 
    create_country, 
    update_country,
    delete_country
)
from app.models.user import User
from app.schemas.country import CountryCreate, CountryOut, CountryUpdate, CountryPagination

router = APIRouter()


@router.get("/", response_model=CountryPagination)
def read_countries(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Number of items per page"),
    region: Optional[str] = Query(None, description="Filter by region"),
    sort_by: str = Query("id", description="Field to sort by (id, name, region)"),
    order: str = Query("asc", description="Sort order (asc or desc)")
) -> Any:
    """
    Retrieve paginated list of countries with optional filtering and sorting
    
    - **page**: Page number (1-indexed)
    - **limit**: Number of items per page
    - **region**: Filter by region
    - **sort_by**: Field to sort by (id, name, region)
    - **order**: Sort order (asc or desc)
    """
    try:
        countries, total = get_countries(
            db=db,
            page=page,
            limit=limit,
            region=region,
            sort_by=sort_by,
            order=order
        )
        
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "items": countries
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while retrieving countries: {str(e)}"
        )


@router.get("/{country_id}", response_model=CountryOut)
def read_country(
    country_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get country by ID
    """
    country = get_country_by_id(db=db, country_id=country_id)
    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Country not found"
        )
    return country


@router.post("/", response_model=CountryOut, status_code=status.HTTP_201_CREATED)
def create_country_route(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    country_in: CountryCreate
) -> Any:
    """
    Create new country
    """
    # Check if country with same name already exists
    existing_country = get_country_by_name(db, name=country_in.name)
    if existing_country:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Country with name '{country_in.name}' already exists"
        )
    
    try:
        return create_country(db=db, country=country_in)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Country with this name already exists"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating the country: {str(e)}"
        )


@router.put("/{country_id}", response_model=CountryOut)
def update_country_route(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    country_id: UUID,
    country_in: CountryUpdate
) -> Any:
    """
    Update a country's name
    """
    # Check if country exists
    db_country = get_country_by_id(db, country_id=country_id)
    if not db_country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Country not found"
        )
    
    # Check if name is already taken by another country
    existing_country = get_country_by_name(db, name=country_in.name)
    if existing_country and existing_country.id != country_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Country with name '{country_in.name}' already exists"
        )
    
    try:
        updated_country = update_country(db=db, country_id=country_id, country_update=country_in)
        if not updated_country:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Country not found"
            )
        return updated_country
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Country with this name already exists"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while updating the country: {str(e)}"
        )


@router.delete("/{country_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_country_route(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    country_id: UUID
) -> None:
    """
    Delete a country
    
    Will fail if the country is used by any service
    """
    success, error_message = delete_country(db=db, country_id=country_id)
    
    if not success:
        if error_message == "Country not found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_message
            )
        elif "Cannot delete country" in error_message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_message
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred while deleting the country: {error_message}"
            )
    # No return value for 204 response
