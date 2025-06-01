from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.utils import UUIDType

from app.models.evaluation import EvaluationStatus
from app.models.evaluation_report import ReportReason
from app.schemas.user import UserOut
from app.schemas.service import ServiceOut
from app.schemas.pagination import PaginatedResponse


class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"


# Base Evaluation schema (shared properties)
class EvaluationBase(BaseModel):
    score: float = Field(..., ge=0, le=10)
    comment: Optional[str] = None


# Properties to receive via API on creation
class EvaluationCreate(EvaluationBase, UUIDType):
    service_id: UUID


# Properties to receive via API on update
class EvaluationUpdate(BaseModel):
    score: Optional[float] = Field(None, ge=0, le=10)
    comment: Optional[str] = None


# Properties to return via API
class EvaluationOut(EvaluationBase, UUIDType):
    id: UUID
    user_id: UUID
    service_id: UUID
    timestamp: datetime
    status: EvaluationStatus = EvaluationStatus.PENDING
    
    model_config = ConfigDict(from_attributes=True)


# Evaluation with related details
class EvaluationWithDetails(EvaluationOut):
    user: UserOut
    service: ServiceOut
    helpful_votes: Optional[int] = 0
    unhelpful_votes: Optional[int] = 0
    
    model_config = ConfigDict(from_attributes=True)


# Paginated response for evaluations
class EvaluationPagination(PaginatedResponse):
    items: List[EvaluationWithDetails]


# Schemas for Evaluation Reports
class EvaluationReportBase(BaseModel):
    reason: ReportReason
    description: Optional[str] = None


class EvaluationReportCreate(EvaluationReportBase, UUIDType):
    evaluation_id: UUID


class EvaluationReportOut(EvaluationReportBase, UUIDType):
    id: UUID
    evaluation_id: UUID
    reporter_id: UUID
    timestamp: datetime
    resolved: bool = False
    
    model_config = ConfigDict(from_attributes=True)


class EvaluationReportWithDetails(EvaluationReportOut):
    reporter: UserOut
    evaluation: EvaluationOut
    
    model_config = ConfigDict(from_attributes=True)


class EvaluationReportPagination(PaginatedResponse):
    items: List[EvaluationReportWithDetails]


# Schemas for Evaluation Votes
class EvaluationVoteBase(BaseModel):
    is_helpful: bool


class EvaluationVoteCreate(EvaluationVoteBase, UUIDType):
    evaluation_id: UUID


class EvaluationVoteOut(EvaluationVoteBase, UUIDType):
    id: UUID
    evaluation_id: UUID
    voter_id: UUID
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Schemas for Evaluation Criteria
class EvaluationCriteriaBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    weight: float = 1.0


class EvaluationCriteriaCreate(EvaluationCriteriaBase):
    pass


class EvaluationCriteriaOut(EvaluationCriteriaBase, UUIDType):
    id: UUID
    
    model_config = ConfigDict(from_attributes=True)


# Properties to receive via API on update
class EvaluationCriteriaUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    weight: Optional[float] = None


class EvaluationCriteriaScoreBase(BaseModel, UUIDType):
    criteria_id: UUID
    score: float = Field(..., ge=0, le=10)


class EvaluationCriteriaScoreCreate(EvaluationCriteriaScoreBase):
    pass


class EvaluationCriteriaScoreOut(EvaluationCriteriaScoreBase, UUIDType):
    id: UUID
    evaluation_id: UUID
    
    model_config = ConfigDict(from_attributes=True)


class EvaluationCriteriaScoreWithDetails(EvaluationCriteriaScoreOut):
    criteria: EvaluationCriteriaOut
    
    model_config = ConfigDict(from_attributes=True)


# Schema for detailed evaluation creation with criteria scores
class DetailedEvaluationCreate(EvaluationCreate):
    criteria_scores: List[EvaluationCriteriaScoreCreate]


# Statistics for evaluations
class EvaluationStats(BaseModel):
    total_count: int
    average_score: float
    score_distribution: Dict[str, int]  # Distribution of scores (e.g. {"1": 5, "2": 10})
    recent_trend: Optional[float] = None  # Change in average score over recent period
