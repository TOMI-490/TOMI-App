from typing import Optional
from pydantic import BaseModel, Field

# DTO for creating a new notification
class NotificationCreateDTO(BaseModel):
    userId: int = Field(..., gt=0)
    notifType: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1)
    isRead: bool = False

# DTO for updating a notification
class NotificationUpdateDTO(BaseModel):
    notifType: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1)
    isRead: Optional[bool] = None

# DTO for responding with notification data
class NotificationResponseDTO(BaseModel):
    notifId: int
    userId: int
    notifType: str
    description: str
    isRead: bool
    
