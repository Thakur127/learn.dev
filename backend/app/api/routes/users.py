from uuid import UUID
from typing import Annotated, Optional

from fastapi import APIRouter, Form, HTTPException, status
from fastapi.responses import JSONResponse, Response

from app.core.security.password import get_password_hash
from app.dependencies import CurrentUser, SessionDep
from app.api.schemas import UserOutput
from app.api.crud import users as users_crud

router = APIRouter(prefix="/user", tags=["users"])


@router.get("/me")
def me(db: SessionDep, current_user: CurrentUser) -> UserOutput:
    print("current user: ", current_user)
    user = users_crud.db_get_user(db, user_id=UUID(current_user.id))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("/{username}")
def user_by_username(db: SessionDep, username: str) -> UserOutput:
    user = users_crud.db_get_user(db, username=username)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("/check-username-availability/{username}")
def check_username_availability(db: SessionDep, username: str):
    user = users_crud.db_get_user(db, username=username)
    if user:
        return {"isAvailable": False}
    return {"isAvailable": True}


@router.patch('/update-user-info')
def update_user_info(db: SessionDep, current_user: CurrentUser, first_name: Annotated[Optional[str], Form()] = None, last_name: Annotated[Optional[str], Form()] = None, username: Annotated[Optional[str], Form()] = None):
    return users_crud.db_update_user(db, user_id=UUID(current_user.id), first_name=first_name, last_name=last_name, username=username)


@router.post('/update-profile-picture')
def update_profile_picture(db: SessionDep, current_user: CurrentUser, profile_picture: Annotated[Optional[str], Form()] = None): ...