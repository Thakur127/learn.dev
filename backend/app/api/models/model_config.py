from pydantic import ConfigDict
from sqlmodel import SQLModel


# class SQLBaseModel(SQLModel):

#     model_config = ConfigDict(arbitrary_types_allowed=True)


class SQLBaseModel(SQLModel):
    class Config:
        arbitrary_types_allowed = True
