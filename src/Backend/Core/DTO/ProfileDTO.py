from typing import Optional
from pydantic import BaseModel, Field

# DTO for creating a new profile
class ProfileCreateDTO(BaseModel):
    user_id: int = Field(..., gt=0, alias="userId")
    user_avatar_id: int = Field(..., gt=0, alias="userAvatarId")
    bio: str = Field(..., min_length=1)
    total_exercices: float = Field(default=0, ge=0, alias="totalExercices")
    total_distance: float = Field(default=0.0, ge=0, alias="totalDistance")
    total_steps: int = Field(default=0, ge=0, alias="totalSteps")
    longest_streak: int = Field(default=0, ge=0, alias="longestStreak")
    
    class Config:
        populate_by_name = True

# DTO for updating a profile
class ProfileUpdateDTO(BaseModel):
    user_avatar_id: Optional[int] = Field(None, gt=0, alias="userAvatarId")
    bio: Optional[str] = Field(None, min_length=1)
    total_exercices: Optional[float] = Field(None, ge=0, alias="totalExercices")
    total_distance: Optional[float] = Field(None, ge=0, alias="totalDistance")
    total_steps: Optional[int] = Field(None, ge=0, alias="totalSteps")
    longest_streak: Optional[int] = Field(None, ge=0, alias="longestStreak")
    
    class Config:
        populate_by_name = True

# DTO for responding with profile data
class ProfileResponseDTO(BaseModel):
    profile_id: int = Field(..., alias="profileId")
    user_id: int = Field(..., alias="userId")
    user_avatar_id: int = Field(..., alias="userAvatarId")
    bio: str
    total_exercices: float = Field(..., alias="totalExercices")
    total_distance: float = Field(..., alias="totalDistance")
    total_steps: int = Field(..., alias="totalSteps")
    longest_streak: int = Field(..., alias="longestStreak")
    
    class Config:
        populate_by_name = True
        by_alias = True

