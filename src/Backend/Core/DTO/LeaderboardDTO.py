from typing import Optional
from pydantic import BaseModel, Field

# DTO for creating a new leaderboard entry
class LeaderboardCreateDTO(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    scope: str = Field(..., min_length=1, max_length=100)
    startDate: str = Field(..., min_length=1)
    endDate: str = Field(..., min_length=1)
    userId: int = Field(..., gt=0)
    score: int = Field(..., ge=0)
    rank: int = Field(..., ge=1)

# DTO for updating a leaderboard entry
class LeaderboardUpdateDTO(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    scope: Optional[str] = Field(None, min_length=1, max_length=100)
    startDate: Optional[str] = Field(None, min_length=1)
    endDate: Optional[str] = Field(None, min_length=1)
    score: Optional[int] = Field(None, ge=0)
    rank: Optional[int] = Field(None, ge=1)

# DTO for responding with leaderboard data
class LeaderboardResponseDTO(BaseModel):
    leaderboardId: int
    name: str
    scope: str
    startDate: str
    endDate: str
    userId: int
    score: int
    rank: int
    
