from datetime import datetime
from typing import List, Literal, Optional
from uuid import UUID
from pydantic import BaseModel
from app.api.models.challenges import (
    ApprovalStatus,
    ChallengeTakers,
    DifficultyTag,
    Topic,
    ChallengeStatus,
)


class TopicSchema(BaseModel):
    id: UUID
    name: str

    class Meta:
        orm_model = Topic


class Contributor(BaseModel):
    id: UUID
    username: str
    first_name: str
    last_name: str


class NewChallengeInput(BaseModel):
    title: str
    description: str
    difficulty_tag: DifficultyTag
    topic_tags: List[Topic]


class ChallengeInfo(BaseModel):
    id: UUID
    title: str
    slug: str
    difficulty_tag: DifficultyTag
    topic_tags: List[Topic]
    contributor: Contributor
    created_at: datetime
    updated_at: datetime


class PaginatedChallengeInfo(BaseModel):
    data: List[ChallengeInfo]
    hasPrev: bool
    hasNext: bool


class ContributedChallengeInfo(ChallengeInfo):
    approval: ApprovalStatus


class ChallengeOutput(ChallengeInfo):
    description: str

    class Config:
        from_attributes = True


class ViewChallengeOutput(BaseModel):
    challenge: ChallengeOutput
    accepted_challenge: Optional[ChallengeTakers]


class TakeNewChallengeOutput(BaseModel):

    user_id: UUID
    challenge: ChallengeOutput
    status: ChallengeStatus

    class Config:
        from_attributes = True


class ChallengesTaken(BaseModel):

    id: UUID
    title: str
    slug: str
    difficulty_tag: DifficultyTag
    topic_tags: List[Topic]
    status: ChallengeStatus
    github_url: Optional[str]
    presentation_video_url: Optional[str]
    deployed_application_url: Optional[str]

    class config:
        from_attributes = True


class ChallengeSolutionInput(BaseModel):
    challenge_id: UUID
    github_url: str
    presentation_video_url: str
    deployed_application_url: Optional[str] = None
