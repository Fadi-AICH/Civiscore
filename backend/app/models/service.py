from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship

from app.database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), index=True)
    category = Column(String(100), index=True)
    country_id = Column(Integer, ForeignKey("countries.id"))
    rating = Column(Float, default=0.0)
    
    # Relationships
    country = relationship("Country", back_populates="services")
    evaluations = relationship("Evaluation", back_populates="service")
