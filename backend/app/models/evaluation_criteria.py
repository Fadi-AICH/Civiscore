from sqlalchemy import Column, Integer, String, ForeignKey, Float, Text
from sqlalchemy.orm import relationship

from app.database import Base


class EvaluationCriteria(Base):
    __tablename__ = "evaluation_criteria"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text(500), nullable=True)
    category = Column(String(100), nullable=False)  # Catégorie de service à laquelle ce critère s'applique
    weight = Column(Float, default=1.0)  # Poids dans le calcul du score global
    
    # Relationships
    criteria_scores = relationship("EvaluationCriteriaScore", back_populates="criteria", cascade="all, delete-orphan")


class EvaluationCriteriaScore(Base):
    __tablename__ = "evaluation_criteria_scores"

    id = Column(Integer, primary_key=True, index=True)
    evaluation_id = Column(Integer, ForeignKey("evaluations.id"))
    criteria_id = Column(Integer, ForeignKey("evaluation_criteria.id"))
    score = Column(Float, nullable=False)
    
    # Relationships
    evaluation = relationship("Evaluation", backref="criteria_scores")
    criteria = relationship("EvaluationCriteria", back_populates="criteria_scores")
