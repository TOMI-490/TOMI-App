from pydantic import BaseModel
from datetime import datetime

class UserBadgeEntity(BaseModel):
    id: int 
    userId: int
    badgeId: int 
    awardedDate: datetime