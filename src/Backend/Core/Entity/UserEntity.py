from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class UserEntity(BaseModel):
    userId: int 
    authID: Optional[str] = Field(None, alias="authID")  # Supabase Auth UID - database column name
    email: str 
    name: str
    country: str 
    unitSystem: str 
    language: str
    onBoardingComplete: bool = False  # Indicates whether the user has completed onboarding
    created_at: datetime = Field(alias="created_at")  # Database column name
    
    class Config:
        populate_by_name = True  # Allow using both field name and alias