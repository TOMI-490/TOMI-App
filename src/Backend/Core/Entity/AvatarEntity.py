from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class AvatarEntity(BaseModel):
    avatar_id: Optional[int] = None
    name: str = ""
    image_url: Optional[str] = None
    animation_idle_url: Optional[str] = None
    animation_active_url: Optional[str] = None
    animation_post_workout_url: Optional[str] = None
    theme_color: Optional[str] = None
    is_default: Optional[bool] = False
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    
    
