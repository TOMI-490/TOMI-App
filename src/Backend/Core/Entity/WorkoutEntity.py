from pydantic import BaseModel
from datetime import datetime

class WorkoutEntity(BaseModel):
    workout_id: int 
    user_id: int 
    workout_type_id: int 
    start: datetime 
    end: datetime
    device_id: int 
    
    