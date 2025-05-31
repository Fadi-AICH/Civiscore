from typing import Any, Dict, Optional, Union, List
from datetime import datetime

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc, desc

from app.models.evaluation import Evaluation
from app.schemas.evaluation import EvaluationCreate
from app.crud.crud_service import update_service_rating


def create_evaluation(db: Session, evaluation: EvaluationCreate, user_id: int) -> Evaluation:
    """Create a new evaluation and update service rating"""
    # Create evaluation object
    db_evaluation = Evaluation(
        user_id=user_id,
        service_id=evaluation.service_id,
        score=evaluation.score,
        comment=evaluation.comment,
        timestamp=datetime.utcnow()
    )
    
    # Add to database
    db.add(db_evaluation)
    db.commit()
    db.refresh(db_evaluation)
    
    # Update service rating (average of all evaluations)
    _update_service_average_rating(db, evaluation.service_id)
    
    return db_evaluation


def get_evaluations_by_service(
    db: Session, 
    service_id: int,
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
    user_id: int,
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


def _update_service_average_rating(db: Session, service_id: int) -> None:
    """Update a service's rating based on the average of all evaluations"""
    # Calculate average score
    result = db.query(db.func.avg(Evaluation.score)).filter(Evaluation.service_id == service_id).scalar()
    
    # Update service rating
    if result is not None:
        update_service_rating(db, service_id, float(result))
