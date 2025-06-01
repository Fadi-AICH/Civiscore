from typing import Any, List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status, Path, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_admin_user, get_db
from app.crud.crud_evaluation_criteria import (
    create_evaluation_criteria, update_evaluation_criteria,
    delete_evaluation_criteria, get_evaluation_criteria,
    get_evaluation_criteria_by_id, create_evaluation_criteria_score,
    get_evaluation_criteria_scores
)
from app.models.user import User
from app.schemas.evaluation import (
    EvaluationCriteriaCreate, EvaluationCriteriaUpdate,
    EvaluationCriteriaOut, EvaluationCriteriaScoreCreate,
    EvaluationCriteriaScoreOut
)

router = APIRouter()


@router.post("/", response_model=EvaluationCriteriaOut, status_code=status.HTTP_201_CREATED)
def create_criteria(
    criteria_in: EvaluationCriteriaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Create a new evaluation criteria.
    Admin only.
    """
    criteria = create_evaluation_criteria(db, criteria_in)
    return criteria


@router.get("/", response_model=List[EvaluationCriteriaOut])
def list_criteria(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Skip items"),
    limit: int = Query(100, ge=1, le=100, description="Limit items"),
    active_only: bool = Query(True, description="Only return active criteria")
):
    """
    List evaluation criteria.
    """
    criteria = get_evaluation_criteria(db, skip=skip, limit=limit, active_only=active_only)
    return criteria


@router.get("/{criteria_id}", response_model=EvaluationCriteriaOut)
def get_criteria(
    criteria_id: int = Path(..., description="The ID of the criteria to retrieve"),
    db: Session = Depends(get_db)
):
    """
    Get a specific evaluation criteria.
    """
    criteria = get_evaluation_criteria_by_id(db, criteria_id)
    if not criteria:
        raise HTTPException(status_code=404, detail="Criteria not found")
    return criteria


@router.put("/{criteria_id}", response_model=EvaluationCriteriaOut)
def update_criteria(
    criteria_in: EvaluationCriteriaUpdate,
    criteria_id: int = Path(..., description="The ID of the criteria to update"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update an evaluation criteria.
    Admin only.
    """
    criteria = get_evaluation_criteria_by_id(db, criteria_id)
    if not criteria:
        raise HTTPException(status_code=404, detail="Criteria not found")
    
    updated_criteria = update_evaluation_criteria(db, criteria_id, criteria_in)
    return updated_criteria


@router.delete("/{criteria_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_criteria(
    criteria_id: int = Path(..., description="The ID of the criteria to delete"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Delete an evaluation criteria.
    Admin only.
    """
    criteria = get_evaluation_criteria_by_id(db, criteria_id)
    if not criteria:
        raise HTTPException(status_code=404, detail="Criteria not found")
    
    success, message = delete_evaluation_criteria(db, criteria_id)
    if not success:
        raise HTTPException(status_code=400, detail=message)


@router.post("/scores", response_model=EvaluationCriteriaScoreOut, status_code=status.HTTP_201_CREATED)
def create_score(
    score_in: EvaluationCriteriaScoreCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new criteria score for an evaluation.
    """
    score = create_evaluation_criteria_score(
        db=db,
        evaluation_id=score_in.evaluation_id,
        criteria_score=score_in
    )
    return score


@router.get("/scores/{evaluation_id}", response_model=List[EvaluationCriteriaScoreOut])
def get_evaluation_scores(
    evaluation_id: int = Path(..., description="The ID of the evaluation to get scores for"),
    db: Session = Depends(get_db)
):
    """
    Get all criteria scores for a specific evaluation.
    """
    scores = get_evaluation_criteria_scores(db, evaluation_id)
    return scores
