from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

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
    avatarId: Optional[int] = None
    name: str
    imageURL: str
    animationIdleURL: Optional[str] = None
    animationActiveURL: Optional[str] = None
    animationPostWorkoutURL: Optional[str] = None
    themeColor: str
    isDefault: bool
    createdAt: Optional[datetime] = None
