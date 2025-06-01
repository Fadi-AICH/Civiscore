from sqlalchemy import Column, Integer, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
import datetime

from app.database import Base


class EvaluationVote(Base):
    __tablename__ = "evaluation_votes"

    id = Column(Integer, primary_key=True, index=True)
    evaluation_id = Column(Integer, ForeignKey("evaluations.id"))
    voter_id = Column(Integer, ForeignKey("users.id"))
    is_helpful = Column(Boolean, nullable=False)  # True: helpful, False: not helpful
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    evaluation = relationship("Evaluation", back_populates="votes")
    voter = relationship("User", backref="evaluation_votes")
