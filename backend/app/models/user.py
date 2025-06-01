from sqlalchemy import Boolean, Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    # Using 191 for MySQL utf8mb4 compatibility (767 bytes / 4 bytes per character = 191)
    username = Column(String(191), unique=True, index=True)
    email = Column(String(191), unique=True, index=True)
    hashed_password = Column(String(255))
    is_active = Column(Boolean, default=True)
    role = Column(String(50), default=UserRole.USER)
    
    # Relationships
    evaluations = relationship("Evaluation", back_populates="user")
