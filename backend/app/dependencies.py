from typing import Annotated, Optional

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from pydantic import ValidationError


from app.core.security.token import UserDataPayload, decode_token, get_user_payload
from app.core.database import get_db
from app.core.config import settings


# auto_error=false will not throw error if token not found in authorization header
# which gives us the flexibility to authenticate using cookies
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.api_v1_str}/auth/login/token", auto_error=False
)


SessionDep = Annotated[Session, Depends(get_db)]


def get_current_user(
    request: Request,
    token: Annotated[Optional[str], Depends(oauth2_scheme)],
) -> UserDataPayload:

    try:
        # print("token in header: ", token)
        # retrieve token from cookies if not found in header
        if token is None:
            token = request.cookies.get("access_token")
            # print("token in cookie: ", token)

        # Raise an error if token is still not found
        if token is None:
            # print("Token not found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Token not found"
            )

        # Decode the token and get the user payload
        token_payload = decode_token(token=token)
        user_payload = get_user_payload(token_payload=token_payload)

        return user_payload
    except Exception as e:
        print(e)
        raise


def get_current_user_or_none(
    request: Request, token: Annotated[Optional[str], Depends(oauth2_scheme)]
) -> Optional[UserDataPayload]:
    try:

        if token is None:
            token = request.cookies.get("access_token")
            # print(token)

        # Raise an error if token is still not found
        if token is None:
            # print("Token not found")
            return None

        # Decode the token and get the user payload
        token_payload = decode_token(token=token)
        user_payload = get_user_payload(token_payload=token_payload)

        return user_payload
    except Exception as e:
        print(e)
        return None


CurrentUser = Annotated[UserDataPayload, Depends(get_current_user)]
CurrentUserOrNone = Annotated[
    Optional[UserDataPayload], Depends(get_current_user_or_none)
]
