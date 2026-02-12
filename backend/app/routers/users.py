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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

async def get_current_user_from_token(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email, role=role)
    except JWTError:
        raise credentials_exception
    
    if role == "student":
        user = db.query(models.Student).filter(models.Student.email == token_data.email).first()
    elif role == "admin":
         user = db.query(models.Admin).filter(models.Admin.email == token_data.email).first()
    else:
        user = None

    if user is None:
        raise credentials_exception
    return user

@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.Student = Depends(get_current_user_from_token)):
    return current_user

@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(database.get_db)):
    db_user = db.query(models.Student).filter(models.Student.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
