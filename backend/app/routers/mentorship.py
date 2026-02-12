from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from .users import get_current_user_from_token

router = APIRouter(
    prefix="/mentorship",
    tags=["Mentorship"]
)

@router.get("/mentors", response_model=List[schemas.User])
def read_mentors(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    # Assuming all Alumni are potential mentors for now
    mentors = db.query(models.Student).filter(models.Student.role == 'Alumni').offset(skip).limit(limit).all()
    return mentors

@router.post("/request", response_model=schemas.MentorshipRequest)
def create_mentorship_request(request: schemas.MentorshipRequestCreate, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_user_from_token)):
    # Check if request already exists
    existing = db.query(models.MentorshipRequest).filter(
        models.MentorshipRequest.student_id == current_user.id,
        models.MentorshipRequest.mentor_id == request.mentor_id,
        models.MentorshipRequest.status == 'Pending'
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Pending request already exists")

    db_request = models.MentorshipRequest(**request.dict(), student_id=current_user.id)
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.get("/requests", response_model=List[schemas.MentorshipRequest])
def read_my_requests(db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_user_from_token)):
    # Get requests sent by student OR received by mentor (if user is alumni)
    if current_user.role == 'Alumni':
        requests = db.query(models.MentorshipRequest).filter(models.MentorshipRequest.mentor_id == current_user.id).all()
    else:
        requests = db.query(models.MentorshipRequest).filter(models.MentorshipRequest.student_id == current_user.id).all()
    return requests

@router.put("/requests/{request_id}")
def update_request_status(request_id: int, status_update: str, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_user_from_token)):
    # Only mentor can accept/reject
    request = db.query(models.MentorshipRequest).filter(models.MentorshipRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    request.status = status_update
    db.commit()
    return {"message": "Status updated"}
