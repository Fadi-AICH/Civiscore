from sqlalchemy import Column, String, ForeignKey, Float, DateTime, Text
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database import Base
from app.models.utils import UUID


class Service(Base):
    __tablename__ = "services"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False, index=True)
    category = Column(String(100), index=True)
    country_id = Column(UUID(as_uuid=True), ForeignKey("countries.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    country = relationship("Country", back_populates="services")
    evaluations = relationship("Evaluation", back_populates="service", cascade="all, delete-orphan")
