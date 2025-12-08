from pydantic import BaseModel
from datetime import datetime


class UserEntity(BaseModel):
    userId: int 
    email: str 
    name: str
    country: str 
    unitSystem: str 
    language: str
    createdAt: datetime