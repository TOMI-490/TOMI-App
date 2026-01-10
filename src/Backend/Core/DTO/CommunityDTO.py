from typing import Optional, List, Literal
from pydantic import BaseModel, Field
from datetime import datetime


# DTO for user search results
class UserSearchResultDTO(BaseModel):
    userId: int
    displayName: str
    level: Optional[int] = None
    avatarUrl: Optional[str] = None
    relationship: Literal["none", "friends", "incoming_request", "outgoing_request", "blocked"]


# DTO for friend list
class FriendListItemDTO(BaseModel):
    userId: int
    displayName: str
    level: Optional[int] = None
    avatarUrl: Optional[str] = None


# DTO for friend request
class FriendRequestItemDTO(BaseModel):
    requestId: int
    userId: int
    displayName: str
    level: Optional[int] = None
    avatarUrl: Optional[str] = None
    requestDate: Optional[datetime] = None


# DTO for friend requests response
class FriendRequestsResponseDTO(BaseModel):
    incoming: List[FriendRequestItemDTO]
    outgoing: List[FriendRequestItemDTO]


# DTO for creating friend request
class CreateFriendRequestDTO(BaseModel):
    toUserId: int = Field(..., gt=0)


# DTO for leaderboard entry
class LeaderboardEntryDTO(BaseModel):
    rank: int
    userId: int
    displayName: str
    xp: int
    level: Optional[int] = None
    avatarUrl: Optional[str] = None


# DTO for current user leaderboard position
class CurrentUserLeaderboardDTO(BaseModel):
    rank: int
    xp: int
    level: Optional[int] = None


# DTO for leaderboard response
class LeaderboardResponseDTO(BaseModel):
    scope: Literal["friends", "global"]
    period: Literal["week", "month"]
    entries: List[LeaderboardEntryDTO]
    currentUser: Optional[CurrentUserLeaderboardDTO] = None


# DTO for friend visit profile
class FriendVisitProfileDTO(BaseModel):
    userId: int
    displayName: str
    level: Optional[int] = None
    avatarUrl: Optional[str] = None
    avatarImageUrl: Optional[str] = None
    avatarPreviewUrl: Optional[str] = None
    homeSceneId: Optional[str] = None
    homePreviewUrl: Optional[str] = None
    bio: Optional[str] = None
    totalExercises: Optional[float] = None
    totalDistance: Optional[float] = None
    totalSteps: Optional[int] = None
    longestStreak: Optional[int] = None


# DTO for friend stats summary
class FriendStatsDTO(BaseModel):
    range: Literal["week", "month"]
    workoutsCount: int
    minutesTotal: int
    xpTotal: int


# DTO for friend recent workout item
class FriendRecentWorkoutDTO(BaseModel):
    id: int
    type: str
    startedAt: datetime
    durationMinutes: int
    xpEarned: Optional[int] = None
    calories: Optional[int] = None
    avgHr: Optional[int] = None
    exercisesCount: Optional[int] = None


# DTO for friend recent workouts response
class FriendRecentWorkoutsDTO(BaseModel):
    items: List[FriendRecentWorkoutDTO]


# DTO for user search query
class UserSearchQueryDTO(BaseModel):
    q: str = Field(..., min_length=1)


# DTO for leaderboard query
class LeaderboardQueryDTO(BaseModel):
    scope: Literal["friends", "global"] = "friends"
    period: Literal["week", "month"] = "week"


# DTO for friend dashboard summary - XP progress
class XpProgressDTO(BaseModel):
    currentXp: int
    nextLevelXp: int
    progress: float  # Percentage 0-100


# DTO for friend dashboard summary - Streak info
class StreakInfoDTO(BaseModel):
    days: int
    label: str  # e.g., "5 days streak" or "No streak"


# DTO for friend dashboard summary - This week stats
class ThisWeekStatsDTO(BaseModel):
    workoutsCount: int
    minutesTotal: int
    xpTotal: int


# DTO for friend dashboard summary response
class FriendDashboardSummaryDTO(BaseModel):
    userId: int
    displayName: str
    level: int
    avatarNickname: str
    avatarImageUrl: Optional[str] = None
    themeColor: Optional[str] = None
    xp: dict  # Will contain currentXp, nextLevelXp, progress
    streak: dict  # Will contain days, label
    thisWeek: dict  # Will contain workoutsCount, minutesTotal, xpTotal

