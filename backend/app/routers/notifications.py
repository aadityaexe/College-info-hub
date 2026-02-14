from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from .users import get_current_user_from_token

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)

@router.get("/", response_model=List[schemas.Notification])
def get_notifications(
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    notifications = db.query(models.Notification).filter(models.Notification.user_id == current_user.id).all()
    # Sort by created_at desc (newest first) - assuming ID is roughly chronological for now or use created_at if available
    # The schema has created_at, but let's just reverse the list or order by id desc
    return sorted(notifications, key=lambda x: x.id, reverse=True)

@router.put("/read-all")
def mark_all_read(
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    db.query(models.Notification).\
        filter(models.Notification.user_id == current_user.id).\
        update({"read": True})
    db.commit()
    return {"message": "All notifications marked as read"}
