from typing import Optional
from pydantic import BaseModel, Field

# DTO for creating a new streak
class StreakCreateDTO(BaseModel):
    userId: int = Field(..., gt=0)
    metric: str = Field(..., min_length=1, max_length=100)
    current: int = Field(default=0, ge=0)
    longest: int = Field(default=0, ge=0)

# DTO for updating a streak
class StreakUpdateDTO(BaseModel):
    metric: Optional[str] = Field(None, min_length=1, max_length=100)
    current: Optional[int] = Field(None, ge=0)
    longest: Optional[int] = Field(None, ge=0)

# DTO for responding with streak data
class StreakResponseDTO(BaseModel):
    streakId: int
    userId: int
    metric: str
    current: int
    longest: int
    

