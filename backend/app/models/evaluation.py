from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Text, Enum
from sqlalchemy.orm import relationship
import datetime
import enum

from app.database import Base


class EvaluationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    FLAGGED = "flagged"
    REJECTED = "rejected"


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    service_id = Column(Integer, ForeignKey("services.id"))
    score = Column(Float)
    comment = Column(Text(1000), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(Enum(EvaluationStatus), default=EvaluationStatus.PENDING)
    
    # Relationships
    user = relationship("User", back_populates="evaluations")
    service = relationship("Service", back_populates="evaluations")
    reports = relationship("EvaluationReport", back_populates="evaluation", cascade="all, delete-orphan")
    votes = relationship("EvaluationVote", back_populates="evaluation", cascade="all, delete-orphan")
