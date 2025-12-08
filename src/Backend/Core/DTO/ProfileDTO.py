from typing import Optional
from pydantic import BaseModel, Field

# DTO for creating a new profile
class ProfileCreateDTO(BaseModel):
    userId: int = Field(..., gt=0)
    userAvatarId: int = Field(..., gt=0)
    bio: str = Field(..., min_length=1)
    totalExercice: int = Field(default=0, ge=0)
    totalDistance: float = Field(default=0.0, ge=0)
    totalSteps: int = Field(default=0, ge=0)
    longestStreak: int = Field(default=0, ge=0)

# DTO for updating a profile
class ProfileUpdateDTO(BaseModel):
    userAvatarId: Optional[int] = Field(None, gt=0)
    bio: Optional[str] = Field(None, min_length=1)
    totalExercice: Optional[int] = Field(None, ge=0)
    totalDistance: Optional[float] = Field(None, ge=0)
    totalSteps: Optional[int] = Field(None, ge=0)
    longestStreak: Optional[int] = Field(None, ge=0)

# DTO for responding with profile data
class ProfileResponseDTO(BaseModel):
    profileId: int
    userId: int
    userAvatarId: int
    bio: str
    totalExercice: int
    totalDistance: float
    totalSteps: int
    longestStreak: int
    
