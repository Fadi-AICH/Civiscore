from typing import Optional, List
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import UserOut
from app.schemas.service import ServiceOut


# Base Evaluation schema (shared properties)
class EvaluationBase(BaseModel):
    score: float = Field(..., ge=0, le=10)
    comment: Optional[str] = None


# Properties to receive via API on creation
class EvaluationCreate(EvaluationBase):
    service_id: int


# Properties to return via API
class EvaluationOut(EvaluationBase):
    id: int
    user_id: int
    service_id: int
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Evaluation with related details
class EvaluationWithDetails(EvaluationOut):
    user: UserOut
    service: ServiceOut
    
    model_config = ConfigDict(from_attributes=True)
