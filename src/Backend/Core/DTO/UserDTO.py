from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

# DTO for creating a new user
class UserCreateDTO(BaseModel):
    authID: str = Field(..., min_length=1, max_length=255, serialization_alias="authID")  # Supabase Auth UID - matches DB column
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)
    country: str = Field(..., min_length=1, max_length=100)
    unitSystem: str = Field(..., min_length=1, max_length=50)
    language: str = Field(..., min_length=1, max_length=50)
    onBoardingComplete: bool = False  # Defaults to false for new users
    
    class Config:
        populate_by_name = True

# DTO for updating a user
class UserUpdateDTO(BaseModel):
    authID: Optional[str] = Field(None, min_length=1, max_length=255)
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    country: Optional[str] = Field(None, min_length=1, max_length=100)
    unitSystem: Optional[str] = Field(None, min_length=1, max_length=50)
    language: Optional[str] = Field(None, min_length=1, max_length=50)
    onBoardingComplete: Optional[bool] = None

# DTO for responding with user data
class UserResponseDTO(BaseModel):
    userId: int
    authID: Optional[str] = None  # Supabase Auth UID
    email: str
    name: str
    country: str
    unitSystem: str
    language: str
    onBoardingComplete: bool
    created_at: datetime = Field(alias="created_at")  # Matches DB column name
    
    class Config:
        populate_by_name = True
    
