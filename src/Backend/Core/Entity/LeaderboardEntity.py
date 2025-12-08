from pydantic import BaseModel

class LeaderboardEntity(BaseModel):
    leaderboardId: int 
    name: str 
    scope: str 
    startDate: str
    endDate: str 
    userId: int 
    score: int 
    rank: int