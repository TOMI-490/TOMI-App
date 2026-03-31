from datetime import datetime 
from typing import Optional 
from pydantic import BaseModel, Field

# DTO for creating a new friend relationship
class FriendCreateDTO(BaseModel):
    userId: int = Field(..., gt=0)
    friendId: int = Field(..., gt=0)
    statusId: int = Field(..., gt=0)
    friendshipDate: Optional[datetime] = None
    

# DTO for updating a friend relationship
class FriendUpdateDTO(BaseModel):
    userId: Optional[int] = Field(None, gt=0)
    friendId: Optional[int] = Field(None, gt=0)
    statusId: Optional[int] = Field(None, gt=0)
    friendshipDate: Optional[datetime] = None


# DTO for responding with friend relationship data
class FriendResponseDTO(BaseModel):
    friendId: int
    userId: int
    statusId: int
    friendshipDate: Optional[datetime] = None
    

