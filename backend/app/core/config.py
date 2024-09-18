import os
from typing import Optional

from dotenv import load_dotenv

load_dotenv()


SECOND = 1
MINUTE = 60 * SECOND
HOUR = 60 * MINUTE
DAY = 24 * HOUR


class Settings:

    DATABASE_URI: Optional[str] = os.getenv("DATABASE_URI")
    api_v1_str: Optional[str] = os.getenv("API_V1_STR") or "/api/v1"

    # TOKEN SPECIFIC CONFIG
    SECRET_KEY: Optional[str] = os.getenv("SECRET_KEY")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_NAME = "access_token"
    REFRESH_TOKEN_NAME = "refresh_token"
    ACCESS_TOKEN_EXPIRE_TIME = 15 * MINUTE
    REFRESH_TOKEN_EXPIRE_TIME = 15 * DAY

    # COOKIE SPECIFIC CONFIG
    COOKIE_SECURE: bool = os.getenv("PYTHON_MODE", "development") == "production"

    # GOOGLE SPECIFIC CONFIG
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET")

    # CORS
    ALLOW_ORIGINS = [os.getenv("FRONTEND_DOMAIN")]
    ALLOW_METHODS = ["*"]
    ALLOW_HEADERS = ["*"]

    # RATE LIMIT
    REQUESTS_LIMIT = int(os.getenv("REQUESTS_LIMIT", 100))
    TIME_WINDOW = int(
        os.getenv("TIME_WINDOW", 1 * MINUTE)
    )  # in seconds, by default 60 seconds


settings = Settings()
