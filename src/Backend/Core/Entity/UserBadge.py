from pydantic import BaseModel
from datetime import datetime

class UserBadgeEntity(BaseModel):
    id: int 
    user_id: int
    badge_id: int 
    awarded_date: datetime