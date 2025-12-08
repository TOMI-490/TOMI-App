from pydantic import BaseModel
from datetime import datetime 

class UserAvatarEntity(BaseModel):
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
    
    