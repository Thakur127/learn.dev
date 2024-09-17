import random, uuid
from app.api.models import User, Challenge, Topic
from app.api.models import users as users_model, challenges as challenges_model
from app.core.security.password import get_password_hash
from app.core.database import engine
from sqlmodel import Session
from faker import Faker

fake = Faker()

PASSWORD = "password"
HASHED_PASSWORD = get_password_hash(PASSWORD)

# list of 10 title for web development challenges
TITLES = [
    "Build a responsive navigation bar",
    "Implement a search bar with autocomplete",
    "Create a carousel with lazy loading",
    "Build a simple blog using Next.js",
    "Implement a login system with JWT",
    "Create a simple e-commerce store",
    "Build a weather app with API integration",
    "Create a simple chatbot with natural language processing",
    "Implement a simple game with physics engine",
    "Build a simple web scraper with beautifulsoup",
]

# description of the project
description = """
## Description

Description about the project. Like what minimum feature it should have

## Resources

[Wikipedia](https://wikipedia.org)


**Happing Coding 😃**
"""

# List of Topic and technologies
TOPIC_NAME = [
    "python",
    "javascript",
    "reactjs",
    "next.js",
    "frontend",
    "backend",
    "full statck",
    "java",
    "ruby on rails",
    "rust",
    "fastapi",
    "spring boot",
    "django",
    "angular",
    "vue",
    "HTML",
    "CSS",
    "SQL",
    "mongodb",
]


def populate_database():

    print("Started populating database")
    with Session(engine) as db:
        try:
            print("Database session created.")
            # populate users
            users = [
                User(
                    id=uuid.uuid4(),
                    first_name=fake.first_name(),
                    last_name=fake.last_name(),
                    username=fake.user_name(),
                    email=fake.email(),
                    password=HASHED_PASSWORD,
                    role=users_model.UserRole.USER,
                    provider=users_model.AccountProvider.CREDENTIALS,
                    is_email_verified=True,
                )
                for _ in range(10)
            ]
            print("List of users created.")

            # populate topics
            topics = [
                Topic(id=uuid.uuid4(), name=TOPIC_NAME[i])
                for i in range(len(TOPIC_NAME))
            ]
            print("List of topics created.")

            # populate challenges
            challenges = [
                Challenge(
                    id=uuid.uuid4(),
                    title=TITLES[i],
                    description=description,
                    contributor=random.choice(users),
                    difficulty_tag=random.choice(
                        [challenges_model.DifficultyTag.BEGINNER, challenges_model.DifficultyTag.INTERMEDIATE, challenges_model.DifficultyTag.ADVANCE, challenges_model.DifficultyTag.EXPERT]
                    ),
                    topic_tags=random.choices(topics, k=random.randint(1, 3)),
                )
                for i in range(10)
            ]
            print("List of challenges created")

            print("seeding into database")
            # seed database
            db.add_all(users)
            db.add_all(topics)
            db.add_all(challenges)
            db.commit()
            print("Database seeded successfully 👍.")
        except Exception as e:
            db.rollback()
            print("Seeding Failed")
            print(e)
            raise


if __name__ == "__main__":
    populate_database()
