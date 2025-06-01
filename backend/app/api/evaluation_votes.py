from typing import Any, List, Optional, Dict
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status, Path, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud.crud_evaluation_vote import (
    create_or_update_evaluation_vote, delete_evaluation_vote,
    get_evaluation_votes, get_evaluation_vote_counts,
    get_user_vote_for_evaluation
)
from app.crud.crud_evaluation import get_evaluation_by_id
from app.models.user import User
from app.schemas.evaluation import EvaluationVoteCreate, EvaluationVoteOut

router = APIRouter()


@router.post("/", response_model=EvaluationVoteOut, status_code=status.HTTP_201_CREATED)
def vote_on_evaluation(
    vote_in: EvaluationVoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Vote on an evaluation (helpful or not helpful).
    If the user has already voted, the vote will be updated.
    """
    # Vérifier que l'évaluation existe
    evaluation = get_evaluation_by_id(db, vote_in.evaluation_id)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    # Empêcher de voter sur sa propre évaluation
    if evaluation.user_id == current_user.id:
        raise HTTPException(
            status_code=400, 
            detail="You cannot vote on your own evaluation"
        )
    
    vote, is_new = create_or_update_evaluation_vote(db, vote_in, current_user.id)
    return vote


@router.delete("/{evaluation_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def remove_vote(
    evaluation_id: int = Path(..., description="The ID of the evaluation to remove vote from"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove a vote from an evaluation.
    """
    success, message = delete_evaluation_vote(db, evaluation_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=404 if message == "Vote not found" else 400,
            detail=message
        )


@router.get("/{evaluation_id}/counts", response_model=Dict[str, int])
def get_vote_counts(
    evaluation_id: int = Path(..., description="The ID of the evaluation to get vote counts for"),
    db: Session = Depends(get_db)
):
    """
    Get the count of helpful and unhelpful votes for an evaluation.
    """
    # Vérifier que l'évaluation existe
    evaluation = get_evaluation_by_id(db, evaluation_id)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    return get_evaluation_vote_counts(db, evaluation_id)


@router.get("/{evaluation_id}/my-vote", response_model=Optional[EvaluationVoteOut])
def get_my_vote(
    evaluation_id: int = Path(..., description="The ID of the evaluation to get your vote for"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the current user's vote for a specific evaluation.
    """
    # Vérifier que l'évaluation existe
    evaluation = get_evaluation_by_id(db, evaluation_id)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    return get_user_vote_for_evaluation(db, evaluation_id, current_user.id)
