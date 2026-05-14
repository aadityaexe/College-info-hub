from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from pydantic import BaseModel
from ..dependencies import get_current_user_from_token

router = APIRouter(
    prefix="/events",
    tags=["Events"]
)

@router.get("/", response_model=List[schemas.Event])
def read_events(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_user_from_token)):
    query = db.query(models.Event)
    
    # Audience Filtering
    # If admin, show all (or maybe filtered? Let's show all for now)
    if isinstance(current_user, models.Admin):
        pass # Admin sees all
    elif hasattr(current_user, 'role') and current_user.role == 'Student':
        query = query.filter(models.Event.audience != 'Alumni Only')
    elif hasattr(current_user, 'role') and current_user.role == 'Alumni':
        query = query.filter(models.Event.audience != 'Students Only')
        
    events = query.order_by(models.Event.date.desc()).offset(skip).limit(limit).all()

    # Convert to response model manually to ensure user_rsvp is included
    event_responses = []
    for event in events:
        attendance = db.query(models.EventAttendee).filter(
            models.EventAttendee.event_id == event.id,
            models.EventAttendee.student_id == current_user.id
        ).first()
        
        user_rsvp_status = attendance.status if attendance else None
        
        event_responses.append(
            schemas.Event(
                id=event.id,
                title=event.title,
                type=event.type,
                audience=event.audience,
                date=str(event.date) if event.date else None,
                time=event.time,
                location=event.location,
                description=event.description,
                image=event.image,
                attendees=event.attendees,
                user_rsvp=user_rsvp_status
            )
        )

    return event_responses

@router.post("/", response_model=schemas.Event)
def create_event(event: schemas.EventCreate, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_user_from_token)):
    # In a real app, check if user is allowed to create events (e.g. Admin or Alumni)
    db_event = models.Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    # Manually constructed response to ensure user_rsvp is present
    return schemas.Event(
        id=db_event.id,
        title=db_event.title,
        type=db_event.type,
        audience=db_event.audience,
        date=str(db_event.date) if db_event.date else None,
        time=db_event.time,
        location=db_event.location,
        description=db_event.description,
        image=db_event.image,
        attendees=db_event.attendees,
        user_rsvp=None
    )

class RsvpRequest(BaseModel):
    status: str

@router.post("/{event_id}/rsvp")
def rsvp_event(event_id: int, rsvp: RsvpRequest, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_user_from_token)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check existing RSVP
    attendee = db.query(models.EventAttendee).filter(
        models.EventAttendee.event_id == event_id,
        models.EventAttendee.student_id == current_user.id
    ).first()

    if attendee:
        attendee.status = rsvp.status
    else:
        attendee = models.EventAttendee(
            event_id=event_id,
            student_id=current_user.id,
            status=rsvp.status
        )
        db.add(attendee)
    
    # Update Total Count (Denormalized)
    # Update Total Count (Denormalized)
    # Count all "going" or "attending"
    db.commit() # Ensure the new/updated attendee is written to DB before counting
    count = db.query(models.EventAttendee).filter(
        models.EventAttendee.event_id == event_id,
        (models.EventAttendee.status == "going") | (models.EventAttendee.status == "attending")
    ).count()
    
    event.attendees = count
    db.add(event)
    db.commit()
    
    return {"message": "RSVP successful", "status": rsvp.status}

@router.put("/{event_id}", response_model=schemas.Event)
def update_event(event_id: int, event: schemas.EventCreate, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_user_from_token)):
    # Permission check: Admin or Alumni
    is_authorized = False
    
    if isinstance(current_user, models.Admin):
        is_authorized = True
    elif hasattr(current_user, 'role') and str(current_user.role) in ['Admin', 'Alumni']:
        is_authorized = True
        
    if not is_authorized:
        raise HTTPException(status_code=403, detail="Not authorized to update events")

    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    for key, value in event.dict().items():
        setattr(db_event, key, value)
    
    db.commit()
    db.refresh(db_event)
    return schemas.Event(
        id=db_event.id,
        title=db_event.title,
        type=db_event.type,
        audience=db_event.audience,
        date=str(db_event.date) if db_event.date else None,
        time=db_event.time,
        location=db_event.location,
        description=db_event.description,
        image=db_event.image,
        attendees=db_event.attendees,
        user_rsvp=None
    )

@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_user_from_token)):
    # Permission check
    is_authorized = False
    
    if isinstance(current_user, models.Admin):
        is_authorized = True
    elif hasattr(current_user, 'role') and str(current_user.role) in ['Admin', 'Alumni']:
        is_authorized = True
        
    if not is_authorized:
         raise HTTPException(status_code=403, detail="Not authorized to delete events")

    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(db_event)
    db.commit()
    return {"message": "Event deleted"}
