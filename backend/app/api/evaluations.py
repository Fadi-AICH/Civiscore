from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud.crud_evaluation import create_evaluation, get_evaluations_by_service
from app.crud.crud_service import get_service_by_id
from app.models.user import User
from app.schemas.evaluation import EvaluationCreate, EvaluationOut, EvaluationWithDetails

router = APIRouter()


@router.post("/", response_model=EvaluationOut, status_code=status.HTTP_201_CREATED)
def create_evaluation_route(
    evaluation_in: EvaluationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create new evaluation for a service
    """
    # Check if service exists
    service = get_service_by_id(db, service_id=evaluation_in.service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Create evaluation
    evaluation = create_evaluation(
        db=db, 
        evaluation=evaluation_in, 
        user_id=current_user.id
    )
    
    return evaluation


@router.get("/{service_id}/list", response_model=List[EvaluationWithDetails])
def read_evaluations_by_service(
    service_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    include_user: bool = True,
) -> Any:
    """
    Retrieve evaluations for a specific service
    """
    # Check if service exists
    service = get_service_by_id(db, service_id=service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    evaluations = get_evaluations_by_service(
        db=db,
        service_id=service_id,
        skip=skip,
        limit=limit,
        include_user=include_user,
        include_service=True
    )
    
    return evaluations
