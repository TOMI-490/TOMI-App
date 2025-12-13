from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

# DTO for creating a new workout
class WorkoutCreateDTO(BaseModel):
    userId: int = Field(..., gt=0)
    workoutTypeId: int = Field(..., gt=0)
    start: datetime
    end: datetime
    deviceId: int = Field(..., gt=0)

# DTO for updating a workout
class WorkoutUpdateDTO(BaseModel):
    workoutTypeId: Optional[int] = Field(None, gt=0)
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    deviceId: Optional[int] = Field(None, gt=0)

# DTO for responding with workout data
class WorkoutResponseDTO(BaseModel):
    workoutId: int
    userId: int
    workoutTypeId: int
    start: datetime
    end: datetime
    deviceId: int
    
    class Config:
        from_attributes = True
