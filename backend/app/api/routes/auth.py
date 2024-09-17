from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional
from fastapi import (
    APIRouter,
    Depends,
    Form,
    HTTPException,
    Request,
    status,
    Response,
)
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.security import token as token_utils, password as password_utils
from app.dependencies import SessionDep
from app.api.models import User, Profile
from app.api.models.users import AccountProvider
from app.api.crud import users as users_crud

from app.utils import google as google_utils

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login/token")
def login(
    db: SessionDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    try:
        # print(form_data)
        username_email = form_data.username.strip().lower()
        password = form_data.password.strip()
        # print(username_email, password)

        # Find user in the database
        user = users_crud.db_get_user(db, username=username_email, email=username_email)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No user found with the provided credentials, {username_email}",
            )

        if not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="No password provided"
            )

        if not (8 <= len(password) <= 20):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be between 8 and 20 characters.",
            )

        if user.password is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User doesn't have a password. Please set a password to make credentials login work.",
            )

        # Verify password
        if not password_utils.verify_password(password, user.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect password"
            )

        # Create User/Token payload
        payload = token_utils.UserDataPayload(id=str(user.id), role=user.role.value)
        token = token_utils.Token(payload=payload)

        # generate tokens
        access_token = token.create_access_token(
            expires_delta=timedelta(seconds=settings.ACCESS_TOKEN_EXPIRE_TIME)
        )
        refresh_token = token.create_refresh_token(
            expires_delta=timedelta(seconds=settings.REFRESH_TOKEN_EXPIRE_TIME)
        )

        # Calculate max_age in seconds
        current_time = datetime.now(timezone.utc)
        access_token_max_age = int(
            (access_token.expires_at - current_time).total_seconds()
        )
        refresh_token_max_age = int(
            (refresh_token.expires_at - current_time).total_seconds()
        )

        # create response
        response = JSONResponse(
            content={
                "user": jsonable_encoder(
                    user.model_dump(exclude={"password", "is_super_user"})
                ),
                "access": jsonable_encoder(access_token),
                "refresh": jsonable_encoder(refresh_token),
            },
            status_code=status.HTTP_200_OK,
        )

        # Set the tokens as cookies
        response.set_cookie(
            key="access_token",
            value=access_token.token,
            httponly=True,  # Prevents JavaScript access to the cookie
            secure=settings.COOKIE_SECURE,
            max_age=access_token_max_age,  # Expiry time in seconds
            samesite="none",  # Adjust for CSRF protection
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token.token,
            httponly=True,
            secure=settings.COOKIE_SECURE,
            max_age=refresh_token_max_age,
            samesite="none",
        )

        # Add last login detail
        try:
            users_crud.db_add_last_login(db, user_id=user.id)
        except HTTPException:
            pass

        # return response
        return response

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        ) from e


@router.post("/logout")
def logout(response: Response):

    # TODO: BLOCK TOKENS
    # access_token = request.cookies().get('access_token')
    # refresh_token = request.cookies().get('refresh_token')

    # delete tokens from cookies
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")

    return {"message": "Logout successful"}


@router.post("/refresh-token")
def refresh_access_token(
    request: Request,
    refresh_token: Annotated[Optional[str], Form()] = None,
):

    try:
        # check if refresh token in body exists else retrieve from cookies
        if refresh_token is None:
            refresh_token = request.cookies.get("refresh_token")

        # refresh token neither found in body nor in cookies throw error
        if refresh_token is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Provide refresh token"
            )

        # create new access token
        access_token = token_utils.refresh_access_token(
            refresh_token,
            expires_delta=timedelta(seconds=settings.ACCESS_TOKEN_EXPIRE_TIME),
        )

        # calculate token max age
        current_time = datetime.now(timezone.utc)
        access_token_max_age = int(
            (access_token.expires_at - current_time).total_seconds()
        )

        response = JSONResponse(
            content={"access": jsonable_encoder(access_token)},
            status_code=status.HTTP_200_OK,
        )

        # set access token in cookie
        response.set_cookie(
            key="access_token",
            value=access_token.token,
            httponly=True,  # Prevents JavaScript access to the cookie
            secure=True,
            max_age=access_token_max_age,  # Expiry time in seconds
            samesite="none",  # Adjust for CSRF protection
        )

        return response

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        ) from e


@router.post("/signup")
def signup(
    db: SessionDep,
    first_name: Annotated[str, Form()],
    username: Annotated[str, Form()],
    email: Annotated[str, Form()],
    password: Annotated[str, Form()],
    last_name: Annotated[Optional[str], Form()] = None,
):
    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Password is required"
        )

    if not (8 <= len(password) <= 20):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be between 8 and 20 characters",
        )

    try:
        user = users_crud.db_get_user(db, username=username)
        if user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Username already exists"
            )

        user = users_crud.db_get_user(db, email=email)
        if user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Email already exists"
            )

        user = users_crud.db_create_user(
            db,
            user={
                "first_name": first_name,
                "last_name": last_name,
                "username": username,
                "email": email,
                "provider": AccountProvider.CREDENTIALS,
                "is_email_verified": True,  # TODO: Implement email verification
                "password": password_utils.get_password_hash(password),
            },
        )
        return JSONResponse(
            status_code=201,
            content=jsonable_encoder(
                user.model_dump(exclude={"password", "is_super_user"})
            ),
        )
    except Exception as e:
        print(e)
        raise


@router.post("/google/login")
def google_login(db: SessionDep, id_token: Annotated[str, Form()]):

    user_info = google_utils.verify_google_token(id_token)
    print(user_info)
    try:
        from app.utils import helper as helper_utils
    except ImportError:
        raise

    email = user_info.get("email")
    username = helper_utils.generate_username_from_email(email)
    is_email_verified = user_info.get("email_verified", False)
    first_name = user_info.get("given_name", "")
    last_name = user_info.get("family_name", "")
    image_url = user_info.get("picture", None)

    # TODO: Check if user already exists
    user = users_crud.db_get_user(db, email=email)
    if not user:

        user = users_crud.db_get_user(db, email=email)
        if user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Email already exists"
            )

        user = users_crud.db_get_user(db, username=username)
        if user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Username already exists"
            )

        user = users_crud.db_create_user(
            db,
            user={
                "first_name": first_name,
                "last_name": last_name,
                "username": username,
                "email": email,
                "is_email_verified": is_email_verified,
                "provider": AccountProvider.GOOGLE,
                "profile": Profile(about="", image_url=image_url),
            },
        )

    # Create User/Token payload
    payload = token_utils.UserDataPayload(id=str(user.id), role=user.role.value)
    token = token_utils.Token(payload=payload)

    # generate tokens
    access_token = token.create_access_token(
        expires_delta=timedelta(seconds=settings.ACCESS_TOKEN_EXPIRE_TIME)
    )
    refresh_token = token.create_refresh_token(
        expires_delta=timedelta(seconds=settings.REFRESH_TOKEN_EXPIRE_TIME)
    )

    # Calculate max_age in seconds
    current_time = datetime.now(timezone.utc)
    access_token_max_age = int((access_token.expires_at - current_time).total_seconds())
    refresh_token_max_age = int(
        (refresh_token.expires_at - current_time).total_seconds()
    )

    # create response
    response = JSONResponse(
        content={
            "user": jsonable_encoder(
                user.model_dump(exclude={"password", "is_super_user"})
            ),
            "access": jsonable_encoder(access_token),
            "refresh": jsonable_encoder(refresh_token),
        },
        status_code=status.HTTP_200_OK,
    )

    # Set the tokens as cookies
    response.set_cookie(
        key="access_token",
        value=access_token.token,
        httponly=True,  # Prevents JavaScript access to the cookie
        secure=settings.COOKIE_SECURE,
        max_age=access_token_max_age,  # Expiry time in seconds
        samesite="none",  # Adjust for CSRF protection
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token.token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        max_age=refresh_token_max_age,
        samesite="none",
    )
    # if yes: return jwt token
    return response

    # if no: create user and return user
