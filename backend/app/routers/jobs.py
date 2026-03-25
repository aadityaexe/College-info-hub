from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from .users import get_current_user_from_token

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)

# --------------------------------------------------------------------------- #
# Helper
# --------------------------------------------------------------------------- #

def _create_notification(db: Session, user_id: int, text: str, notif_type: str = "jobs"):
    notif = models.Notification(user_id=user_id, text=text, type=notif_type)
    db.add(notif)


# --------------------------------------------------------------------------- #
# Job CRUD
# --------------------------------------------------------------------------- #

@router.get("/", response_model=List[schemas.Job])
def read_jobs(
    skip: int = 0,
    limit: int = 100,
    job_type: str = None,
    location: str = None,
    db: Session = Depends(database.get_db)
):
    """List active jobs with optional filters for type and location."""
    query = db.query(models.Job).filter(models.Job.is_active == True)
    if job_type:
        query = query.filter(models.Job.type.ilike(f"%{job_type}%"))
    if location:
        query = query.filter(models.Job.location.ilike(f"%{location}%"))
    return query.order_by(models.Job.posted_date.desc()).offset(skip).limit(limit).all()


@router.get("/{job_id}", response_model=schemas.Job)
def read_job(job_id: int, db: Session = Depends(database.get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/", response_model=schemas.Job)
def create_job(
    job: schemas.JobCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    """Create a job. Only Alumni or Admins are authorised."""
    is_authorized = isinstance(current_user, models.Admin) or (
        hasattr(current_user, 'role') and str(current_user.role) in ['Admin', 'Alumni']
    )
    if not is_authorized:
        raise HTTPException(status_code=403, detail="Not authorized to post jobs")

    job_data = job.dict()
    if hasattr(current_user, 'name'):
        job_data['posted_by'] = current_user.name

    db_job = models.Job(**job_data)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    """Soft-delete a job by setting is_active = False."""
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    is_authorized = isinstance(current_user, models.Admin) or (
        hasattr(current_user, 'name') and job.posted_by == current_user.name
    )
    if not is_authorized:
        raise HTTPException(status_code=403, detail="Not authorized to delete this job")

    job.is_active = False
    db.commit()
    return {"message": "Job removed successfully"}


# --------------------------------------------------------------------------- #
# Applications
# --------------------------------------------------------------------------- #

@router.post("/{job_id}/apply", response_model=schemas.JobApplication)
def apply_job(
    job_id: int,
    application: schemas.JobApplicationCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    """Submit an application for a job with an optional cover letter and resume URL."""
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.is_active == True).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or no longer active")

    existing = db.query(models.JobApplication).filter(
        models.JobApplication.job_id == job_id,
        models.JobApplication.student_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied to this job")

    db_application = models.JobApplication(
        job_id=job_id,
        student_id=current_user.id,
        cover_letter=application.cover_letter,
        resume_url=application.resume_url
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application


@router.get("/{job_id}/applications", response_model=List[schemas.JobApplication])
def get_job_applications(
    job_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    """Get all applications for a job. Only the poster or admin can view."""
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    is_authorized = isinstance(current_user, models.Admin) or (
        hasattr(current_user, 'name') and job.posted_by == current_user.name
    )
    if not is_authorized:
        raise HTTPException(status_code=403, detail="Not authorized to view applications for this job")

    return (
        db.query(models.JobApplication)
        .filter(models.JobApplication.job_id == job_id)
        .order_by(models.JobApplication.applied_date.desc())
        .all()
    )


@router.get("/my/applications", response_model=List[schemas.JobApplication])
def get_my_applications(
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    """Get all job applications submitted by the current student."""
    return (
        db.query(models.JobApplication)
        .filter(models.JobApplication.student_id == current_user.id)
        .order_by(models.JobApplication.applied_date.desc())
        .all()
    )


@router.put("/applications/{application_id}/status", response_model=schemas.JobApplication)
def update_application_status(
    application_id: int,
    update: schemas.JobApplicationStatusUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    """Alumni updates the status of a specific application. Notifies the student."""
    application = db.query(models.JobApplication).filter(
        models.JobApplication.id == application_id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    job = application.job
    is_authorized = isinstance(current_user, models.Admin) or (
        hasattr(current_user, 'name') and job.posted_by == current_user.name
    )
    if not is_authorized:
        raise HTTPException(status_code=403, detail="Not authorized to update this application")

    # Track history
    history_entry = models.JobApplicationStatusHistory(
        application_id=application_id,
        old_status=application.status,
        new_status=update.status,
        note=update.note
    )
    db.add(history_entry)

    old_status = application.status
    application.status = update.status

    # Notify the student
    _create_notification(
        db,
        user_id=application.student_id,
        text=f"Your application for '{job.title}' at {job.company} has been updated to '{update.status}'."
    )

    db.commit()
    db.refresh(application)
    return application
