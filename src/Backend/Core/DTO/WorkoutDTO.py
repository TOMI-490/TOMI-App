from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

# DTO for creating a new workout
class WorkoutCreateDTO(BaseModel):
    userId: int = Field(..., gt=0)
    workoutTypeId: int = Field(..., gt=0)
    start: datetime
    end: datetime
    deviceId: int = Field(..., gt=0)

# DTO for starting a workout (end is null initially)
class WorkoutStartDTO(BaseModel):
    userId: int = Field(..., gt=0)
    workoutTypeId: int = Field(..., gt=0)
    deviceId: int = Field(..., gt=0)
    xpAwarded: Optional[int] = Field(None, ge=5, le=500)

# DTO for ending a workout (just updates end timestamp)
class WorkoutEndDTO(BaseModel):
    pass  # No body needed, end time will be set to now()

# DTO for updating a workout
class WorkoutUpdateDTO(BaseModel):
    workoutTypeId: Optional[int] = Field(None, gt=0)
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    deviceId: Optional[int] = Field(None, gt=0)

# DTO for responding with workout data
class WorkoutResponseDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    workoutId: int
    userId: int
    workoutTypeId: int
    start: datetime
    end: Optional[datetime]
    deviceId: int
    xpAwarded: Optional[int] = Field(default=None, alias="xpAwarded")

# DTO for responding with workout end data (includes XP awarded and mood deltas)
class WorkoutEndResponseDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    workoutId: int
    userId: int
    workoutTypeId: int
    start: datetime
    end: Optional[datetime]
    deviceId: int
    xpAwarded: int = Field(default=0, description="Experience points awarded for this workout")
    durationMinutes: int = Field(default=0)
    hungerDelta: int = Field(default=0)
    sleepinessDelta: int = Field(default=0)
    boredomDelta: int = Field(default=0)
    happinessDelta: int = Field(default=0)
