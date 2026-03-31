from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserEntity(BaseModel):
    user_id: int 
    auth_id: Optional[str] = None  # Supabase Auth UID
    email: str 
    name: str
    country: str 
    unit_system: str 
    language: str
    on_boarding_complete: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True  # Allow creating from ORM-like objects