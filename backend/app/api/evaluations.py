from typing import Any, List, Optional, Dict
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status, Path, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_admin_user, get_db
from app.crud.crud_evaluation import (
    create_evaluation, get_evaluations, get_evaluation_by_id, 
    update_evaluation, delete_evaluation, get_evaluation_stats,
    check_user_has_evaluated_service
)
from app.crud.crud_service import get_service_by_id
from app.crud.crud_evaluation_criteria import (
    create_evaluation_criteria_score, get_evaluation_criteria_scores,
    calculate_overall_score
)
from app.models.user import User
from app.models.evaluation import EvaluationStatus
from app.schemas.evaluation import (
    EvaluationCreate, EvaluationUpdate, EvaluationOut, 
    EvaluationWithDetails, EvaluationPagination, EvaluationStats,
    SortOrder, DetailedEvaluationCreate, EvaluationCriteriaScoreOut
)

router = APIRouter()


@router.post("/detailed/", response_model=EvaluationWithDetails, status_code=status.HTTP_201_CREATED)
def create_detailed_evaluation(
    evaluation_in: DetailedEvaluationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new detailed evaluation with criteria scores for a service.
    
    A user can only submit one evaluation per service.
    The overall score is calculated as a weighted average of the criteria scores.
    """
    # Check if service exists
    service = get_service_by_id(db, service_id=evaluation_in.service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Check if user has already evaluated this service
    existing_evaluation = check_user_has_evaluated_service(
        db=db, 
        user_id=current_user.id, 
        service_id=evaluation_in.service_id
    )
    
    if existing_evaluation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User has already evaluated this service"
        )
    
    # Créer l'évaluation de base d'abord
    db_evaluation = create_evaluation(db, evaluation_in, current_user.id)
    
    # Ajouter les scores de critères si fournis
    if evaluation_in.criteria_scores:
        for score in evaluation_in.criteria_scores:
            create_evaluation_criteria_score(
                db=db,
                evaluation_id=db_evaluation.id,
                criteria_score=score
            )
        
        # Calculer le score global pondéré après avoir ajouté tous les scores de critères
        overall_score = calculate_overall_score(db, db_evaluation.id)
        if overall_score is not None:
            # Mettre à jour le score de l'évaluation
            evaluation_update = EvaluationUpdate(score=overall_score)
            update_evaluation(db, db_evaluation.id, evaluation_update, current_user.id)
    
    # Récupérer l'évaluation avec tous les détails
    result = get_evaluation_by_id(db, db_evaluation.id)
    
    return result


@router.post("/", response_model=EvaluationOut, status_code=status.HTTP_201_CREATED)
def create_evaluation_route(
    evaluation_in: EvaluationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create new evaluation for a service.
    
    A user can only submit one evaluation per service.
    """
    # Check if service exists
    service = get_service_by_id(db, service_id=evaluation_in.service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Check if user has already evaluated this service
    existing_evaluation = check_user_has_evaluated_service(
        db=db, 
        user_id=current_user.id, 
        service_id=evaluation_in.service_id
    )
    
    if existing_evaluation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already evaluated this service. Use PUT to update your evaluation."
        )
    
    # Create evaluation
    evaluation = create_evaluation(
        db=db, 
        evaluation=evaluation_in, 
        user_id=current_user.id
    )
    
    return evaluation


@router.get("/", response_model=EvaluationPagination)
def read_evaluations(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    service_id: Optional[int] = Query(None, description="Filter by service ID"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    min_score: Optional[float] = Query(None, ge=0, le=10, description="Minimum score"),
    max_score: Optional[float] = Query(None, ge=0, le=10, description="Maximum score"),
    search: Optional[str] = Query(None, description="Search in comments"),
    date_from: Optional[datetime] = Query(None, description="Filter from date (ISO format)"),
    date_to: Optional[datetime] = Query(None, description="Filter to date (ISO format)"),
    status: Optional[EvaluationStatus] = Query(None, description="Filter by evaluation status"),
    include_votes: bool = Query(True, description="Include vote counts"),
    sort_by: str = Query("timestamp", description="Field to sort by"),
    sort_order: SortOrder = Query(SortOrder.DESC, description="Sort order (asc or desc)")
) -> Any:
    """
    Retrieve evaluations with pagination and filtering.
    """
    evaluations, total = get_evaluations(
        db=db,
        page=page,
        limit=limit,
        service_id=service_id,
        user_id=user_id,
        min_score=min_score,
        max_score=max_score,
        search_comment=search,
        date_from=date_from,
        date_to=date_to,
        status=status,
        sort_by=sort_by,
        sort_order=sort_order.value,
        include_user=True,
        include_service=True,
        include_votes=include_votes
    )
    
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": evaluations
    }


@router.get("/{service_id}/list", response_model=List[EvaluationWithDetails])
def read_evaluations_by_service(
    service_id: int = Path(..., description="The ID of the service to get evaluations for"),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Skip N items"),
    limit: int = Query(100, ge=1, le=100, description="Limit to N items"),
    include_user: bool = Query(True, description="Include user details")
) -> Any:
    """
    Retrieve evaluations for a specific service.
    """
    # Check if service exists
    service = get_service_by_id(db, service_id=service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Get evaluations for this service
    evaluations, _ = get_evaluations(
        db=db,
        page=skip // limit + 1 if limit > 0 else 1,
        limit=limit,
        service_id=service_id,
        include_user=include_user,
        include_service=True
    )
    
    return evaluations


@router.get("/{evaluation_id}", response_model=EvaluationWithDetails)
def read_evaluation(
    evaluation_id: int = Path(..., description="The ID of the evaluation to get"),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get a specific evaluation by ID.
    """
    evaluation = get_evaluation_by_id(db, evaluation_id)
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found"
        )
    return evaluation


@router.get("/{evaluation_id}/criteria", response_model=List[EvaluationCriteriaScoreOut])
def read_evaluation_criteria(
    evaluation_id: int = Path(..., description="The ID of the evaluation to get criteria for"),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all criteria scores for a specific evaluation.
    """
    evaluation = get_evaluation_by_id(db, evaluation_id)
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found"
        )
    
    criteria_scores = get_criteria_scores_by_evaluation(db, evaluation_id)
    return criteria_scores


@router.put("/{evaluation_id}", response_model=EvaluationOut)
def update_evaluation_route(
    evaluation_id: int = Path(..., description="The ID of the evaluation to update"),
    evaluation_update: EvaluationUpdate = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update an evaluation.
    
    Users can only update their own evaluations.
    """
    if evaluation_update is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No update data provided"
        )
    
    updated_evaluation = update_evaluation(
        db=db,
        evaluation_id=evaluation_id,
        evaluation_update=evaluation_update,
        user_id=current_user.id
    )
    
    if not updated_evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation not found or you don't have permission to update it"
        )
    
    return updated_evaluation


@router.delete("/{evaluation_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_evaluation_route(
    evaluation_id: int = Path(..., description="The ID of the evaluation to delete"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete an evaluation.
    
    Users can only delete their own evaluations.
    Admins can delete any evaluation.
    """
    is_admin = current_user.role == "admin"
    
    success, message = delete_evaluation(
        db=db,
        evaluation_id=evaluation_id,
        user_id=current_user.id,
        is_admin=is_admin
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND if message == "Evaluation not found" else status.HTTP_403_FORBIDDEN,
            detail=message
        )


@router.get("/user/me", response_model=List[EvaluationWithDetails])
def read_user_evaluations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0, description="Skip N items"),
    limit: int = Query(100, ge=1, le=100, description="Limit to N items")
) -> Any:
    """
    Get evaluations submitted by the current user.
    """
    evaluations, _ = get_evaluations(
        db=db,
        page=skip // limit + 1 if limit > 0 else 1,
        limit=limit,
        user_id=current_user.id,
        include_service=True
    )
    
    return evaluations


@router.get("/stats/service/{service_id}", response_model=EvaluationStats)
def get_service_evaluation_stats(
    service_id: int = Path(..., description="The ID of the service to get stats for"),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get evaluation statistics for a specific service.
    """
    # Check if service exists
    service = get_service_by_id(db, service_id=service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    stats = get_evaluation_stats(db=db, service_id=service_id)
    return stats


@router.get("/stats/overall", response_model=EvaluationStats)
def get_overall_evaluation_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Any:
    """
    Get overall evaluation statistics across all services.
    Admin only.
    """
    stats = get_evaluation_stats(db=db)
    return stats
