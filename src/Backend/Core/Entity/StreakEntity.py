from pydantic import BaseModel

class StreakEntity(BaseModel):
    streakId: int 
    userId: int 
    metric: str 
    current: int 
    longest: int