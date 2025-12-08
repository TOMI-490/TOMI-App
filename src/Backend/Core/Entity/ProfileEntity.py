
from pydantic import BaseModel

class ProfileEntity(BaseModel):
    profileId: int 
    userId: int 
    userAvatarId: int 
    bio: str
    totalExercice: int 
    totalDistance: float 
    totalSteps: int 
    longestStreak: int 