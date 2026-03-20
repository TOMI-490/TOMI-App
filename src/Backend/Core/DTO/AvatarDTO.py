from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

# DTO for creating a new avatar
class AvatarCreateDTO(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    imageURL: str = Field(..., min_length=1)
    animationIdleURL: Optional[str] = Field(None, min_length=1)
    animationActiveURL: Optional[str] = Field(None, min_length=1)
    animationPostWorkoutURL: Optional[str] = Field(None, min_length=1)
    themeColor: str = Field(..., pattern=r'^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$')
    isDefault: bool = False

# DTO for updating an avatar
class AvatarUpdateDTO(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    imageURL: Optional[str] = Field(None, min_length=1)
    animationIdleURL: Optional[str] = Field(None, min_length=1)
    animationActiveURL: Optional[str] = Field(None, min_length=1)
    animationPostWorkoutURL: Optional[str] = Field(None, min_length=1)
    themeColor: Optional[str] = Field(None, pattern=r'^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$')
    isDefault: Optional[bool] = None

# DTO for responding with avatar data
class AvatarResponseDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    avatarId: Optional[int] = Field(None, alias="avatar_id")
    name: str = ""
    imageURL: Optional[str] = Field(None, alias="image_url")
    animationIdleURL: Optional[str] = Field(None, alias="animation_idle_url")
    animationActiveURL: Optional[str] = Field(None, alias="animation_active_url")
    animationPostWorkoutURL: Optional[str] = Field(None, alias="animation_post_workout_url")
    themeColor: Optional[str] = Field(None, alias="theme_color")
    isDefault: Optional[bool] = Field(False, alias="is_default")
    createdAt: Optional[datetime] = Field(None, alias="created_at")
