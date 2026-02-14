from fastapi import APIRouter, Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm (Unused)
from sqlalchemy.orm import Session
from .. import models, schemas, utils, database
from datetime import timedelta

router = APIRouter(
    tags=["Authentication"]
)

@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check if user already exists
    db_user = db.query(models.Student).filter(models.Student.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = utils.get_password_hash(user.password)
    db_user = models.Student(
        email=user.email,
        name=user.name,
        password=hashed_password,
        role='Student', # Force student role for public registration
        status='Pending'
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Generate token immediately
    access_token_expires = timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = utils.create_access_token(
        data={"sub": db_user.email, "role": "student", "id": db_user.id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": "student", "id": db_user.id}

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    # Check student table
    student = db.query(models.Student).filter(models.Student.email == user_credentials.email).first()
    if student:
        # Note: In real app, verify hash. 
        # Check if password matches
        
        password_match = False
        try:
            if utils.verify_password(user_credentials.password, student.password):
                 password_match = True
        except:
            pass
        
        if not password_match and student.password == user_credentials.password:
             password_match = True

        if not password_match:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES)
        # Use actual role from DB (convert enum to str just in case)
        user_role = str(student.role) if student.role else "Student"
        
        access_token = utils.create_access_token(
            data={"sub": student.email, "role": user_role, "id": student.id}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer", "role": user_role, "id": student.id}

    # Check admin table
    admin = db.query(models.Admin).filter(models.Admin.email == user_credentials.email).first()
    if admin:
        password_match = False
        try:
            if utils.verify_password(user_credentials.password, admin.password):
                 password_match = True
        except:
            pass
        
        if not password_match and admin.password == user_credentials.password:
             password_match = True

        if not password_match:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        access_token_expires = timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = utils.create_access_token(
            data={"sub": admin.email, "role": "admin", "id": admin.id}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer", "role": "admin", "id": admin.id}

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )
