from typing import Optional
from pydantic import BaseModel, Field

# DTO for creating a new goal type
class GoalTypeCreateDTO(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    defaultUnit: str = Field(..., min_length=1, max_length=50)

# DTO for updating a goal type
class GoalTypeUpdateDTO(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    defaultUnit: Optional[str] = Field(None, min_length=1, max_length=50)

# DTO for responding with goal type data
class GoalTypeResponseDTO(BaseModel):
    goalTypeId: int
    name: str
    description: str
    defaultUnit: str
    