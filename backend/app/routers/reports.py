from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, database
from ..dependencies import get_current_user_from_token

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/", response_model=schemas.Report)
def create_report(
    report: schemas.ReportCreate,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user_from_token)
):
    """
    Allow any user to report content.
    """
    db_report = models.Report(
        reporter_id=current_user.id,
        target_id=report.target_id,
        target_type=report.target_type,
        reason=report.reason,
        description=report.description,
        status="Pending"
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

