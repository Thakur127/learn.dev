from typing import Optional
from uuid import UUID
from app.api.schemas.users import UserOutput
from fastapi import HTTPException, status
from sqlmodel import Session, select, or_
from app.api.models import User, LoginHistory
from sqlalchemy.exc import IntegrityError, OperationalError


def db_get_user(
    db: Session,
    *,
    user_id: Optional[UUID] = None,
    username: Optional[str] = None,
    email: Optional[str] = None
):
    """find user with user_id"""
    try:
        # get user by id, username or email
        db_user = db.exec(
            select(User).where(
                or_(User.id == user_id, User.username == username, User.email == email)
            )
        ).one_or_none()
        return db_user
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR) from e


def db_create_user(db: Session, *, user: dict):
    """Create new user"""
    try:
        db_user = User(**user)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists"
        ) from e
    except Exception as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR) from e


def db_update_user(
    db: Session,
    *,
    user_id: UUID,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    username: Optional[str] = None
):
    """Update user information"""
    try:
        db_user = db.get(User, user_id)
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        if first_name:
            db_user.first_name = first_name
        if last_name:
            db_user.last_name = last_name
        if username:
            db_user.username = username
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST) from e


def db_add_last_login(db: Session, *, user_id: UUID):
    """Add last login information about the user every time they login"""
    try:
        db_login = LoginHistory(user_id=user_id)
        db.add(db_login)
        db.commit()
        db.refresh(db_login)
        return db_login
    except Exception as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR) from e
