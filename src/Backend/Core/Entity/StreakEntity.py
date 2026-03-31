from pydantic import BaseModel

class StreakEntity(BaseModel):
    streak_id: int 
    user_id: int 
    metric: str 
    current: int 
    longest: int