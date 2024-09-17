from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import UserRouter, AuthRouter, ChallengeRouter
from app.core.config import settings


description = """
### Learn Development by solving challenges posted by Industry experts 🐱‍💻

"""

app = FastAPI(
    root_path=f"{settings.api_v1_str}",
    title="Learn Dev API",
    description=description,
    debug=True,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.ALLOW_METHODS,
    allow_headers=settings.ALLOW_HEADERS,
)

app.include_router(UserRouter)
app.include_router(AuthRouter)
app.include_router(ChallengeRouter)


@app.get("/")
def health_check():
    return "up and running"
