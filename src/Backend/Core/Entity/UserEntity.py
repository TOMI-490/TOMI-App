from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserEntity(BaseModel):
    userId: int 
    authUid: Optional[str] = None  # Supabase Auth UID
    email: str 
    name: str
    country: str 
    unitSystem: str 
    language: str
    createdAt: datetime