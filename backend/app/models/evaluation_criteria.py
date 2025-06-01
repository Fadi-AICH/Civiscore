from sqlalchemy import Column, String, ForeignKey, Float, Text, DateTime
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database import Base
from app.models.utils import UUID


class EvaluationCriteria(Base):
    __tablename__ = "evaluation_criteria"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text(500))
    category = Column(String(100), index=True)
    weight = Column(Float, default=1.0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    scores = relationship("EvaluationCriteriaScore", back_populates="criteria", cascade="all, delete-orphan")


class EvaluationCriteriaScore(Base):
    __tablename__ = "evaluation_criteria_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evaluation_id = Column(UUID(as_uuid=True), ForeignKey("evaluations.id", ondelete="CASCADE"), nullable=False)
    criteria_id = Column(UUID(as_uuid=True), ForeignKey("evaluation_criteria.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)
    
    # Relationships
    evaluation = relationship("Evaluation", back_populates="criteria_scores")
    criteria = relationship("EvaluationCriteria", back_populates="scores")
