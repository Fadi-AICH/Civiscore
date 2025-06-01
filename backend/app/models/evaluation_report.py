from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
import datetime
import enum

from app.database import Base


class ReportReason(str, enum.Enum):
    INAPPROPRIATE = "inappropriate"
    SPAM = "spam"
    OFFENSIVE = "offensive"
    MISLEADING = "misleading"
    OTHER = "other"


class EvaluationReport(Base):
    __tablename__ = "evaluation_reports"

    id = Column(Integer, primary_key=True, index=True)
    evaluation_id = Column(Integer, ForeignKey("evaluations.id"))
    reporter_id = Column(Integer, ForeignKey("users.id"))
    reason = Column(Enum(ReportReason))
    description = Column(Text(1000), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    resolved = Column(Integer, default=0)  # 0: pending, 1: resolved-accepted, 2: resolved-rejected
    
    # Relationships
    evaluation = relationship("Evaluation", back_populates="reports")
    reporter = relationship("User", backref="reports")
