from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from .. import models, schemas, database
from .users import get_current_user_from_token
from .ws import notify_user_live

router = APIRouter(
    prefix="/mentorship",
    tags=["Mentorship"]
)

# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #

def _create_notification(db: Session, user_id: int, text: str, notif_type: str = "mentorship"):
    """Helper to insert an in-app notification."""
    notif = models.Notification(user_id=user_id, text=text, type=notif_type)
    db.add(notif)


# --------------------------------------------------------------------------- #
# Mentors
# --------------------------------------------------------------------------- #

@router.get("/mentors", response_model=List[schemas.User])
def read_mentors(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db)
):
    """Return all Alumni users who can serve as mentors."""
    return (
        db.query(models.Student)
        .filter(models.Student.role == 'Alumni', models.Student.status == 'Active')
        .offset(skip)
        .limit(limit)
        .all()
    )


# --------------------------------------------------------------------------- #
# Requests
# --------------------------------------------------------------------------- #

@router.post("/request", response_model=schemas.MentorshipRequest)
def create_mentorship_request(
    request: schemas.MentorshipRequestCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    """Students send a mentorship request. Duplicate pending requests are blocked."""
    existing = db.query(models.MentorshipRequest).filter(
        models.MentorshipRequest.student_id == current_user.id,
        models.MentorshipRequest.mentor_id == request.mentor_id,
        models.MentorshipRequest.status == 'Pending'
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="A pending request already exists for this mentor")

    expires_at = datetime.utcnow() + timedelta(days=7)   # Auto-expire in 7 days
    db_request = models.MentorshipRequest(
        **request.dict(),
        student_id=current_user.id,
        expires_at=expires_at
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)

    # Notify the mentor
    notif_text = f"New mentorship request from {current_user.name}."
    _create_notification(db, user_id=request.mentor_id, text=notif_text)
    db.commit()
    # Live push
    import asyncio
    try:
        asyncio.get_event_loop().run_until_complete(
            notify_user_live(request.mentor_id, notif_text, notif_type="info")
        )
    except Exception:
        pass
    return db_request


@router.get("/requests/incoming", response_model=List[schemas.MentorshipRequest])
def read_incoming_requests(
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    """Return all requests received by the current mentor. Auto-expire stale ones."""
    _expire_old_requests(db)
    return (
        db.query(models.MentorshipRequest)
        .filter(models.MentorshipRequest.mentor_id == current_user.id)
        .order_by(models.MentorshipRequest.created_at.desc())
        .all()
    )


@router.get("/requests", response_model=List[schemas.MentorshipRequest])
def read_my_requests(
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    """Return all requests sent by the current student."""
    return (
        db.query(models.MentorshipRequest)
        .filter(models.MentorshipRequest.student_id == current_user.id)
        .order_by(models.MentorshipRequest.created_at.desc())
        .all()
    )


@router.put("/requests/{request_id}", response_model=schemas.MentorshipRequest)
def update_request_status(
    request_id: int,
    status_update: schemas.MentorshipSessionUpdate,   # reuse {status, notes} shape
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    """Mentor accepts or rejects a request. Sends a notification to the student."""
    request = db.query(models.MentorshipRequest).filter(
        models.MentorshipRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if request.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this request")

    if status_update.status:
        request.status = status_update.status
        request.mentor_note = status_update.notes

        # Notify the student
        action_text = "accepted" if status_update.status == "Accepted" else status_update.status.lower()
        _create_notification(
            db,
            user_id=request.student_id,
            text=f"{current_user.name} has {action_text} your mentorship request."
        )

    db.commit()
    db.refresh(request)
    # Live push to student
    student_notif = f"{current_user.name} has {action_text} your mentorship request."
    import asyncio
    try:
        asyncio.get_event_loop().run_until_complete(
            notify_user_live(request.student_id, student_notif,
                             notif_type="success" if status_update.status == "Accepted" else "warning")
        )
    except Exception:
        pass
    return request


# --------------------------------------------------------------------------- #
# Sessions
# --------------------------------------------------------------------------- #

@router.post("/sessions", response_model=schemas.MentorshipSession)
def create_session(
    session_data: schemas.MentorshipSessionCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    """Schedule a new mentorship session for an accepted request."""
    request = db.query(models.MentorshipRequest).filter(
        models.MentorshipRequest.id == session_data.request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Mentorship request not found")
    if request.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the mentor can schedule sessions")
    if request.status != 'Accepted':
        raise HTTPException(status_code=400, detail="Can only schedule sessions for accepted requests")

    session = models.MentorshipSession(**session_data.dict())
    db.add(session)

    # Notify student
    _create_notification(
        db,
        user_id=request.student_id,
        text=f"{current_user.name} scheduled a new session: '{session_data.topic}'."
    )
    db.commit()
    db.refresh(session)
    return session


@router.get("/sessions/{request_id}", response_model=List[schemas.MentorshipSession])
def get_sessions(
    request_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    """Get all sessions for a given mentorship request."""
    request = db.query(models.MentorshipRequest).filter(
        models.MentorshipRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Mentorship request not found")
    if current_user.id not in [request.mentor_id, request.student_id]:
        raise HTTPException(status_code=403, detail="Not authorized to view these sessions")

    return (
        db.query(models.MentorshipSession)
        .filter(models.MentorshipSession.request_id == request_id)
        .order_by(models.MentorshipSession.scheduled_at.asc())
        .all()
    )


@router.put("/sessions/{session_id}", response_model=schemas.MentorshipSession)
def update_session(
    session_id: int,
    update: schemas.MentorshipSessionUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    """Update a session's status or add post-session notes."""
    session = db.query(models.MentorshipSession).filter(
        models.MentorshipSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.request.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the mentor can update sessions")

    if update.status:
        session.status = update.status
    if update.notes is not None:
        session.notes = update.notes

    db.commit()
    db.refresh(session)
    return session


# --------------------------------------------------------------------------- #
# Private helpers
# --------------------------------------------------------------------------- #

def _expire_old_requests(db: Session):
    """Mark overdue Pending requests as Rejected automatically."""
    now = datetime.utcnow()
    expired = (
        db.query(models.MentorshipRequest)
        .filter(
            models.MentorshipRequest.status == 'Pending',
            models.MentorshipRequest.expires_at != None,
            models.MentorshipRequest.expires_at < now
        )
        .all()
    )
    for req in expired:
        req.status = 'Rejected'
        req.mentor_note = 'Automatically rejected due to inactivity.'
    if expired:
        db.commit()
