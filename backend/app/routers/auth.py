from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
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
        role='Student' # Force student role for public registration
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

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # Check student table
    student = db.query(models.Student).filter(models.Student.email == form_data.username).first()
    if student:
        # Note: In real app, verify hash. Here we use plain text for now if legacy data is plain, 
        # BUT new users should be hashed. 
        # Check if password matches (mock data might be plain text or hashed)
        # For simplicity in this migration, let's assume we comparing simple strings OR verify hash
        # WARNING: Mock data passwords are likely plain text like '1234' or 'admin123'
        
        # Simple check for plain text match OR hash match
        password_match = False
        try:
            if utils.verify_password(form_data.password, student.password):
                 password_match = True
        except:
            pass
        
        if not password_match and student.password == form_data.password:
             password_match = True

        if not password_match:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = utils.create_access_token(
            data={"sub": student.email, "role": "student", "id": student.id}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer", "role": "student", "id": student.id}

    # Check admin table
    admin = db.query(models.Admin).filter(models.Admin.email == form_data.username).first()
    if admin:
        password_match = False
        try:
            if utils.verify_password(form_data.password, admin.password):
                 password_match = True
        except:
            pass
        
        if not password_match and admin.password == form_data.password:
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
