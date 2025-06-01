from sqlalchemy import Column, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database import Base
from app.models.utils import UUID


class Country(Base):
    __tablename__ = "countries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, index=True)
    code = Column(String(2), nullable=False, index=True)
    region = Column(String(100))
    description = Column(Text(1000))
    latitude = Column(Float)
    longitude = Column(Float)
    population = Column(Float)
    flag_url = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    services = relationship("Service", back_populates="country")
