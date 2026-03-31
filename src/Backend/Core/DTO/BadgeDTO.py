from typing import Optional
from pydantic import BaseModel, Field

# DTO for creating a new badge
class BadgeCreateDTO(BaseModel):
    achievement: str = Field(..., min_length=1, max_length=255)
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    
    
    
# DTO for updating a badge
class BadgeUpdateDTO(BaseModel):
    achievement: Optional[str] = Field(None, min_length=1, max_length=255)
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    

# DTO for responding with badge data
class BadgeResponseDTO(BaseModel):
    badgeId: int
    achievement: str
    name: str
    description: str
    

