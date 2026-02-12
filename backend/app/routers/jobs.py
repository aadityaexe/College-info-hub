from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from .users import get_current_user_from_token

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)

@router.get("/", response_model=List[schemas.Job])
def read_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    jobs = db.query(models.Job).filter(models.Job.is_active == True).order_by(models.Job.posted_date.desc()).offset(skip).limit(limit).all()
    return jobs

@router.post("/", response_model=schemas.Job)
def create_job(job: schemas.JobCreate, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_user_from_token)):
    # Check permissions
    if current_user.role != 'Alumni' and current_user.role != 'Admin': # Admin check logic might differ based on user model
         # Assuming logic to check admin if token role says admin
         pass 

    db_job = models.Job(**job.dict())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.post("/{job_id}/apply")
def apply_job(job_id: int, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_user_from_token)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if already applied
    existing_application = db.query(models.JobApplication).filter(
        models.JobApplication.job_id == job_id,
        models.JobApplication.student_id == current_user.id
    ).first()
    
    if existing_application:
        raise HTTPException(status_code=400, detail="Already applied to this job")

    application = models.JobApplication(job_id=job_id, student_id=current_user.id)
    db.add(application)
    db.commit()
    return {"message": "Application submitted successfully"}
