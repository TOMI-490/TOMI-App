from datetime import datetime
from pydantic import BaseModel

class FriendEntity(BaseModel):
    id: int 
    userId: int 
    friendUserId: int 
    statusId: int
    friendshipDate: datetime