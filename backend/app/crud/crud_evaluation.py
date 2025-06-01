from typing import Any, Dict, Optional, Union, List, Tuple
from datetime import datetime, timedelta
from uuid import UUID

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc, desc, func, or_, and_, cast, Float
from sqlalchemy.sql import expression

from app.models.evaluation import Evaluation, EvaluationStatus
from app.models.user import User
from app.models.evaluation_vote import EvaluationVote
from app.schemas.evaluation import EvaluationCreate, EvaluationUpdate
from app.crud.crud_service import update_service_rating, get_service_by_id


def create_evaluation(db: Session, evaluation: EvaluationCreate, user_id: UUID) -> Evaluation:
    """Create a new evaluation and update service rating"""
    # Déterminer si l'évaluation doit être automatiquement approuvée ou mise en attente
    # Par défaut, les évaluations sont en attente de modération
    status = EvaluationStatus.PENDING
    
    # Si l'utilisateur est un administrateur, l'évaluation est automatiquement approuvée
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.role == "admin":
        status = EvaluationStatus.APPROVED
    
    db_evaluation = Evaluation(
        user_id=user_id,
        service_id=evaluation.service_id,
        score=evaluation.score,
        comment=evaluation.comment,
        timestamp=datetime.utcnow(),
        status=status
    )
    
    # Add to database
    db.add(db_evaluation)
    db.commit()
    db.refresh(db_evaluation)
    
    # Update service rating (average of all evaluations)
    _update_service_average_rating(db, evaluation.service_id)
    
    return db_evaluation


def update_evaluation(
    db: Session, 
    evaluation_id: UUID, 
    evaluation_update: EvaluationUpdate, 
    user_id: UUID
) -> Optional[Evaluation]:
    """Update an existing evaluation"""
    # Get the evaluation
    db_evaluation = get_evaluation_by_id(db, evaluation_id)
    
    # Check if evaluation exists and belongs to the user
    if not db_evaluation or db_evaluation.user_id != user_id:
        return None
    
    # Update fields if provided
    if evaluation_update.score is not None:
        db_evaluation.score = evaluation_update.score
    
    if evaluation_update.comment is not None:
        db_evaluation.comment = evaluation_update.comment
    
    # Save changes
    db.add(db_evaluation)
    db.commit()
    db.refresh(db_evaluation)
    
    # Update service rating
    _update_service_average_rating(db, db_evaluation.service_id)
    
    return db_evaluation


def delete_evaluation(db: Session, evaluation_id: UUID, user_id: UUID, is_admin: bool = False) -> Tuple[bool, str]:
    """Delete an evaluation"""
    # Get the evaluation
    db_evaluation = get_evaluation_by_id(db, evaluation_id)
    
    # Check if evaluation exists
    if not db_evaluation:
        return False, "Evaluation not found"
    
    # Check if user is authorized to delete (owner or admin)
    if not is_admin and db_evaluation.user_id != user_id:
        return False, "Not authorized to delete this evaluation"
    
    # Store service_id for rating update
    service_id = db_evaluation.service_id
    
    # Delete the evaluation
    db.delete(db_evaluation)
    db.commit()
    
    # Update service rating
    _update_service_average_rating(db, service_id)
    
    return True, ""


def get_evaluation_by_id(db: Session, evaluation_id: UUID) -> Optional[Evaluation]:
    """Get an evaluation by ID"""
    return db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()


def get_evaluations(
    db: Session,
    *,
    page: int = 1,
    limit: int = 10,
    service_id: Optional[UUID] = None,
    user_id: Optional[UUID] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    search_comment: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    status: Optional[EvaluationStatus] = None,
    sort_by: str = "timestamp",
    sort_order: str = "desc",
    include_user: bool = True,
    include_service: bool = True,
    include_votes: bool = True
) -> Tuple[List[Evaluation], int]:
    """Get evaluations with advanced filtering, sorting and pagination"""
    query = db.query(Evaluation)
    
    # Apply filters
    if service_id is not None:
        query = query.filter(Evaluation.service_id == service_id)
    
    if user_id is not None:
        query = query.filter(Evaluation.user_id == user_id)
    
    if min_score is not None:
        query = query.filter(Evaluation.score >= min_score)
    
    if max_score is not None:
        query = query.filter(Evaluation.score <= max_score)
    
    if search_comment is not None:
        query = query.filter(Evaluation.comment.ilike(f"%{search_comment}%"))
    
    if date_from is not None:
        query = query.filter(Evaluation.timestamp >= date_from)
    
    if date_to is not None:
        query = query.filter(Evaluation.timestamp <= date_to)
    
    if status is not None:
        query = query.filter(Evaluation.status == status)
    
    # Include related data if requested
    if include_user:
        query = query.options(joinedload(Evaluation.user))
    
    if include_service:
        query = query.options(joinedload(Evaluation.service))
        
    if include_votes:
        query = query.options(joinedload(Evaluation.votes))
    
    # Get total count before pagination
    total = query.count()
    
    # Apply sorting
    if sort_by and hasattr(Evaluation, sort_by):
        column = getattr(Evaluation, sort_by)
        if sort_order.lower() == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())
    
    # Apply pagination
    query = query.offset((page - 1) * limit).limit(limit)
    
    return query.all(), total


def get_evaluations_by_service(
    db: Session, 
    service_id: UUID,
    skip: int = 0, 
    limit: int = 100,
    include_user: bool = False,
    include_service: bool = False,
    sort_by_date: bool = True,
    sort_desc: bool = True
) -> List[Evaluation]:
    """Get evaluations for a specific service"""
    query = db.query(Evaluation).filter(Evaluation.service_id == service_id)
    
    # Include related data if requested
    if include_user:
        query = query.options(joinedload(Evaluation.user))
    
    if include_service:
        query = query.options(joinedload(Evaluation.service))
    
    # Apply sorting
    if sort_by_date:
        if sort_desc:
            query = query.order_by(desc(Evaluation.timestamp))
        else:
            query = query.order_by(asc(Evaluation.timestamp))
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    return query.all()


def get_evaluations_by_user(
    db: Session, 
    user_id: UUID,
    skip: int = 0, 
    limit: int = 100,
    include_service: bool = False
) -> List[Evaluation]:
    """Get evaluations made by a specific user"""
    query = db.query(Evaluation).filter(Evaluation.user_id == user_id)
    
    # Include service data if requested
    if include_service:
        query = query.options(joinedload(Evaluation.service))
    
    # Apply sorting and pagination
    query = query.order_by(desc(Evaluation.timestamp)).offset(skip).limit(limit)
    
    return query.all()


def get_evaluation_stats(db: Session, service_id: Optional[UUID] = None) -> Dict[str, Any]:
    """Get statistics for evaluations"""
    # Base query
    query = db.query(Evaluation)
    
    # Filter by service if provided
    if service_id is not None:
        query = query.filter(Evaluation.service_id == service_id)
    
    # Get total count
    total_count = query.count()
    
    # Get average score
    average_score = db.query(func.avg(Evaluation.score)).filter(
        Evaluation.service_id == service_id if service_id is not None else True
    ).scalar() or 0.0
    
    # Get score distribution
    score_distribution = {}
    for i in range(0, 11):  # Scores from 0 to 10
        count = query.filter(func.round(Evaluation.score) == i).count()
        if count > 0:  # Only include scores that have evaluations
            score_distribution[str(i)] = count
    
    # Calculate recent trend (change in average score over last 30 days vs previous 30 days)
    recent_trend = None
    if total_count > 0:
        today = datetime.utcnow()
        last_30_days = today - timedelta(days=30)
        previous_30_days = last_30_days - timedelta(days=30)
        
        # Average score for last 30 days
        recent_avg = db.query(func.avg(Evaluation.score)).filter(
            Evaluation.timestamp >= last_30_days,
            Evaluation.timestamp <= today,
            Evaluation.service_id == service_id if service_id is not None else True
        ).scalar() or 0.0
        
        # Average score for previous 30 days
        previous_avg = db.query(func.avg(Evaluation.score)).filter(
            Evaluation.timestamp >= previous_30_days,
            Evaluation.timestamp < last_30_days,
            Evaluation.service_id == service_id if service_id is not None else True
        ).scalar() or 0.0
        
        # Calculate trend if we have data for both periods
        if recent_avg > 0 or previous_avg > 0:
            recent_trend = recent_avg - previous_avg
    
    return {
        "total_count": total_count,
        "average_score": float(average_score),
        "score_distribution": score_distribution,
        "recent_trend": float(recent_trend) if recent_trend is not None else None
    }


def check_user_has_evaluated_service(db: Session, user_id: UUID, service_id: UUID) -> Optional[Evaluation]:
    """Check if a user has already evaluated a service"""
    return db.query(Evaluation).filter(
        Evaluation.user_id == user_id,
        Evaluation.service_id == service_id
    ).first()


def _update_service_average_rating(db: Session, service_id: UUID) -> None:
    """Update a service's rating based on the average of all evaluations"""
    # Calculate average score
    result = db.query(func.avg(Evaluation.score)).filter(Evaluation.service_id == service_id).scalar()
    
    # Update service rating
    if result is not None:
        update_service_rating(db, service_id, float(result))
