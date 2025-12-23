from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

# DTO for creating a new user
class UserCreateDTO(BaseModel):
    authUid: str = Field(..., min_length=1, max_length=255)  # Supabase Auth UID
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)
    country: str = Field(..., min_length=1, max_length=100)
    unitSystem: str = Field(..., min_length=1, max_length=50)
    language: str = Field(..., min_length=1, max_length=50)

# DTO for updating a user
class UserUpdateDTO(BaseModel):
    authUid: Optional[str] = Field(None, min_length=1, max_length=255)
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    country: Optional[str] = Field(None, min_length=1, max_length=100)
    unitSystem: Optional[str] = Field(None, min_length=1, max_length=50)
    language: Optional[str] = Field(None, min_length=1, max_length=50)

# DTO for responding with user data
class UserResponseDTO(BaseModel):
    userId: int
    authUid: Optional[str] = None  # Supabase Auth UID
    email: str
    name: str
    country: str
    unitSystem: str
    language: str
    createdAt: datetime
    
