from datetime import datetime
from typing import Optional
from pydantic import BaseModel

# Entity representing an Avatar
class AvatarEntity (BaseModel):
    avatar_id: Optional[int]
    name: str
    image_url: str
    animation_url: str 
    theme_color: str
    is_default: bool
    created_by: str
    created_at: Optional[datetime]
    
    
