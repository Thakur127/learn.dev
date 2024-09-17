from typing import Annotated, List, Optional
from uuid import UUID
from fastapi import APIRouter, Body, Form, HTTPException, Query, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse


from app.dependencies import CurrentUser, CurrentUserOrNone, SessionDep
from app.api.models.challenges import ApprovalStatus, ChallengeStatus
from app.api.crud import users as users_crud, challenges as challenges_crud
from app.api.schemas import challenges as challenges_schemas

router = APIRouter(prefix="/challenge", tags=["challenges"])


@router.get(
    "/available",
    response_model=challenges_schemas.PaginatedChallengeInfo
    | List[challenges_schemas.ChallengeInfo],
)
def available_challenges(
    db: SessionDep,
    limit: Optional[int] = None,
    offset: int = 0,
    title: Optional[str] = None,
    topics: List[str] = Query([]),
):
    """
    Get all available challenges

    This endpoint will return a list of all challenges that are available to be taken by the current user.
    The list will contain the challenge id, title, slug, and difficulty tag.

    The response will be a JSON object with the following structure:
    ```json
    [
        {
            "id": str,
            "title": str,
            "slug": str,
            "difficulty_tag": str,
            "topic_tags": [
                {
                    id: str,
                    name: str
                }
            ],
            "contributor": {
                id: str,
            },
            "created_at": datetime
            "updated_at": datetime
        }
    ]
    ```

    The `limit` and `offset` parameters can be used to paginate the result set.
    If `limit` is provided, at most `limit` challenges will be returned.
    If `offset` is provided, the result set will be offset by `offset` challenges.
    """
    challenges = challenges_crud.db_available_challenges(
        db, limit=limit, offset=offset, title=title, topics=topics
    )

    if limit is None or offset is None:
        return challenges

    return {
        "data": challenges,
        "hasPrev": offset > 0,
        "hasNext": len(challenges) == limit,
    }


@router.get(
    "/{username}/taken-all", response_model=List[challenges_schemas.ChallengesTaken]
)
def challenges_taken_by_user(
    db: SessionDep, username: str, challenge_status: Optional[str] = None
):
    """
    Get all challenges that the current user has taken

    This endpoint will return a list of all challenges that the current user
    has taken. The list will contain the challenge id, title, slug, and
    difficulty tag, as well as the user's status for each challenge (i.e.
    whether they have completed it or not).

    The response will be a JSON object with the following structure:
    ```json
    [
        {
            "id": str,
            "title": str,
            "slug": str,
            "difficulty_tag": str,
            "status": "pending" | "completed",
        }
    ]
    ```

    The `status` field will be one of the following values:

    - "pending": The user has not completed the challenge
    - "accepted": The user has completed the challenge
    - "rejected": The solution has been rejected
    """

    try:
        user = users_crud.db_get_user(db, username=username)
        challenges = challenges_crud.db_taken_challenges(
            db, user_id=user.id, challenge_status=challenge_status
        )

        # Transform the query result into the expected response format
        result = []
        for challenge, taker in challenges:
            # Create the response object using the data from the database
            result.append(
                challenges_schemas.ChallengesTaken(
                    id=challenge.id,
                    title=challenge.title,
                    slug=challenge.slug,
                    difficulty_tag=challenge.difficulty_tag,
                    topic_tags=challenge.topic_tags,  # Ensure this is properly retrieved from the Challenge
                    status=taker.status,
                    github_url=taker.github_url,
                    presentation_video_url=taker.presentation_video_url,
                    deployed_application_url=taker.deployed_application_url,
                )
            )

        return result
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.post("/taken-challenge-info")
def taken_challenge_info(
    db: SessionDep,
    current_user: CurrentUserOrNone,
    challenge_id: Annotated[UUID, Form()],
):
    if current_user:
        return challenges_crud.db_check_challenge_taken(
            db, user_id=UUID(current_user.id), challenge_id=challenge_id
        )


@router.get("/view/{slug}", response_model=challenges_schemas.ViewChallengeOutput)
def get_challenge(db: SessionDep, slug: str, current_user: CurrentUserOrNone):

    challenge = challenges_crud.db_view_challenge(db, slug=slug)
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found"
        )

    accepted = None
    if current_user:
        accepted = challenges_crud.db_check_challenge_taken(
            db, user_id=UUID(current_user.id), challenge_id=challenge.id
        )

    if challenge.approval != ApprovalStatus.APPROVED and str(
        challenge.contributor_id
    ) != str(current_user.id if current_user else ""):
        raise HTTPException(
            status_code=403, detail="You don't have access to see this challenge"
        )

    return {"challenge": challenge, "accepted_challenge": accepted}


@router.post("/create-new", response_model=challenges_schemas.ChallengeOutput)
def create_new_challenge(
    db: SessionDep,
    current_user: CurrentUser,
    new_challenge: challenges_schemas.NewChallengeInput,
):
    """
    Create a new challenge.

    request:
       body:
       {
           title: str
           description: str
           difficulty_tag: str = 'beginner' | 'medium' | 'advance' | 'expert'
           topic_tags: [
               {
                   id: str
                   name: str
               }
           ]
       }

    response:
        {
            id: str
            title: str
            slug: str
            difficulty_tag: str = 'beginner' | 'medium' | 'advance' | 'expert'
            topic_tags: [
                {
                    id: str
                    name: str
                }
            ]
            created_at: datetime
            updated_at: datetime
            contributor: {
                id: str
                username: str
                first_name: str
                last_name: str
            }
        }

    Raises:
        HTTPException: 500 if there was an internal server error.
    """
    try:
        # Convert Pydantic topic schemas to ORM models
        topic_ids = [
            challenges_crud.db_get_topic_by_id(db, topic_id=topic.id)
            for topic in new_challenge.topic_tags
        ]

        # Prepare the challenge data for ORM creation
        challenge_data = new_challenge.model_dump()
        challenge_data["topic_tags"] = topic_ids  # replace with ORM models, not dicts

        # Create challenge using ORM-compatible data
        challenge = challenges_crud.db_create_challenge(
            db, contributor_id=UUID(current_user.id), challenge_data=challenge_data
        )

        return challenge
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        ) from e


@router.post("/take-new")
def take_challenge(
    db: SessionDep,
    current_user: CurrentUser,
    challenge_id: Annotated[UUID, Body(embed=True)],
):
    """
    Take a challenge as a user.

    This endpoint allows a logged-in user to take a challenge from available challenges.

    The request body should contain the challenge_id of the challenge to be taken.

    structure example:
    ```json
    {
        "challenge_id": str
    }
    ```

    The response will be the newly created challenge.

    response example:
    ```json
    {
        "user_id": str,
        "challenge_id": str
        "created_at": datetime
        "updated_at": datetime
        "status": str = 'submitted'
    }
    ```
    """
    try:
        # Check if the challenge exists
        challenge = challenges_crud.db_view_challenge(db, id=challenge_id)
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found"
            )
        # Check if the challenge is approved
        if challenge.approval != ApprovalStatus.APPROVED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Challenge not approved"
            )

        return challenges_crud.db_take_new_challenge(
            db, user_id=UUID(current_user.id), challenge_id=challenge_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.patch("/submit-challenge-solution")
def submit_challenge_solution(
    db: SessionDep,
    current_user: CurrentUser,
    challenge_solution: challenges_schemas.ChallengeSolutionInput,
):

    challenge = challenges_crud.db_check_challenge_taken(
        db, user_id=UUID(current_user.id), challenge_id=challenge_solution.challenge_id
    )

    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found"
        )

    if challenge.status == ChallengeStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your solution for the challenge is under review. You can't submit again during review.",
        )

    if challenge.status == ChallengeStatus.ACCEPTED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your solution for the challenge has been accepted.",
        )

    return challenges_crud.db_update_taken_challenge(
        db,
        user_id=UUID(current_user.id),
        challenge_id=challenge_solution.challenge_id,
        github_url=challenge_solution.github_url,
        presentation_video_url=challenge_solution.presentation_video_url,
        deployed_application_url=challenge_solution.deployed_application_url,
        _status=ChallengeStatus.SUBMITTED,
    )


@router.get(
    "/your-contributions",
    response_model=List[challenges_schemas.ContributedChallengeInfo],
)
def your_contributions(
    db: SessionDep,
    current_user: CurrentUser,
    approval_status: Optional[ApprovalStatus] = None,
):
    return challenges_crud.db_contributions(
        db, user_id=UUID(current_user.id), approval_status=approval_status
    )


@router.get("/topics")
def get_topics(db: SessionDep):
    return challenges_crud.db_get_topics(db)
