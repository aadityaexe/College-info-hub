from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from .. import models, schemas, database
from ..dependencies import get_current_user_from_token, get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


# ─── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
):
    total_students = db.query(models.Student).filter(models.Student.role == "Student").count()
    total_alumni = db.query(models.Student).filter(models.Student.role == "Alumni").count()
    pending_approvals = db.query(models.Student).filter(models.Student.status == "Pending").count()
    total_posts = db.query(models.Post).count()
    pending_posts = db.query(models.Post).filter(models.Post.is_approved == False).count()

    return {
        "totalStudents": total_students,
        "totalAlumni": total_alumni,
        "pendingApprovals": pending_approvals,
        "totalPosts": total_posts,
        "pendingPosts": pending_posts,
    }


# ─── User Management ──────────────────────────────────────────────────────────

@router.get("/users", response_model=List[schemas.User])
def get_all_users(
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
):
    """Return all students and alumni."""
    users = db.query(models.Student).all()
    for user in users:
        if hasattr(user, "role") and user.role:
            user.role = str(user.role).lower()
    return users


@router.get("/pending-users", response_model=List[schemas.User])
def get_pending_users(
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
):
    """Return all users awaiting admin approval."""
    users = db.query(models.Student).filter(models.Student.status == "Pending").all()
    for user in users:
        if hasattr(user, "role") and user.role:
            user.role = str(user.role).lower()
    return users


@router.post("/approve/{user_id}")
def approve_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
):
    user = db.query(models.Student).filter(models.Student.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = "Active"
    db.commit()
    return {"message": "User approved successfully"}


@router.post("/reject/{user_id}")
def reject_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
):
    """Reject and remove a pending user registration."""
    user = db.query(models.Student).filter(models.Student.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User request rejected and removed"}


@router.post("/block/{user_id}")
def toggle_block_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
):
    """Toggle a user's blocked/active status."""
    user = db.query(models.Student).filter(models.Student.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = "Active" if user.status == "Blocked" else "Blocked"
    db.commit()
    return {"message": f"User status updated to {user.status}"}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
):
    """Permanently delete a user and all associated data (cascade)."""
    user = db.query(models.Student).filter(models.Student.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User permanently deleted"}


# ─── Job Management ────────────────────────────────────────────────────────────

@router.get("/jobs", response_model=List[schemas.Job])
def get_all_jobs(
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
):
    """Admin sees ALL jobs including inactive ones."""
    return db.query(models.Job).order_by(models.Job.posted_date.desc()).all()


@router.delete("/jobs/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}


# ─── Post Moderation & Notice ──────────────────────────────────────────────────

@router.post("/posts/notice", response_model=schemas.Post)
def create_admin_notice(
    post: schemas.PostCreate,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
):
    """Admin creates a global notice/announcement. It bypasses user_id constraints by setting user_id null and type='notice'."""
    from datetime import datetime, timezone
    
    # We leave user_id=None since it's an admin post, not a student post
    db_post = models.Post(
        content=post.content,
        image=post.image,
        type='notice',
        is_approved=True,
        approved_at=datetime.now(timezone.utc),
        approved_by=getattr(current_user, "name", "System Admin")
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@router.get("/posts/pending", response_model=List[schemas.Post])
def get_pending_posts(
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
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
    current_user=Depends(get_current_admin),
):
    """Admin can see ALL posts including unapproved ones."""
    return db.query(models.Post).order_by(models.Post.created_at.desc()).all()


@router.post("/posts/{post_id}/approve", response_model=schemas.Post)
def approve_post(
    post_id: int,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
):
    """Approve a post — makes it visible in the public feed."""
    from datetime import datetime, timezone

    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.is_approved = True
    post.approved_at = datetime.now(timezone.utc)
    post.approved_by = getattr(current_user, "name", "Admin")

    notif = models.Notification(
        user_id=post.user_id,
        text="Your post has been approved and is now visible to the community!",
        type="post",
    )
    db.add(notif)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/posts/{post_id}")
def reject_post(
    post_id: int,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
):
    """Reject (delete) a post that violates community guidelines."""
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    notif = models.Notification(
        user_id=post.user_id,
        text="Your recent post was not approved. It may have violated community guidelines.",
        type="post",
    )
    db.add(notif)
    db.delete(post)
    db.commit()
    return {"message": "Post rejected and removed"}


# ─── Reports ──────────────────────────────────────────────────────────────────

@router.get("/reports", response_model=List[schemas.Report])
def get_reports(
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
):
    return db.query(models.Report).order_by(models.Report.created_at.desc()).all()


class ReportAction(BaseModel):
    action: str  # dismiss | delete_post | ban_user


@router.post("/reports/{report_id}/action")
def handle_report_action(
    report_id: int,
    action_data: ReportAction,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    action = action_data.action

    if action == "dismiss":
        report.status = "Dismissed"

    elif action == "delete_post":
        if report.target_type == "Post":
            post = db.query(models.Post).filter(models.Post.id == report.target_id).first()
            if post:
                db.delete(post)
        report.status = "Resolved"

    elif action == "ban_user":
        user_to_ban = None
        if report.target_type == "User":
            user_to_ban = db.query(models.Student).filter(
                models.Student.id == report.target_id
            ).first()
        elif report.target_type == "Post":
            post = db.query(models.Post).filter(models.Post.id == report.target_id).first()
            if post:
                user_to_ban = db.query(models.Student).filter(
                    models.Student.id == post.user_id
                ).first()

        if user_to_ban:
            user_to_ban.status = "Blocked"
        report.status = "Resolved"

    else:
        raise HTTPException(status_code=400, detail=f"Unknown action: {action}")

    db.commit()
    return {"message": f"Report action '{action}' completed"}


# ── Activity Feed ─────────────────────────────────────────────────────────────

from datetime import datetime, timezone

def _relative_time(dt: datetime) -> str:
    """Return a human-readable relative time string."""
    if dt is None:
        return "unknown"
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return f"{seconds} sec ago"
    elif seconds < 3600:
        return f"{seconds // 60} min ago"
    elif seconds < 86400:
        return f"{seconds // 3600} hr ago"
    else:
        return f"{seconds // 86400} days ago"


@router.get("/activity", response_model=List[schemas.AdminActivityEvent])
def get_admin_activity(
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
):
    """
    Return the 20 most recent platform events across users, jobs, posts, and reports.
    """
    events = []

    # Recent user registrations (last 5)
    recent_users = (
        db.query(models.Student)
        .order_by(models.Student.created_at.desc())
        .limit(5).all()
    )
    for u in recent_users:
        role_label = "Alumni" if str(u.role).lower() == "alumni" else "Student"
        events.append({
            "msg": f"New {role_label} registered: {u.name}",
            "time": _relative_time(u.created_at),
            "type": "user",
            "_dt": u.created_at,
        })

    # Recent job postings (last 5)
    recent_jobs = (
        db.query(models.Job)
        .order_by(models.Job.posted_date.desc())
        .limit(5).all()
    )
    for j in recent_jobs:
        events.append({
            "msg": f"New job posted: {j.title} at {j.company}",
            "time": _relative_time(j.posted_date),
            "type": "job",
            "_dt": j.posted_date,
        })

    # Recent posts (last 5)
    recent_posts = (
        db.query(models.Post)
        .order_by(models.Post.created_at.desc())
        .limit(5).all()
    )
    for p in recent_posts:
        author = p.user.name if p.user else "System Admin"
        events.append({
            "msg": f"New post submitted by {author}",
            "time": _relative_time(p.created_at),
            "type": "post",
            "_dt": p.created_at,
        })

    # Recent reports (last 5)
    recent_reports = (
        db.query(models.Report)
        .order_by(models.Report.created_at.desc())
        .limit(5).all()
    )
    for r in recent_reports:
        events.append({
            "msg": f"New report filed: {r.target_type} #{r.target_id} — {r.reason}",
            "time": _relative_time(r.created_at),
            "type": "report",
            "_dt": r.created_at,
        })

    # Sort all by datetime descending and return top 20
    events.sort(key=lambda x: x.get("_dt") or datetime.min, reverse=True)
    return [
        {"msg": e["msg"], "time": e["time"], "type": e["type"]}
        for e in events[:20]
    ]


# ── System Settings ────────────────────────────────────────────────────────────


def _get_or_create_settings(db: Session) -> models.SystemSettings:
    """Return the singleton settings row, creating it if not yet present."""
    settings = db.query(models.SystemSettings).first()
    if not settings:
        settings = models.SystemSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("/settings", response_model=schemas.SystemSettingsOut)
def get_settings(
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
):
    """Return current system settings."""
    return _get_or_create_settings(db)


@router.put("/settings", response_model=schemas.SystemSettingsOut)
def update_settings(
    payload: schemas.SystemSettingsUpdate,
    db: Session = Depends(database.get_db),
    current_user=Depends(get_current_admin),
):
    """Update system settings (partial update supported)."""
    settings = _get_or_create_settings(db)
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings
