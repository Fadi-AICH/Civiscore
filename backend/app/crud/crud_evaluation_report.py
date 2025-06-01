from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, asc

from app.models.evaluation_report import EvaluationReport, ReportReason
from app.models.evaluation import Evaluation, EvaluationStatus
from app.models.user import User
from app.schemas.evaluation import EvaluationReportCreate


def create_evaluation_report(
    db: Session, report: EvaluationReportCreate, reporter_id: int
) -> EvaluationReport:
    """
    Create a new evaluation report.
    """
    db_report = EvaluationReport(
        evaluation_id=report.evaluation_id,
        reporter_id=reporter_id,
        reason=report.reason,
        description=report.description,
        timestamp=datetime.utcnow(),
        resolved=0
    )
    
    # Automatically flag the evaluation if it has multiple reports
    evaluation = db.query(Evaluation).filter(Evaluation.id == report.evaluation_id).first()
    if evaluation:
        reports_count = db.query(EvaluationReport).filter(
            EvaluationReport.evaluation_id == report.evaluation_id,
            EvaluationReport.resolved == 0
        ).count()
        
        # If this is at least the second unresolved report, flag the evaluation
        if reports_count >= 1:
            evaluation.status = EvaluationStatus.FLAGGED
            db.add(evaluation)
    
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


def get_evaluation_reports(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    evaluation_id: Optional[int] = None,
    reporter_id: Optional[int] = None,
    reason: Optional[ReportReason] = None,
    resolved: Optional[int] = None,
    sort_by: str = "timestamp",
    sort_order: str = "desc"
) -> Tuple[List[EvaluationReport], int]:
    """
    Get evaluation reports with filtering and sorting options.
    """
    query = db.query(EvaluationReport)
    
    # Apply filters
    if evaluation_id is not None:
        query = query.filter(EvaluationReport.evaluation_id == evaluation_id)
    if reporter_id is not None:
        query = query.filter(EvaluationReport.reporter_id == reporter_id)
    if reason is not None:
        query = query.filter(EvaluationReport.reason == reason)
    if resolved is not None:
        query = query.filter(EvaluationReport.resolved == resolved)
    
    # Count total before pagination
    total = query.count()
    
    # Apply sorting
    if sort_order.lower() == "asc":
        query = query.order_by(asc(getattr(EvaluationReport, sort_by)))
    else:
        query = query.order_by(desc(getattr(EvaluationReport, sort_by)))
    
    # Apply pagination
    reports = query.offset(skip).limit(limit).all()
    
    return reports, total


def get_evaluation_report_by_id(db: Session, report_id: int) -> Optional[EvaluationReport]:
    """
    Get an evaluation report by ID.
    """
    return db.query(EvaluationReport).filter(EvaluationReport.id == report_id).first()


def resolve_evaluation_report(
    db: Session, report_id: int, resolution: int, admin_id: int
) -> Tuple[bool, str]:
    """
    Resolve an evaluation report.
    Resolution: 1 = accepted (take action), 2 = rejected (ignore)
    """
    report = db.query(EvaluationReport).filter(EvaluationReport.id == report_id).first()
    if not report:
        return False, "Report not found"
    
    if report.resolved != 0:
        return False, "Report already resolved"
    
    report.resolved = resolution
    
    # If accepting the report, update the evaluation status
    if resolution == 1:
        evaluation = db.query(Evaluation).filter(Evaluation.id == report.evaluation_id).first()
        if evaluation:
            evaluation.status = EvaluationStatus.REJECTED
            db.add(evaluation)
    
    # If rejecting the report and there are no other unresolved reports,
    # restore the evaluation status to APPROVED
    elif resolution == 2:
        unresolved_reports = db.query(EvaluationReport).filter(
            EvaluationReport.evaluation_id == report.evaluation_id,
            EvaluationReport.resolved == 0,
            EvaluationReport.id != report_id
        ).count()
        
        if unresolved_reports == 0:
            evaluation = db.query(Evaluation).filter(Evaluation.id == report.evaluation_id).first()
            if evaluation and evaluation.status == EvaluationStatus.FLAGGED:
                evaluation.status = EvaluationStatus.APPROVED
                db.add(evaluation)
    
    db.add(report)
    db.commit()
    db.refresh(report)
    return True, "Report resolved successfully"
