from typing import Optional
from pydantic import BaseModel, Field

# DTO for creating a new goal status
class GoalStatusCreateDTO(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

# DTO for updating a goal status
class GoalStatusUpdateDTO(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None

# DTO for responding with goal status data
class GoalStatusResponseDTO(BaseModel):
    goalStatusId: int
    name: str
    description: Optional[str] = None
    
