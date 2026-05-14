"""
Shared FastAPI dependency functions for authentication and authorization.

Centralising these here prevents circular imports: routers no longer need to
import from each other (e.g., admin importing from users).
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from . import models, schemas, utils, database

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


async def get_current_user_from_token(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db),
) -> models.Student:
    """
    Decode the Bearer JWT token and return the matching user (Student or Admin).
    Raises HTTP 401 if the token is invalid or the user cannot be found.
    """
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

    if role == "admin":
        user = db.query(models.Admin).filter(models.Admin.email == token_data.email).first()
    else:
        user = db.query(models.Student).filter(models.Student.email == token_data.email).first()

    if user is None:
        raise credentials_exception

    return user


def get_current_admin(
    current_user=Depends(get_current_user_from_token),
):
    """
    Dependency that asserts the current authenticated user is an admin.
    Raises HTTP 403 otherwise.
    """
    is_admin = isinstance(current_user, models.Admin) or (
        hasattr(current_user, "role") and str(current_user.role).lower() == "admin"
    )
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource",
        )
    return current_user
