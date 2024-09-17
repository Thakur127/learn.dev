from uuid import UUID
from typing import Any, List, Optional, Sequence
from fastapi import HTTPException, status
from sqlmodel import Session, select, col, or_
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.exc import IntegrityError, OperationalError


from app.api.models.challenges import ChallengeStatus, ApprovalStatus

# from app.api.schemas.challenges import ChallengeOutput
from app.dependencies import SessionDep
from app.api.models import Challenge, ChallengeTakers, Topic, ChallengeTopic


def db_available_challenges(
    db: Session,
    *,
    limit: Optional[int] = None,
    offset: int = 0,
    title: Optional[str] = None,
    topics: List[str] = [],
) -> Sequence[Challenge]:
    """
    Get all available challenges

    This function will return a list of all available challenges, with an optional
    limit and offset.

    Args:
        db (Session): A SQLAlchemy session.
        limit (Optional[int]): The maximum number of challenges to return. Defaults to None.
        offset (Optional[int]): The number of challenges to skip in the result set. Defaults to None.

    Returns:
        Sequence[Challenge]: A list of available challenges.

    Raises:
        HTTPException: 500 if there was an internal server error.
    """

    try:
        statement = (
            select(Challenge)
            .where(Challenge.approval == ApprovalStatus.APPROVED)
            .limit(limit)
            .offset(offset)
            .order_by(col(Challenge.created_at).desc())
        )
        if title:
            statement = statement.where(col(Challenge.title).ilike(f"%{title}%"))
        if topics:
            statement = (
                statement.join(ChallengeTopic)
                .join(Topic)
                .where(col(Topic.name).in_(topics))
            )
        return db.exec(statement).all()
    except OperationalError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database Connection Failed",
        ) from e
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        ) from e


def db_taken_challenges(
    db: Session, *, user_id: UUID, challenge_status: Optional[str]
) -> Sequence[Any]:
    """
    Get all challenges that the user has taken with a given status.

    Args:
        db (Session): A SQLAlchemy session.
        user_id (UUID): The ID of the user who has taken the challenge.
        challenge_status (str): The status of the challenges to retrieve. Can be one of
            'pending' or 'completed'.
    Returns:
        A list of tuples containing the challenge ID, title, slug, difficulty tag,
        and the user's status for the challenge.
    Raises:
        HTTPException: 400 if the user_id is not in a valid UUID format.
        HTTPException: 500 if there was an internal server error.
    """
    try:
        query = (
            select(Challenge, ChallengeTakers)
            .join(ChallengeTakers)
            .where(ChallengeTakers.user_id == user_id)
        )

        # Only apply the status filter if challenge_status is provided
        if challenge_status:
            query = query.where(ChallengeTakers.status == challenge_status)

        return db.exec(query).all()
    except OperationalError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database Connection Failed",
        ) from e
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user_id format: Expected UUID",
        ) from e
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR) from e


def db_check_challenge_taken(db: SessionDep, *, user_id: UUID, challenge_id: UUID):
    """
    Check if a user has taken a challenge.

    Args:
        db (SessionDep): A SQLAlchemy session.
        user_id (UUID): The ID of the user who has taken the challenge.
        challenge_id (UUID): The ID of the challenge to check.

    Returns:
        ChallengeTakers: The challenge taker object if the user has taken the challenge.
                         None if the user has not taken the challenge.

    Raises:
        HTTPException: 500 if there was an internal server error.
    """
    try:
        return db.exec(
            select(ChallengeTakers).where(
                ChallengeTakers.user_id == user_id,
                ChallengeTakers.challenge_id == challenge_id,
            )
        ).one_or_none()
    except OperationalError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database Connection Failed",
        ) from e
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


def db_take_new_challenge(
    db: Session, *, user_id: UUID, challenge_id: UUID
) -> ChallengeTakers:
    try:
        new_challenge = ChallengeTakers(user_id=user_id, challenge_id=challenge_id)
        db.add(new_challenge)
        db.commit()
        db.refresh(new_challenge)
        return new_challenge

    except OperationalError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database Connection Failed",
        ) from e
    except Exception as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR) from e


def db_update_taken_challenge(
    db: SessionDep,
    *,
    user_id: UUID,
    challenge_id: UUID,
    github_url: Optional[str] = None,
    presentation_video_url: Optional[str] = None,
    deployed_application_url: Optional[str] = None,
    feedback: Optional[str] = None,
    _status: ChallengeStatus,
):
    try:
        taken_challenge = db.exec(
            select(ChallengeTakers).where(
                ChallengeTakers.user_id == user_id,
                ChallengeTakers.challenge_id == challenge_id,
            )
        ).one()
        if github_url:
            taken_challenge.github_url = github_url
        if presentation_video_url:
            taken_challenge.presentation_video_url = presentation_video_url
        if deployed_application_url:
            taken_challenge.deployed_application_url = deployed_application_url
        if feedback:
            taken_challenge.feedback = feedback
        if _status:
            taken_challenge.status = _status
        db.commit()
        db.refresh(taken_challenge)
        return taken_challenge
    except OperationalError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database Connection Failed",
        ) from e
    except IntegrityError as e:
        db.rollback()  # Rollback transaction on exception
        if "unique constraint" in str(e.orig):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Duplicate Data Found. Please check your data and try again. Might be someone already submitted the solution with these URLs",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity Error occurred",
        )
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from e


def db_view_challenge(
    db: Session, *, slug: Optional[str] = None, id: Optional[UUID] = None
):
    """
    Get a challenge by slug.

    Args:
        db (Session): SQLAlchemy session.
        slug (str): Slug of the challenge to retrieve.

    Returns:
        Challenge: The challenge with the specified slug.

    Raises:
        HTTPException: 404 if the challenge does not exist.
        HTTPException: 500 if there was an internal server error.
    """
    try:
        return db.exec(
            select(Challenge).where(or_(Challenge.slug == slug, Challenge.id == id))
        ).one_or_none()

    except OperationalError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database Connection Failed",
        ) from e
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR) from e


def db_create_challenge(
    db: Session, *, contributor_id: UUID, challenge_data: dict
) -> Challenge:
    """
    Create a new challenge in the database.

    Args:
        db (Session): A SQLAlchemy session.
        contributor_id (UUID): The UUID of the user who is the contributor of the challenge.
        challenge_data (dict): A dictionary containing the data for the challenge.

    Returns:
        Challenge: The newly created challenge.

    Raises:
        HTTPException: 500 if there was an internal server error.
    """
    try:
        db_challenge = Challenge(**challenge_data, contributor_id=contributor_id)
        db.add(db_challenge)
        db.commit()
        db.refresh(db_challenge)
        return db_challenge
    except OperationalError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database Connection Failed",
        ) from e
    except Exception as e:
        print(e)
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR) from e


def db_get_topics(db: Session):
    """
    Get all topics.

    Returns a list of all topics.

    Raises:
        HTTPException: 500 if there was an internal server error.
    """

    try:
        return db.exec(select(Topic)).all()
    except OperationalError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database Connection Failed",
        ) from e
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR) from e


def db_get_topic_by_id(db: Session, *, topic_id: UUID):
    """
    Get a topic by ID.

    Args:
        db (Session): SQLAlchemy session.
        topic_id (UUID): ID of the topic to retrieve.

    Returns:
        Topic: The topic with the specified ID.

    Raises:
        HTTPException: 404 if the topic does not exist.
        HTTPException: 500 if there was an internal server error.
    """

    try:
        return db.exec(select(Topic).where(Topic.id == topic_id)).one()
    except NoResultFound as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(f"No result found for the topic id: {topic_id}"),
        ) from e
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        ) from e


def db_contributions(
    db: Session, *, user_id: UUID, approval_status: Optional[ApprovalStatus] = None
):
    """
    Get all challenges contributed by a user.

    Args:
        db (Session): SQLAlchemy session.
        user_id (UUID): The ID of the user who has contributed the challenges.

    Returns:
        List[Challenge]: A list of challenges contributed by the user.

    Raises:
        HTTPException: 500 if there was an internal server error.
    """

    try:
        statement = (
            select(Challenge)
            .where(Challenge.contributor_id == user_id)
            .order_by(col(Challenge.created_at).desc())
        )
        if approval_status:
            statement.where(Challenge.approval == approval_status)
        return db.exec(statement).all()
    except OperationalError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database Connection Failed",
        ) from e
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR) from e
