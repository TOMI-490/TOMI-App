from pydantic import BaseModel
from datetime import datetime

class WorkoutEntity(BaseModel):
    workoutId: int 
    userId: int 
    workoutTypeId: int 
    start: datetime 
    end: datetime
    deviceId: int 
    
    