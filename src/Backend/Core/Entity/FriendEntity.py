from datetime import datetime
from pydantic import BaseModel

class FriendEntity(BaseModel):
    id: int 
    user_id: int 
    friend_user_id: int 
    status_id: int
    friendship_date: datetime