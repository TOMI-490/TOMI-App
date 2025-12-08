from pydantic import BaseModel

class FriendStatusEntity(BaseModel):
    statusId: int 
    status: str 
    description: str
    
    
    