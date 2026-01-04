from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


# Earned badge with badge details
class EarnedBadgeDTO(BaseModel):
    id: int
    badgeId: int
    achievement: str
    name: str
    description: str
    awardedDate: datetime


# Upcoming badge progress
class UpcomingBadgeDTO(BaseModel):
    id: str  # e.g., "workout_10", "streak_7", "distance_marathon"
    achievement: str  # matches badge.achievement
    name: str
    description: str
    current: int
    target: int
    unit: str  # e.g., "workouts", "days", "km"
    progress: float  # percentage 0-100


# Progress ring for goals
class ProgressRingDTO(BaseModel):
    key: str  # e.g., "stepsDaily", "minutesDaily", "workoutsWeekly"
    label: str
    current: int
    target: int
    unit: str
    progress: float  # percentage 0-100
    goalId: Optional[int] = None


# Leaderboard entry
class LeaderboardEntryDTO(BaseModel):
    userId: int
    userName: str
    score: int
    rank: int


# Leaderboard preview
class LeaderboardPreviewDTO(BaseModel):
    leaderboardId: int
    name: str
    scope: str  # "friends" or "global"
    userEntry: Optional[LeaderboardEntryDTO] = None
    top3: List[LeaderboardEntryDTO] = Field(default_factory=list)


# Complete gamification response
class GamificationResponseDTO(BaseModel):
    badgesEarned: List[EarnedBadgeDTO] = Field(default_factory=list)
    badgesUpcoming: List[UpcomingBadgeDTO] = Field(default_factory=list)
    progressRings: List[ProgressRingDTO] = Field(default_factory=list)
    leaderboards: List[LeaderboardPreviewDTO] = Field(default_factory=list)
