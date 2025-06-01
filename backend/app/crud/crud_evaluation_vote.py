from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, asc

from app.models.evaluation_vote import EvaluationVote
from app.models.evaluation import Evaluation
from app.schemas.evaluation import EvaluationVoteCreate


def create_or_update_evaluation_vote(
    db: Session, vote: EvaluationVoteCreate, voter_id: int
) -> Tuple[EvaluationVote, bool]:
    """
    Create a new evaluation vote or update an existing one.
    Returns the vote and a boolean indicating if it was created (True) or updated (False).
    """
    # Check if the user has already voted on this evaluation
    existing_vote = db.query(EvaluationVote).filter(
        EvaluationVote.evaluation_id == vote.evaluation_id,
        EvaluationVote.voter_id == voter_id
    ).first()
    
    if existing_vote:
        # Update existing vote
        existing_vote.is_helpful = vote.is_helpful
        existing_vote.timestamp = datetime.utcnow()
        db.add(existing_vote)
        db.commit()
        db.refresh(existing_vote)
        return existing_vote, False
    else:
        # Create new vote
        db_vote = EvaluationVote(
            evaluation_id=vote.evaluation_id,
            voter_id=voter_id,
            is_helpful=vote.is_helpful,
            timestamp=datetime.utcnow()
        )
        db.add(db_vote)
        db.commit()
        db.refresh(db_vote)
        return db_vote, True


def delete_evaluation_vote(
    db: Session, evaluation_id: int, voter_id: int
) -> Tuple[bool, str]:
    """
    Delete an evaluation vote.
    """
    vote = db.query(EvaluationVote).filter(
        EvaluationVote.evaluation_id == evaluation_id,
        EvaluationVote.voter_id == voter_id
    ).first()
    
    if not vote:
        return False, "Vote not found"
    
    db.delete(vote)
    db.commit()
    return True, "Vote deleted successfully"


def get_evaluation_votes(
    db: Session,
    evaluation_id: int,
    skip: int = 0,
    limit: int = 100,
    is_helpful: Optional[bool] = None
) -> Tuple[List[EvaluationVote], int]:
    """
    Get votes for an evaluation with filtering.
    """
    query = db.query(EvaluationVote).filter(EvaluationVote.evaluation_id == evaluation_id)
    
    if is_helpful is not None:
        query = query.filter(EvaluationVote.is_helpful == is_helpful)
    
    total = query.count()
    votes = query.offset(skip).limit(limit).all()
    
    return votes, total


def get_evaluation_vote_counts(db: Session, evaluation_id: int) -> Dict[str, int]:
    """
    Get the count of helpful and unhelpful votes for an evaluation.
    """
    helpful_count = db.query(EvaluationVote).filter(
        EvaluationVote.evaluation_id == evaluation_id,
        EvaluationVote.is_helpful == True
    ).count()
    
    unhelpful_count = db.query(EvaluationVote).filter(
        EvaluationVote.evaluation_id == evaluation_id,
        EvaluationVote.is_helpful == False
    ).count()
    
    return {
        "helpful": helpful_count,
        "unhelpful": unhelpful_count
    }


def get_user_vote_for_evaluation(
    db: Session, evaluation_id: int, voter_id: int
) -> Optional[EvaluationVote]:
    """
    Get a user's vote for a specific evaluation.
    """
    return db.query(EvaluationVote).filter(
        EvaluationVote.evaluation_id == evaluation_id,
        EvaluationVote.voter_id == voter_id
    ).first()
