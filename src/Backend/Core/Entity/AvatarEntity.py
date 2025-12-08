from datetime import datetime
from typing import Optional
from pydantic import BaseModel

# Entity representing an Avatar
class AvatarEntity (BaseModel):
    avatarId: Optional[int]
    name: str
    imageURL: str
    animationURL: str 
    themeColor: str
    isDefault: bool
    createdAt: Optional[datetime]
    
    
