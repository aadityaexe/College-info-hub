from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas, database
from .users import get_current_user_from_token

router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)

# --------------------------------------------------------------------------- #
# Public Feed — only approved posts
# --------------------------------------------------------------------------- #

@router.get("/", response_model=List[schemas.Post])
def read_posts(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    """Return only approved posts for the public feed."""
    posts = (
        db.query(models.Post)
        .filter(models.Post.is_approved == True)
        .order_by(models.Post.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return posts


@router.post("/", response_model=schemas.Post)
def create_post(
    post: schemas.PostCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    """Create a post. It starts as unapproved and won't appear in the feed until admin approves it."""
    db_post = models.Post(**post.dict(), user_id=current_user.id, is_approved=False)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.get("/my", response_model=List[schemas.Post])
def read_my_posts(
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    """A user can view all their own posts, including unapproved ones."""
    return (
        db.query(models.Post)
        .filter(models.Post.user_id == current_user.id)
        .order_by(models.Post.created_at.desc())
        .all()
    )


@router.get("/{post_id}", response_model=schemas.Post)
def read_post(post_id: int, db: Session = Depends(database.get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("/{post_id}/comments", response_model=schemas.Comment)
def create_comment(
    post_id: int,
    comment: schemas.CommentCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db_comment = models.Comment(**comment.dict(), post_id=post_id, user_id=current_user.id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


@router.post("/{post_id}/like")
def like_post(
    post_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.Student = Depends(get_current_user_from_token)
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing_like = db.query(models.PostLike).filter(
        models.PostLike.post_id == post_id,
        models.PostLike.user_id == current_user.id
    ).first()

    if existing_like:
        # Toggle: unlike if already liked
        db.delete(existing_like)
        post.likes_count = max(0, post.likes_count - 1)
        db.commit()
        return {"message": "Post unliked", "likes_count": post.likes_count}

    new_like = models.PostLike(post_id=post_id, user_id=current_user.id)
    db.add(new_like)
    post.likes_count += 1
    db.commit()
    return {"message": "Post liked", "likes_count": post.likes_count}
