from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

# DTO for creating a new user avatar
class UserAvatarCreateDTO(BaseModel):
    user_id: int = Field(..., gt=0, alias="userId")
    avatar_id: int = Field(..., gt=0, alias="avatarId")
    nickname: str = Field(..., min_length=1, max_length=255)
    level: int = Field(default=1, ge=1)
    xp: int = Field(default=0, ge=0)
    age_days: int = Field(default=0, ge=0, alias="ageDays")
    hunger_level: int = Field(default=50, ge=0, le=100, alias="hungerLevel")
    sleepiness_level: int = Field(default=50, ge=0, le=100, alias="sleepinessLevel")
    boredome_level: int = Field(default=50, ge=0, le=100, alias="boredomeLevel")
    happines_level: int = Field(default=50, ge=0, le=100, alias="happinessLevel")
    is_active: bool = Field(default=True, alias="isActive")
    
    class Config:
        populate_by_name = True

# DTO for updating a user avatar
class UserAvatarUpdateDTO(BaseModel):
    nickname: Optional[str] = Field(None, min_length=1, max_length=255)
    level: Optional[int] = Field(None, ge=1)
    xp: Optional[int] = Field(None, ge=0)
    age_days: Optional[int] = Field(None, ge=0, alias="ageDays")
    hunger_level: Optional[int] = Field(None, ge=0, le=100, alias="hungerLevel")
    sleepiness_level: Optional[int] = Field(None, ge=0, le=100, alias="sleepinessLevel")
    boredome_level: Optional[int] = Field(None, ge=0, le=100, alias="boredomeLevel")
    happines_level: Optional[int] = Field(None, ge=0, le=100, alias="happinessLevel")
    is_active: Optional[bool] = Field(None, alias="isActive")
    
    class Config:
        populate_by_name = True

# DTO for responding with user avatar data
class UserAvatarResponseDTO(BaseModel):
    user_avatar_id: int = Field(..., alias="userAvatarId")
    user_id: int = Field(..., alias="userId")
    avatar_id: int = Field(..., alias="avatarId")
    nickname: str
    level: int
    xp: int
    age_days: int = Field(..., alias="ageDays")
    hunger_level: int = Field(..., alias="hungerLevel")
    sleepiness_level: int = Field(..., alias="sleepinessLevel")
    boredome_level: int = Field(..., alias="boredomeLevel")
    happines_level: int = Field(..., alias="happinessLevel")
    is_active: bool = Field(..., alias="isActive")
    last_updated: Optional[datetime] = Field(None, alias="lastUpdated")
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    
    class Config:
        populate_by_name = True
        by_alias = True

# DTO for responding with user avatar data including avatar details
class UserAvatarWithDetailsResponseDTO(BaseModel):
    user_avatar_id: int = Field(..., alias="userAvatarId")
    user_id: int = Field(..., alias="userId")
    avatar_id: int = Field(..., alias="avatarId")
    nickname: str
    level: int
    xp: int
    age_days: int = Field(..., alias="ageDays")
    hunger_level: int = Field(..., alias="hungerLevel")
    sleepiness_level: int = Field(..., alias="sleepinessLevel")
    boredome_level: int = Field(..., alias="boredomeLevel")
    happines_level: int = Field(..., alias="happinessLevel")
    is_active: bool = Field(..., alias="isActive")
    last_updated: Optional[datetime] = Field(None, alias="lastUpdated")
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    # Avatar details
    avatar_name: Optional[str] = Field(None, alias="avatarName")
    image_url: Optional[str] = Field(None, alias="imageUrl")
    animation_idle_url: Optional[str] = Field(None, alias="animationIdleUrl")
    animation_active_url: Optional[str] = Field(None, alias="animationActiveUrl")
    animation_post_workout_url: Optional[str] = Field(None, alias="animationPostWorkoutUrl")
    theme_color: Optional[str] = Field(None, alias="themeColor")
    # XP progression (calculated on backend)
    current_level_xp: int = Field(0, alias="currentLevelXp")
    next_level_xp: int = Field(100, alias="nextLevelXp")
    xp_progress: float = Field(0.0, alias="xpProgress")  # Percentage 0-100
    
    class Config:
        populate_by_name = True
        by_alias = True
