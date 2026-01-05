from pydantic import BaseModel

class LeaderboardEntity(BaseModel):
    leaderboard_id: int 
    name: str 
    scope: str 
    start_date: str
    end_date: str 
    user_id: int 
    score: int 
    rank: int