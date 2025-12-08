from typing import Optional
from pydantic import BaseModel, Field

# DTO for creating a new workout type
class WorkoutTypeCreateDTO(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)

# DTO for updating a workout type
class WorkoutTypeUpdateDTO(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)

# DTO for responding with workout type data
class WorkoutTypeResponseDTO(BaseModel):
    workoutTypeId: int
    name: str
    description: str
    
    class Config:
        from_attributes = True
