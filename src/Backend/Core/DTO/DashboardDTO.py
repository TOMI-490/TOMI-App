from typing import Optional, List
from pydantic import BaseModel, Field
from .UserDTO import UserResponseDTO
from .ProfileDTO import ProfileResponseDTO
from .UserAvatarDTO import UserAvatarWithDetailsResponseDTO
from .StreakDTO import StreakResponseDTO
from .WorkoutDTO import WorkoutResponseDTO
from .GoalDTO import GoalWithDetailsResponseDTO

# DTO for dashboard aggregated data
class DashboardDTO(BaseModel):
    user: UserResponseDTO
    profile: Optional[ProfileResponseDTO] = None
    tomi: Optional[UserAvatarWithDetailsResponseDTO] = None
    streaks: List[StreakResponseDTO] = []
    recent_workouts: List[WorkoutResponseDTO] = Field(default=[], alias="recentWorkouts")
    goals: List[GoalWithDetailsResponseDTO] = []
    
    class Config:
        populate_by_name = True
        by_alias = True

