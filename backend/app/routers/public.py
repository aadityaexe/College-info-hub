"""
Public Read-Only Router
Endpoints accessible WITHOUT authentication for the public explore page.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from .. import models, schemas, database

router = APIRouter(prefix="/public", tags=["Public"])


# ── Platform Stats ────────────────────────────────────────────────────────────

@router.get("/stats")
def get_platform_stats(db: Session = Depends(database.get_db)):
    """Return aggregate platform numbers for the landing/explore page."""
    total_students = db.query(models.Student).filter(
        models.Student.role == 'Student', models.Student.status == 'Active'
    ).count()
    total_alumni = db.query(models.Student).filter(
        models.Student.role == 'Alumni', models.Student.status == 'Active'
    ).count()
    total_posts = db.query(models.Post).filter(models.Post.is_approved == True).count()
    total_jobs = db.query(models.Job).filter(models.Job.is_active == True).count()
    total_events = db.query(models.Event).count()
    total_mentors = db.query(models.Student).filter(
        models.Student.role == 'Alumni', models.Student.status == 'Active'
    ).count()

    return {
        "total_students": total_students,
        "total_alumni": total_alumni,
        "total_members": total_students + total_alumni,
        "total_posts": total_posts,
        "total_jobs": total_jobs,
        "total_events": total_events,
        "total_mentors": total_mentors,
    }


# ── Public Events (no auth required) ─────────────────────────────────────────

@router.get("/events")
def get_public_events(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(database.get_db),
):
    """Return upcoming events visible to the public (no RSVP info)."""
    events = (
        db.query(models.Event)
        .filter(models.Event.audience != 'Alumni Only')
        .order_by(models.Event.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": e.id,
            "title": e.title,
            "type": e.type,
            "audience": e.audience,
            "date": str(e.date) if e.date else None,
            "time": e.time,
            "location": e.location,
            "description": e.description,
            "image": e.image,
            "attendees": e.attendees,
        }
        for e in events
    ]


# ── Public Mentors ────────────────────────────────────────────────────────────

@router.get("/mentors")
def get_public_mentors(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(database.get_db),
):
    """Return active alumni mentors for public display (limited info)."""
    mentors = (
        db.query(models.Student)
        .filter(models.Student.role == 'Alumni', models.Student.status == 'Active')
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": m.id,
            "name": m.name,
            "department": m.course,
            "batch": m.batch,
            "bio": m.bio,
            "skills": m.skills,
            "avatar": m.avatar,
        }
        for m in mentors
    ]
