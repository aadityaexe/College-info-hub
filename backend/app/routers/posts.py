from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database
from .users import get_current_user_from_token

router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)

@router.get("/", response_model=List[schemas.Post])
def read_posts(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    posts = db.query(models.Post).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()
    return posts

@router.post("/", response_model=schemas.Post)
def create_post(post: schemas.PostCreate, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_user_from_token)):
    db_post = models.Post(**post.dict(), user_id=current_user.id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@router.get("/{post_id}", response_model=schemas.Post)
def read_post(post_id: int, db: Session = Depends(database.get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.post("/{post_id}/comments", response_model=schemas.Comment)
def create_comment(post_id: int, comment: schemas.CommentCreate, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_user_from_token)):
    # Verify post exists
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    db_comment = models.Comment(**comment.dict(), post_id=post_id, user_id=current_user.id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.post("/{post_id}/like")
def like_post(post_id: int, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_user_from_token)):
    # Verify post exists
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if already liked
    existing_like = db.query(models.PostLike).filter(
        models.PostLike.post_id == post_id,
        models.PostLike.user_id == current_user.id
    ).first()
    
    if existing_like:
        # User already liked this post. Use 400 or just return success with "already liked" message to be idempotent?
        # Requirement: "only one time only". 400 effectively says "you can't do this again".
        # Let's toggle it? Or just return 400? "limit to one time only" sounds like 400 on second try.
        # But for better UX, usually it's a toggle. Explicit request "one user... one time only"
        # I will return 400 Bad Request if already liked.
        raise HTTPException(status_code=400, detail="You have already liked this post")

    # Add new like
    new_like = models.PostLike(post_id=post_id, user_id=current_user.id)
    db.add(new_like)
    post.likes_count += 1
    db.commit()
    
    return {"message": "Post liked", "likes_count": post.likes_count}
