import enum
import datetime
from typing import TYPE_CHECKING, List
from uuid import UUID, uuid4
from sqlmodel import (
    Field,
    Relationship,
    Column,
    func,
    Enum as PgEnum,
)
from sqlalchemy import DateTime, PrimaryKeyConstraint, String, UniqueConstraint
from pydantic import EmailStr

from .model_config import SQLBaseModel
from .challenges import ChallengeTakers

# import modules for typechecking only - free from circular imports error
if TYPE_CHECKING:
    from .challenges import Challenge


class UserRole(enum.Enum):
    USER = "user"
    ADMIN = "admin"


class AccountProvider(enum.Enum):
    GOOGLE = "google"
    CREDENTIALS = "credentials"
    GITHUB = "github"


class User(SQLBaseModel, table=True):

    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    first_name: str = Field(sa_column=Column(String(128), nullable=False))
    last_name: str = Field(sa_column=Column(String(128)))
    username: str = Field(
        sa_column=Column(String(128), unique=True, nullable=False, index=True)
    )
    email: EmailStr = Field(
        sa_column=Column(String(128), unique=True, nullable=False, index=True)
    )
    role: UserRole = Field(
        sa_column=Column(PgEnum(UserRole, name="user_role"), default=UserRole.USER)
    )
    password: str = Field(sa_column=Column(String(60), nullable=True))
    is_email_verified: bool = Field(default=False, nullable=False)
    is_super_user: bool = Field(default=False, nullable=False)
    is_active: bool = Field(default=True, nullable=False)
    provider: AccountProvider = Field(
        sa_column=Column(
            PgEnum(AccountProvider, name="account_provider"),
            default=AccountProvider.CREDENTIALS,
            nullable=False,
        ),
    )
    blocked: bool = Field(default=False, nullable=False)  # if user is blocked

    created_at: DateTime = Field(
        default_factory=datetime.datetime.now, sa_column=Column(DateTime)
    )

    profile: "Profile" = Relationship(back_populates="user")
    login_history: List["LoginHistory"] = Relationship(back_populates="user")

    challenges_contributed: List["Challenge"] = Relationship(
        back_populates="contributor",
        sa_relationship_kwargs={"foreign_keys": "Challenge.contributor_id"},
        cascade_delete=True,
    )
    challenges_taken: List["Challenge"] = Relationship(
        back_populates="challenge_takers", link_model=ChallengeTakers
    )

    approved_challenges: List["Challenge"] = Relationship(
        back_populates="approver",
        sa_relationship_kwargs={"foreign_keys": "Challenge.approver_id"},
        passive_deletes="all",
    )

    __table_args__ = (
        UniqueConstraint("username"),
        UniqueConstraint("email"),
    )


class Profile(SQLBaseModel, table=True):

    __tablename__ = "profiles"

    user_id: UUID = Field(foreign_key="users.id", primary_key=True, ondelete="CASCADE")
    about: str = Field(sa_column=Column(String(500), nullable=True))
    image_url: str = Field(sa_column=Column(String(256), nullable=True))
    updated_at: DateTime = Field(
        default_factory=datetime.datetime.now,
        sa_column=Column(DateTime, default=datetime.datetime.now, onupdate=func.now),
    )
    user: User = Relationship(back_populates="profile")


class LoginHistory(SQLBaseModel, table=True):

    __tablename__ = "login_histories"

    user_id: UUID = Field(foreign_key="users.id", ondelete="CASCADE")
    last_logged_in: DateTime = Field(
        default_factory=datetime.datetime.now,
        sa_column=Column(DateTime, default=datetime.datetime.now, onupdate=func.now),
    )
    user: User = Relationship(back_populates="login_history")

    __table_args__ = (
        PrimaryKeyConstraint("user_id", "last_logged_in", name="last_login_id"),
    )
