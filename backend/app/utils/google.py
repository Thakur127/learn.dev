from fastapi import HTTPException
from google.oauth2 import id_token
from google.auth.transport import requests

from app.core.config import settings

def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID)
        return idinfo
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid token") from e