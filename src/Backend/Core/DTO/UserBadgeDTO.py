from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

# DTO for creating a new user badge
class UserBadgeCreateDTO(BaseModel):
    userId: int = Field(..., gt=0)
    badgeId: int = Field(..., gt=0)
    awardedDate: datetime

# DTO for updating a user badge
class UserBadgeUpdateDTO(BaseModel):
    awardedDate: Optional[datetime] = None

# DTO for responding with user badge data
class UserBadgeResponseDTO(BaseModel):
    id: int
    userId: int
    badgeId: int
    awardedDate: datetime
    
