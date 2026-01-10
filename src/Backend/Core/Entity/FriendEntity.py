from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class FriendEntity(BaseModel):
    id: Optional[int] = None
    user_id: int 
    friend_user_id: int 
    status_id: int
    friendship_date: datetime