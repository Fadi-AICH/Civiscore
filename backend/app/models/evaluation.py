from sqlalchemy import Column, ForeignKey, DateTime, String, Enum, Float
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime

from app.database import Base
from app.models.utils import UUID


class EvaluationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)
    comment = Column(String(1000), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(EvaluationStatus), default=EvaluationStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="evaluations")
    service = relationship("Service", back_populates="evaluations")
    criteria_scores = relationship("EvaluationCriteriaScore", back_populates="evaluation", cascade="all, delete-orphan")
    reports = relationship("EvaluationReport", back_populates="evaluation", cascade="all, delete-orphan")
    votes = relationship("EvaluationVote", back_populates="evaluation", cascade="all, delete-orphan")
