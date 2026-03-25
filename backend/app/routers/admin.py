from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, utils, database
from .users import get_current_user_from_token

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# Dependency to check if user is admin
def get_current_admin(current_user: models.Student = Depends(get_current_user_from_token)):
    # Check if user is actually an admin model OR has admin role
    is_admin = False
    if isinstance(current_user, models.Admin):
        is_admin = True
    elif hasattr(current_user, 'role') and str(current_user.role).lower() == 'admin':
        is_admin = True
        
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )
    return current_user

@router.get("/stats")
def get_admin_stats(db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_admin)):
    total_students = db.query(models.Student).count()
    total_alumni = db.query(models.Student).filter(models.Student.role == 'Alumni').count()
    pending_approvals = db.query(models.Student).filter(models.Student.status == 'Pending').count()
    total_posts = db.query(models.Post).count()
    pending_posts = db.query(models.Post).filter(models.Post.is_approved == False).count()

    return {
        "totalStudents": total_students,
        "totalAlumni": total_alumni,
        "pendingApprovals": pending_approvals,
        "totalPosts": total_posts,
        "pendingPosts": pending_posts
    }

@router.get("/users", response_model=List[schemas.User])
def get_all_users(db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_admin)):
    # Return all students (including alumni)
    users = db.query(models.Student).all()
    # Ensure role is string for response
    for user in users:
        if hasattr(user, "role") and user.role:
            user.role = str(user.role).lower()
    return users

@router.post("/block/{user_id}")
def toggle_block_user(user_id: int, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_admin)):
    user = db.query(models.Student).filter(models.Student.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.status == 'Blocked':
        user.status = 'Active'
    else:
        user.status = 'Blocked'
        
    db.commit()
    return {"message": f"User status updated to {user.status}"}

@router.get("/pending-users", response_model=List[schemas.User])
def get_pending_users(db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_admin)):
    users = db.query(models.Student).filter(models.Student.status == 'Pending').all()
    # Ensure role is string
    for user in users:
        if hasattr(user, "role") and user.role:
            user.role = str(user.role).lower()
    return users

@router.post("/approve/{user_id}")
def approve_user(user_id: int, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_admin)):
    user = db.query(models.Student).filter(models.Student.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.status = 'Active'
    db.commit()
    return {"message": "User approved"}

@router.post("/reject/{user_id}")
def reject_user(user_id: int, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_admin)):
    user = db.query(models.Student).filter(models.Student.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Effectively delete or mark rejected. For now, let's delete to keep it clean, or we could have a 'Rejected' status.
    # Frontend logic for "Reject" usually implies deletion of the request or moving to rejected state.
    # Let's delete for now as per typical "approve/reject" flow in simple apps.
    db.delete(user)
    db.commit()
    return {"message": "User request rejected and removed"}

@router.get("/jobs", response_model=List[schemas.Job])
def get_all_jobs(db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_admin)):
    # Admin sees ALL jobs, even inactive ones
    jobs = db.query(models.Job).order_by(models.Job.posted_date.desc()).all()
    return jobs

@router.delete("/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_admin)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}


# ─── Post Moderation ──────────────────────────────────────────────────────────

@router.get("/posts/pending", response_model=List[schemas.Post])
def get_pending_posts(
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_admin)
):
    """List all posts awaiting approval, newest first."""
    return (
        db.query(models.Post)
        .filter(models.Post.is_approved == False)
        .order_by(models.Post.created_at.desc())
        .all()
    )


@router.get("/posts", response_model=List[schemas.Post])
def get_all_posts(
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_admin)
):
    """Admin can see ALL posts including unapproved ones."""
    return db.query(models.Post).order_by(models.Post.created_at.desc()).all()


@router.post("/posts/{post_id}/approve", response_model=schemas.Post)
def approve_post(
    post_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_admin)
):
    """Approve a post — it becomes visible in the public feed."""
    from datetime import datetime
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.is_approved = True
    post.approved_at = datetime.utcnow()
    post.approved_by = getattr(current_user, 'name', 'Admin')

    # Notify the author
    notif = models.Notification(
        user_id=post.user_id,
        text="Your post has been approved and is now visible to the community!",
        type="post"
    )
    db.add(notif)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/posts/{post_id}")
def reject_post(
    post_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_admin)
):
    """Reject (delete) a post — typically for content that violates guidelines."""
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Notify the author about rejection
    notif = models.Notification(
        user_id=post.user_id,
        text="Your recent post was not approved. It may have violated community guidelines.",
        type="post"
    )
    db.add(notif)
    db.delete(post)
    db.commit()
    return {"message": "Post rejected and removed"}


@router.get("/reports", response_model=List[schemas.Report])
def get_reports(db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_admin)):
    reports = db.query(models.Report).order_by(models.Report.created_at.desc()).all()
    return reports

class ReportAction(schemas.BaseModel):
    action: str # dismiss, delete_post, ban_user

@router.post("/reports/{report_id}/action")
def handle_report_action(report_id: int, action_data: ReportAction, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_admin)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    action = action_data.action
    
    if action == 'dismiss':
        report.status = 'Dismissed'
    
    elif action == 'delete_post':
        if report.target_type == 'Post':
            post = db.query(models.Post).filter(models.Post.id == report.target_id).first()
            if post:
                db.delete(post)
        report.status = 'Resolved'
        
    elif action == 'ban_user':
        # Assuming we can find the user from target_id if type is User, or from post -> user
        user_to_ban = None
        if report.target_type == 'User':
            user_to_ban = db.query(models.Student).filter(models.Student.id == report.target_id).first()
        elif report.target_type == 'Post':
             post = db.query(models.Post).filter(models.Post.id == report.target_id).first()
             if post:
                 user_to_ban = db.query(models.Student).filter(models.Student.id == post.user_id).first()
        
        if user_to_ban:
            user_to_ban.status = 'Blocked'
            
        report.status = 'Resolved'
        
    db.commit()
    return {"message": f"Report action {action} taken"}
