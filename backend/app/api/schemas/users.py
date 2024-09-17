from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class Profile(BaseModel):
    about: str
    image_url: str


class UserInput(BaseModel):
    first_name: str
    last_name: str
    username: str
    email: str
    password: str


class UserOutput(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    username: str
    email: str
    role: str
    is_email_verified: bool
    is_active: bool
    profile: Profile | None = None
    created_at: datetime
