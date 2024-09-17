from typing import TYPE_CHECKING, List
import uuid, enum
from datetime import datetime, timezone
from sqlmodel import Field, Relationship, SQLModel, Enum as PgEnum, Column, DateTime
from sqlalchemy import event, UniqueConstraint, String
from slugify import slugify

if TYPE_CHECKING:
    from .users import User


# Enum for status of challenge takers
class ChallengeStatus(enum.Enum):
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    PENDING = "pending"
    SUBMITTED = "submitted"


# Many to Many relationship between Users and Challenges
class ChallengeTakers(SQLModel, table=True):
    __tablename__ = "challenge_takers"

    user_id: uuid.UUID = Field(foreign_key="users.id", primary_key=True, ondelete="CASCADE")
    challenge_id: uuid.UUID = Field(foreign_key="challenges.id", primary_key=True, ondelete="RESTRICT")
    status: ChallengeStatus = Field(
        sa_column=Column(
            PgEnum(ChallengeStatus, name="challenge_status"),
            default=ChallengeStatus.PENDING,
        )
    )
    github_url: str = Field(sa_column=Column(String(256), nullable=True, unique=True))
    presentation_video_url: str = Field(sa_column=Column(String(256), nullable=True, unique=True))
    deployed_application_url: str = Field(sa_column=Column(String(256),nullable=True, unique=True))
    feedback: str = Field(sa_column=Column(String(256), nullable=True))

    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime,
            default=datetime.now(timezone.utc),
            onupdate=datetime.now(timezone.utc),
        ),
    )


# Many to Many relationship between challenges and topics
class ChallengeTopic(SQLModel, table=True):
    __tablename__ = "challenge_topics"

    challenge_id: uuid.UUID = Field(
        foreign_key="challenges.id", primary_key=True, ondelete="CASCADE"
    )
    topic_id: uuid.UUID = Field(
        foreign_key="topics.id", primary_key=True, ondelete="RESTRICT"
    )


# create enum class for difficulty tags
class DifficultyTag(enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCE = "advance"
    EXPERT = "expert"


class ApprovalStatus(enum.Enum):
    APPROVED = "approved"
    REJECTED = "rejected"
    PENDING = "pending"


class Challenge(SQLModel, table=True):
    __tablename__ = "challenges"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(sa_column=Column(String(180), nullable=False))
    slug: str = Field(sa_column=Column(String(256), unique=True, nullable=False, index=True))
    description: str = Field(sa_column=Column(String, nullable=False))
    difficulty_tag: DifficultyTag = Field(
        sa_column=Column(PgEnum(DifficultyTag, name="difficulty_tag"))
    )

    contributor_id: uuid.UUID = Field(foreign_key="users.id", nullable=False)
    contributor: "User" = Relationship(
        back_populates="challenges_contributed",
        sa_relationship_kwargs={
            "foreign_keys": "Challenge.contributor_id",
        },
    )
    topic_tags: List["Topic"] = Relationship(
        back_populates="topic_challenges", link_model=ChallengeTopic
    )
    challenge_takers: List["User"] = Relationship(
        back_populates="challenges_taken", link_model=ChallengeTakers
    )
    approval: ApprovalStatus = Field(
        sa_column=Column(
            PgEnum(ApprovalStatus, name="approval_status"),
            default=ApprovalStatus.PENDING,
        ),
    )
    approver_id: uuid.UUID = Field(
        foreign_key="users.id", nullable=True, ondelete="SET NULL"
    )
    approver: "User" = Relationship(
        back_populates="approved_challenges",
        sa_relationship_kwargs={"foreign_keys": "Challenge.approver_id"},
    )
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime,
            default=datetime.now(timezone.utc),
            onupdate=datetime.now(timezone.utc),
        ),
    )

    __table_args__ = (
        UniqueConstraint('slug'),
    )

    def generate_slug(self):
        """
        Generate slug from title and id.
        """
        if self.title and self.id:
            self.slug = f"{slugify(self.title)}-{self.id}"


# Define the SQLAlchemy event listener for 'before_insert' and 'before_update'
def before_insert_or_update(mapper, connection, target: Challenge):
    """
    Event listener to generate or update slug before insert/update.
    """
    if target.title and target.id:
        target.generate_slug()


# Attach the event listener to Challenge model
event.listen(Challenge, "before_insert", before_insert_or_update)
event.listen(Challenge, "before_update", before_insert_or_update)


class Topic(SQLModel, table=True):
    __tablename__ = "topics"

    id: uuid.UUID = Field(default=uuid.uuid4, primary_key=True)
    name: str = Field(sa_column=Column(String(128), unique=True, nullable=False))
    topic_challenges: List["Challenge"] = Relationship(
        back_populates="topic_tags", link_model=ChallengeTopic, passive_deletes='all'
    )
