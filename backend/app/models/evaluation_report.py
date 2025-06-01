from sqlalchemy import Column, ForeignKey, DateTime, Text, Enum, Boolean
from sqlalchemy.orm import relationship
import enum
import uuid
from datetime import datetime

from app.database import Base
from app.models.utils import UUID


class ReportReason(str, enum.Enum):
    inappropriate_content = "inappropriate_content"
    spam = "spam"
    offensive = "offensive"
    misleading = "misleading"
    other = "other"


class EvaluationReport(Base):
    __tablename__ = "evaluation_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evaluation_id = Column(UUID(as_uuid=True), ForeignKey("evaluations.id", ondelete="CASCADE"), nullable=False)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    reason = Column(Enum(ReportReason), nullable=False)
    description = Column(Text(1000))
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    evaluation = relationship("Evaluation", back_populates="reports")
    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reported_evaluations")
