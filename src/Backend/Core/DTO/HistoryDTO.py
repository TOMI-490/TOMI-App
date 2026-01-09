from pydantic import BaseModel
from typing import List, Optional
from datetime import date


class WeeklySummaryResponseDTO(BaseModel):
    # Weekly summary with workout stats and comparison to previous week
    weekStart: str  # YYYY-MM-DD
    weekEnd: str  # YYYY-MM-DD
    workoutsCount: int
    minutesTotal: int
    xpTotal: int
    deltaPercentFromLastWeek: float


class CalendarResponseDTO(BaseModel):
    # Calendar month data with active workout dates
    month: str  # YYYY-MM
    activeDates: List[str]  # List of YYYY-MM-DD dates with workouts


class WorkoutListItemDTO(BaseModel):
    # Workout item in history list with computed stats
    id: int
    type: str  # Workout type name
    startedAt: str  # ISO format
    durationMinutes: int
    xpEarned: int
    calories: Optional[int] = None
    avgHr: Optional[int] = None
    exercisesCount: Optional[int] = None


class PaginatedWorkoutsResponseDTO(BaseModel):
    # Paginated list of workouts
    items: List[WorkoutListItemDTO]
    page: int
    pageSize: int
    hasNext: bool
    total: int
