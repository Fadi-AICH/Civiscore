from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud.crud_country import get_countries, get_country_by_id
from app.schemas.country import CountryOut

router = APIRouter()


@router.get("/", response_model=List[CountryOut])
def read_countries(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    region: Optional[str] = None,
    sort_by: Optional[str] = "name",
    sort_desc: bool = False,
) -> Any:
    """
    Retrieve countries with optional filtering and sorting
    """
    countries = get_countries(
        db=db, 
        skip=skip, 
        limit=limit, 
        region=region,
        sort_by=sort_by,
        sort_desc=sort_desc
    )
    return countries


@router.get("/{country_id}", response_model=CountryOut)
def read_country(
    country_id: int,
    db: Session = Depends(get_db),
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
