from datetime import datetime, timedelta, timezone
from typing import Literal, Optional

import jwt
from fastapi import HTTPException, status
from pydantic import BaseModel, ValidationError
from app.core.config import settings

# Token(sub, type, exp)


SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM


class UserDataPayload(BaseModel):
    id: str
    role: Literal["admin", "user"]


class TokenPayload(BaseModel):
    sub: UserDataPayload
    token_type: Literal["access", "refresh"]
    exp: datetime


class TokenResult(BaseModel):
    token: str
    scheme: Literal["bearer"] = "bearer"
    expires_at: datetime


class Token(BaseModel):

    payload: UserDataPayload

    def create_token(
        self, *, token_type: Literal["access", "refresh"], expires_delta: timedelta
    ):
        """
        Create a JWT token.
        """
        # check token type
        if token_type not in ["access", "refresh"]:
            raise ValueError("Invalid token type specified.")

        # get expire time
        expire = datetime.now(timezone.utc) + (expires_delta)

        # create token payload
        to_encode = TokenPayload(sub=self.payload, token_type=token_type, exp=expire)
        encoded_jwt = jwt.encode(
            to_encode.model_dump(), SECRET_KEY, algorithm=ALGORITHM
        )

        # return token
        return TokenResult(token=encoded_jwt, expires_at=expire, scheme="bearer")

    def create_access_token(self, expires_delta: Optional[timedelta] = None):

        # if expires delta is none set 15 minutes token expiration
        if expires_delta is None:
            expires_delta = timedelta(minutes=15)

        return self.create_token(token_type="access", expires_delta=expires_delta)

    def create_refresh_token(self, expires_delta: Optional[timedelta] = None):

        # if expires delta is none set 7 days token expiration
        if expires_delta is None:
            expires_delta = timedelta(days=7)

        return self.create_token(token_type="refresh", expires_delta=expires_delta)


def decode_token(token: str) -> TokenPayload:
    """
    Decode the JWT token and return the payload.
    """
    try:
        return TokenPayload(**jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]))
    except (jwt.DecodeError, ValidationError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        ) from e
    except jwt.ExpiredSignatureError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has Expired",
        ) from e


def get_user_payload(token_payload: TokenPayload) -> UserDataPayload:
    """Returns the user payload/info from token payload"""
    return token_payload.sub


def refresh_access_token(
    token: str, expires_delta: Optional[timedelta] = None
) -> TokenResult:

    token_payload = decode_token(token=token)
    if token_payload.token_type != "refresh":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="InvalidToken: Refresh token required",
        )
    user_payload = get_user_payload(token_payload=token_payload)
    return Token(payload=user_payload).create_access_token(expires_delta=expires_delta)
