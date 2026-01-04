from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

# DTO for creating a new user
class UserCreateDTO(BaseModel):
    auth_id: str = Field(..., min_length=1, max_length=255, alias="authID")  # Accept authID from frontend, store as auth_id
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)
    country: str = Field(..., min_length=1, max_length=100)
    unit_system: str = Field(..., min_length=1, max_length=50, alias="unitSystem")  # Accept unitSystem from frontend
    language: str = Field(..., min_length=1, max_length=50)
    on_boarding_complete: bool = Field(default=False, alias="onBoardingComplete")  # Accept onBoardingComplete from frontend
    
    class Config:
        populate_by_name = True

# DTO for updating a user
class UserUpdateDTO(BaseModel):
    auth_id: Optional[str] = Field(None, min_length=1, max_length=255, alias="authID")
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    country: Optional[str] = Field(None, min_length=1, max_length=100)
    unit_system: Optional[str] = Field(None, min_length=1, max_length=50, alias="unitSystem")
    language: Optional[str] = Field(None, min_length=1, max_length=50)
    on_boarding_complete: Optional[bool] = Field(None, alias="onBoardingComplete")
    
    class Config:
        populate_by_name = True

# DTO for responding with user data
class UserResponseDTO(BaseModel):
    user_id: int = Field(..., alias="userId")  # Return as userId to frontend
    auth_id: Optional[str] = Field(None, alias="authID")  # Return as authID to frontend
    email: str
    name: str
    country: str
    unit_system: str = Field(..., alias="unitSystem")  # Return as unitSystem to frontend
    language: str
    on_boarding_complete: bool = Field(..., alias="onBoardingComplete")  # Return as onBoardingComplete to frontend
    created_at: datetime = Field(..., alias="createdAt")  # Return as createdAt to frontend
    
    class Config:
        populate_by_name = True
        by_alias = True  # Serialize using aliases (camelCase for frontend)
    
