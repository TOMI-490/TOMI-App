from typing import Optional
from pydantic import BaseModel, Field

# DTO for creating a new friend status
class FriendStatusCreateDTO(BaseModel):
    status: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)

# DTO for updating a friend status
class FriendStatusUpdateDTO(BaseModel):
    status: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)

# DTO for responding with friend status data
class FriendStatusResponseDTO(BaseModel):
    statusId: int
    status: str
    description: str
    