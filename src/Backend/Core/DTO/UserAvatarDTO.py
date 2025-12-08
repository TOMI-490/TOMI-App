from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

# DTO for creating a new user avatar
class UserAvatarCreateDTO(BaseModel):
    userId: int = Field(..., gt=0)
    avatarId: int = Field(..., gt=0)
    nickname: str = Field(..., min_length=1, max_length=255)
    level: int = Field(default=1, ge=1)
    xp: int = Field(default=0, ge=0)
    ageDays: int = Field(default=0, ge=0)
    hungerLevel: int = Field(default=50, ge=0, le=100)
    sleepinessLevel: int = Field(default=50, ge=0, le=100)
    boredomeLevel: int = Field(default=50, ge=0, le=100)
    happinessLevel: int = Field(default=50, ge=0, le=100)
    isActive: bool = True

# DTO for updating a user avatar
class UserAvatarUpdateDTO(BaseModel):
    nickname: Optional[str] = Field(None, min_length=1, max_length=255)
    level: Optional[int] = Field(None, ge=1)
    xp: Optional[int] = Field(None, ge=0)
    ageDays: Optional[int] = Field(None, ge=0)
    hungerLevel: Optional[int] = Field(None, ge=0, le=100)
    sleepinessLevel: Optional[int] = Field(None, ge=0, le=100)
    boredomeLevel: Optional[int] = Field(None, ge=0, le=100)
    happinessLevel: Optional[int] = Field(None, ge=0, le=100)
    isActive: Optional[bool] = None

# DTO for responding with user avatar data
class UserAvatarResponseDTO(BaseModel):
    userAvatarId: int
    userId: int
    avatarId: int
    nickname: str
    level: int
    xp: int
    ageDays: int
    hungerLevel: int
    sleepinessLevel: int
    boredomeLevel: int
    happinessLevel: int
    isActive: bool
    createdAt: datetime
    lastUpdated: datetime
    

