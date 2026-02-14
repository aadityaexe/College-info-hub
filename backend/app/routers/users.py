from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, utils, database

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

def get_current_user(token: str = Depends(utils.create_access_token), db: Session = Depends(database.get_db)):
    # This function is a placeholder. 
    # Real implementation needs detailed JWT decoding and user fetching.
    # We'll rely on a proper dependency injection for this.
    pass

# We need a dependency to get the current user based on the token
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

async def get_current_user_from_token(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # print(f"DEBUG: Token received: {token[:10]}...") 
        payload = jwt.decode(token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        # print(f"DEBUG: Decoded payload - Email: {email}, Role: {role}")
        
        if email is None:
            print("DEBUG: Email is None")
            raise credentials_exception
        token_data = schemas.TokenData(email=email, role=role)
    except JWTError as e:
        print(f"DEBUG: JWT Decode Error: {e}")
        raise credentials_exception
    
    if role == "admin":
        user = db.query(models.Admin).filter(models.Admin.email == token_data.email).first()
    else:
        # Check student table for Student, Alumni, Faculty
        user = db.query(models.Student).filter(models.Student.email == token_data.email).first()

    if user is None:
        print(f"DEBUG: User not found for email {token_data.email} and role {role}")
        raise credentials_exception
    
    return user

@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.Student = Depends(get_current_user_from_token)):
    # Retrieve role if not present or normalize it
    # Admin model might not have role column, so we might need to inject it
    # But current_user is typed as Student, let's check runtime type
    if isinstance(current_user, models.Admin):
        current_user.role = "admin"
    elif hasattr(current_user, "role") and current_user.role:
        # Normalize to lowercase for frontend consistency
        current_user.role = str(current_user.role).lower()
        
    return current_user

@router.put("/me", response_model=schemas.User)
def update_user_me(user_update: schemas.UserUpdate, db: Session = Depends(database.get_db), current_user: models.Student = Depends(get_current_user_from_token)):
    # Check if user exists
    user = db.query(models.Student).filter(models.Student.id == current_user.id).first()
    
    # If admin
    if isinstance(current_user, models.Admin) or (hasattr(current_user, 'role') and str(current_user.role).lower() == 'admin'):
         user = db.query(models.Admin).filter(models.Admin.id == current_user.id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Separate User fields and Profile fields
    update_data = user_update.dict(exclude_unset=True)
    
    profile_fields = {'bio', 'skills', 'location', 'avatar'}
    user_fields = set(update_data.keys()) - profile_fields
    
    # Update User table fields
    for key in user_fields:
        if hasattr(user, key):
            setattr(user, key, update_data[key])
            
    # Update Profile table fields (only if not admin, assuming admins don't have this profile)
    if not isinstance(user, models.Admin) and (any(f in update_data for f in profile_fields)):
        # Ensure profile exists
        if not user.profile:
            user.profile = models.StudentProfile(student_id=user.id)
            
        for key in profile_fields:
            if key in update_data:
                 setattr(user.profile, key, update_data[key])
        
    db.commit()
    db.refresh(user)
    
    # Re-inject role if needed for response
    if isinstance(user, models.Admin):
        user.role = "admin"
    elif hasattr(user, "role") and user.role:
        user.role = str(user.role).lower()

    return user

@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(database.get_db)):
    db_user = db.query(models.Student).filter(models.Student.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
