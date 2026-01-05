
from pydantic import BaseModel

class ProfileEntity(BaseModel):
    profile_id: int 
    user_id: int 
    user_avatar_id: int 
    bio: str
    total_exercices: float 
    total_distance: float 
    total_steps: int 
    longest_streak: int 