from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

# DTO for creating a new goal
class GoalCreateDTO(BaseModel):
    userId: int = Field(..., gt=0)
    goalStatusId: int = Field(..., gt=0)
    goalTypeId: int = Field(..., gt=0)
    targetValue: int = Field(..., ge=0)
    period: str = Field(..., min_length=1, max_length=100)
    startDate: datetime
    endDate: datetime

# DTO for updating a goal
class GoalUpdateDTO(BaseModel):
    goalStatusId: Optional[int] = Field(None, gt=0)
    goalTypeId: Optional[int] = Field(None, gt=0)
    targetValue: Optional[int] = Field(None, ge=0)
    period: Optional[str] = Field(None, min_length=1, max_length=100)
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None

# DTO for responding with goal data
class GoalResponseDTO(BaseModel):
    goalId: int
    userId: int
    goalStatusId: int
    goalTypeId: int
    targetValue: int
    period: str
    startDate: datetime
    endDate: datetime
    lastUpdated: datetime


# DTO for responding with goal data including related entities
class GoalWithDetailsResponseDTO(BaseModel):
    goalId: int
    userId: int
    goalStatusId: int
    goalStatusName: str
    goalTypeId: int
    goalTypeName: str
    goalTypeUnit: str
    targetValue: int
    progressValue: int = 0  # Current progress toward goal
    period: str
    startDate: datetime
    endDate: datetime
    lastUpdated: datetime
    