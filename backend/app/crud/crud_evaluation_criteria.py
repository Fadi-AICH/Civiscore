from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, asc

from app.models.evaluation_criteria import EvaluationCriteria, EvaluationCriteriaScore
from app.models.evaluation import Evaluation
from app.schemas.evaluation import EvaluationCriteriaCreate, EvaluationCriteriaScoreCreate


def create_evaluation_criteria(
    db: Session, criteria: EvaluationCriteriaCreate
) -> EvaluationCriteria:
    """
    Create a new evaluation criteria.
    """
    db_criteria = EvaluationCriteria(
        name=criteria.name,
        description=criteria.description,
        category=criteria.category,
        weight=criteria.weight
    )
    db.add(db_criteria)
    db.commit()
    db.refresh(db_criteria)
    return db_criteria


def get_evaluation_criteria(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None
) -> Tuple[List[EvaluationCriteria], int]:
    """
    Get evaluation criteria with optional filtering by category.
    """
    query = db.query(EvaluationCriteria)
    
    if category:
        query = query.filter(EvaluationCriteria.category == category)
    
    total = query.count()
    criteria = query.offset(skip).limit(limit).all()
    
    return criteria, total


def get_evaluation_criteria_by_id(
    db: Session, criteria_id: int
) -> Optional[EvaluationCriteria]:
    """
    Get an evaluation criteria by ID.
    """
    return db.query(EvaluationCriteria).filter(EvaluationCriteria.id == criteria_id).first()


def update_evaluation_criteria(
    db: Session, criteria_id: int, criteria_update: EvaluationCriteriaCreate
) -> Tuple[Optional[EvaluationCriteria], str]:
    """
    Update an evaluation criteria.
    """
    db_criteria = db.query(EvaluationCriteria).filter(
        EvaluationCriteria.id == criteria_id
    ).first()
    
    if not db_criteria:
        return None, "Criteria not found"
    
    for key, value in criteria_update.model_dump(exclude_unset=True).items():
        setattr(db_criteria, key, value)
    
    db.add(db_criteria)
    db.commit()
    db.refresh(db_criteria)
    return db_criteria, "Criteria updated successfully"


def delete_evaluation_criteria(
    db: Session, criteria_id: int
) -> Tuple[bool, str]:
    """
    Delete an evaluation criteria.
    """
    db_criteria = db.query(EvaluationCriteria).filter(
        EvaluationCriteria.id == criteria_id
    ).first()
    
    if not db_criteria:
        return False, "Criteria not found"
    
    # Check if the criteria is used in any evaluation
    used_in_evaluation = db.query(EvaluationCriteriaScore).filter(
        EvaluationCriteriaScore.criteria_id == criteria_id
    ).first()
    
    if used_in_evaluation:
        return False, "Cannot delete criteria that is used in evaluations"
    
    db.delete(db_criteria)
    db.commit()
    return True, "Criteria deleted successfully"


def create_evaluation_criteria_score(
    db: Session, 
    evaluation_id: int,
    criteria_score: EvaluationCriteriaScoreCreate
) -> EvaluationCriteriaScore:
    """
    Create a new evaluation criteria score.
    """
    db_criteria_score = EvaluationCriteriaScore(
        evaluation_id=evaluation_id,
        criteria_id=criteria_score.criteria_id,
        score=criteria_score.score
    )
    db.add(db_criteria_score)
    db.commit()
    db.refresh(db_criteria_score)
    return db_criteria_score


def get_evaluation_criteria_scores(
    db: Session, evaluation_id: int
) -> List[EvaluationCriteriaScore]:
    """
    Get all criteria scores for an evaluation.
    """
    return db.query(EvaluationCriteriaScore).filter(
        EvaluationCriteriaScore.evaluation_id == evaluation_id
    ).all()


def calculate_overall_score(
    db: Session, evaluation_id: int
) -> float:
    """
    Calculate the overall score for an evaluation based on weighted criteria scores.
    """
    criteria_scores = db.query(
        EvaluationCriteriaScore, EvaluationCriteria
    ).join(
        EvaluationCriteria, 
        EvaluationCriteriaScore.criteria_id == EvaluationCriteria.id
    ).filter(
        EvaluationCriteriaScore.evaluation_id == evaluation_id
    ).all()
    
    if not criteria_scores:
        return 0.0
    
    total_weight = 0.0
    weighted_score_sum = 0.0
    
    for criteria_score, criteria in criteria_scores:
        weighted_score_sum += criteria_score.score * criteria.weight
        total_weight += criteria.weight
    
    if total_weight == 0:
        return 0.0
    
    return round(weighted_score_sum / total_weight, 1)
