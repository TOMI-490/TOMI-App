from pydantic import BaseModel
from datetime import datetime 

class UserAvatarEntity(BaseModel):
    user_avatar_id: int 
    user_id: int 
    avatar_id: int 
    nickname: str 
    level: int 
    xp: int 
    age_days: int 
    hunger_level: int 
    sleepiness_level: int 
    boredome_level: int 
    happines_level: int
    is_active: bool
    created_at: datetime 
    last_updated: datetime
    evolution_node_id: int = 1
    evolution_stage: str = 'baby'
    
    