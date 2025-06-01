from typing import Any, List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status, Path, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_admin_user, get_db
from app.crud.crud_evaluation_report import (
    create_evaluation_report, get_evaluation_reports,
    get_evaluation_report_by_id, resolve_evaluation_report
)
from app.models.user import User
from app.models.evaluation_report import ReportReason
from app.schemas.evaluation import (
    EvaluationReportCreate, EvaluationReportOut,
    EvaluationReportWithDetails, EvaluationReportPagination
)

router = APIRouter()


@router.post("/", response_model=EvaluationReportOut, status_code=status.HTTP_201_CREATED)
def create_report(
    report_in: EvaluationReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new evaluation report.
    """
    report = create_evaluation_report(db, report_in, current_user.id)
    return report


@router.get("/", response_model=EvaluationReportPagination)
def list_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    evaluation_id: Optional[int] = Query(None, description="Filter by evaluation ID"),
    reporter_id: Optional[int] = Query(None, description="Filter by reporter ID"),
    reason: Optional[ReportReason] = Query(None, description="Filter by report reason"),
    resolved: Optional[int] = Query(None, description="Filter by resolution status (0: pending, 1: accepted, 2: rejected)"),
    sort_by: str = Query("timestamp", description="Sort by field"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)")
):
    """
    List evaluation reports.
    Admin only.
    """
    skip = (page - 1) * limit
    reports, total = get_evaluation_reports(
        db, 
        skip=skip, 
        limit=limit,
        evaluation_id=evaluation_id,
        reporter_id=reporter_id,
        reason=reason,
        resolved=resolved,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    return {
        "items": reports,
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get("/{report_id}", response_model=EvaluationReportWithDetails)
def get_report(
    report_id: int = Path(..., description="The ID of the report to retrieve"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get a specific evaluation report.
    Admin only.
    """
    report = get_evaluation_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.post("/{report_id}/resolve", response_model=EvaluationReportOut)
def resolve_report(
    resolution: int = Query(..., ge=1, le=2, description="Resolution (1: accept, 2: reject)"),
    report_id: int = Path(..., description="The ID of the report to resolve"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Resolve an evaluation report.
    Admin only.
    Resolution: 1 = accepted (take action), 2 = rejected (ignore)
    """
    success, message = resolve_evaluation_report(db, report_id, resolution, current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    report = get_evaluation_report_by_id(db, report_id)
    return report
