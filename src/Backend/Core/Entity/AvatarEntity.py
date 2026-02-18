from datetime import datetime
from typing import Optional
from pydantic import BaseModel

# Entity representing an Avatar
class AvatarEntity (BaseModel):
    avatar_id: Optional[int]
    name: str
    image_url: str
    animation_idle_url: Optional[str] = None        # Idle / resting state GIF
    animation_active_url: Optional[str] = None     # Active / happy state GIF
    animation_post_workout_url: Optional[str] = None  # Post-workout celebration GIF
    theme_color: str
    is_default: bool
    created_by: str
    created_at: Optional[datetime]
    
    
