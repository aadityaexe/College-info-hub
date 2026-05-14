from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from ..dependencies import get_current_user_from_token

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=schemas.User)
async def read_users_me(
    current_user=Depends(get_current_user_from_token),
):
    """Return the currently authenticated user's profile."""
    if isinstance(current_user, models.Admin):
        current_user.role = "admin"
    elif hasattr(current_user, "role") and current_user.role:
        current_user.role = str(current_user.role).lower()
    return current_user


@router.put("/me", response_model=schemas.User)
def update_user_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user_from_token),
):
    """Update the currently authenticated user's profile fields."""
    if isinstance(current_user, models.Admin):
        user = db.query(models.Admin).filter(models.Admin.id == current_user.id).first()
    else:
        user = db.query(models.Student).filter(models.Student.id == current_user.id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_update.dict(exclude_unset=True)

    profile_fields = {"bio", "skills", "location", "avatar"}
    user_fields = set(update_data.keys()) - profile_fields

    # Update Student/Admin table fields
    for key in user_fields:
        if hasattr(user, key):
            setattr(user, key, update_data[key])

    # Update StudentProfile fields (not applicable for admins)
    if not isinstance(user, models.Admin) and any(f in update_data for f in profile_fields):
        if not user.profile:
            user.profile = models.StudentProfile(student_id=user.id)

        for key in profile_fields:
            if key in update_data:
                setattr(user.profile, key, update_data[key])

    db.commit()
    db.refresh(user)

    # Re-normalise role for response
    if isinstance(user, models.Admin):
        user.role = "admin"
    elif hasattr(user, "role") and user.role:
        user.role = str(user.role).lower()

    return user


@router.get("/me/stats", response_model=schemas.UserStats)
def get_my_stats(
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_user_from_token),
):
    """Return real activity counts for the currently authenticated user."""
    if isinstance(current_user, models.Admin):
        raise HTTPException(status_code=403, detail="Admins do not have personal stats.")

    posts_count = db.query(models.Post).filter(
        models.Post.user_id == current_user.id
    ).count()

    applications_count = db.query(models.JobApplication).filter(
        models.JobApplication.student_id == current_user.id
    ).count()

    mentorships_count = db.query(models.MentorshipRequest).filter(
        (models.MentorshipRequest.student_id == current_user.id) |
        (models.MentorshipRequest.mentor_id == current_user.id)
    ).count()

    events_count = db.query(models.EventAttendee).filter(
        models.EventAttendee.student_id == current_user.id
    ).count()

    return {
        "posts_count": posts_count,
        "applications_count": applications_count,
        "mentorships_count": mentorships_count,
        "events_count": events_count,
    }


@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(database.get_db)):
    """Retrieve a user's public profile by ID."""
    db_user = db.query(models.Student).filter(models.Student.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
