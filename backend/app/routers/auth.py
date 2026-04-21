from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, utils, database
from ..dependencies import get_current_user_from_token
from datetime import timedelta

router = APIRouter(tags=["Authentication"])


@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """Register a new user. The account starts in Pending status until admin approval."""
    # Check email uniqueness
    db_user = db.query(models.Student).filter(models.Student.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = utils.get_password_hash(user.password)

    # Determine role: public registration defaults to Student.
    # Alumni accounts are created by admin or through a separate flow.
    registration_role = "Student"

    db_user = models.Student(
        email=user.email,
        name=user.name,
        password=hashed_password,
        role=registration_role,
        status="Pending",
        reg_no=user.reg_no,
        course=user.course,
        batch=user.batch,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    access_token_expires = timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = utils.create_access_token(
        data={"sub": db_user.email, "role": "student", "id": db_user.id},
        expires_delta=access_token_expires,
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": "student",
        "id": db_user.id,
    }


@router.post("/token", response_model=schemas.Token)
def login_for_access_token(
    user_credentials: schemas.UserLogin,
    db: Session = Depends(database.get_db),
):
    """Authenticate a user and return a JWT access token."""
    # ── Check student table ────────────────────────────────────────────────────
    student = db.query(models.Student).filter(
        models.Student.email == user_credentials.email
    ).first()

    if student:
        if not utils.verify_password(user_credentials.password, student.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Blocked users are rejected at the token boundary
        if student.status == "Blocked":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been suspended. Please contact an administrator.",
            )

        user_role = str(student.role).lower() if student.role else "student"
        access_token = utils.create_access_token(
            data={"sub": student.email, "role": user_role, "id": student.id},
            expires_delta=timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": user_role,
            "id": student.id,
        }

    # ── Check admin table ──────────────────────────────────────────────────────
    admin = db.query(models.Admin).filter(
        models.Admin.email == user_credentials.email
    ).first()

    if admin:
        if not utils.verify_password(user_credentials.password, admin.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = utils.create_access_token(
            data={"sub": admin.email, "role": "admin", "id": admin.id},
            expires_delta=timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": "admin",
            "id": admin.id,
        }

    # No matching user found
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )
