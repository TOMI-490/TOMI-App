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
    goalId: int = Field(..., alias="goal_id")
    userId: int = Field(..., alias="user_id")
    goalStatusId: int = Field(..., alias="goal_status_id")
    goalTypeId: int = Field(..., alias="goal_type_id")
    targetValue: int = Field(..., alias="target_value")
    period: str
    startDate: datetime = Field(..., alias="start_date")
    endDate: datetime = Field(..., alias="end_date")
    lastUpdated: datetime = Field(..., alias="last_updated")
    
    class Config:
        populate_by_name = True


# DTO for responding with goal data including related entities
class GoalWithDetailsResponseDTO(BaseModel):
    goalId: int = Field(..., alias="goal_id")
    userId: int = Field(..., alias="user_id")
    goalStatusId: int = Field(..., alias="goal_status_id")
    goalStatusName: str = Field(..., alias="goal_status_name")
    goalTypeId: int = Field(..., alias="goal_type_id")
    goalTypeName: str = Field(..., alias="goal_type_name")
    goalTypeUnit: str = Field(..., alias="goal_type_unit")
    targetValue: int = Field(..., alias="target_value")
    progressValue: int = Field(0, alias="progress_value")  # Current progress toward goal
    period: str
    startDate: datetime = Field(..., alias="start_date")
    endDate: datetime = Field(..., alias="end_date")
    lastUpdated: datetime = Field(..., alias="last_updated")
    
    class Config:
        populate_by_name = True


# DTO for user-specific goal data with progress
class UserGoalDTO(BaseModel):
    goalId: int
    title: str
    description: Optional[str] = None
    targetValue: int
    currentValue: int = 0
    unit: str
    isCompleted: bool = False
    progress: float = 0.0  # Percentage 0-100
    deadline: Optional[datetime] = None
    createdAt: datetime


# DTO for goal progress tracking
class GoalProgressDTO(BaseModel):
    goalId: int
    userId: int
    currentValue: int
    targetValue: int
    progress: float  # Percentage 0-100
    isCompleted: bool
    xpAwarded: int = 0
    unit: str
    