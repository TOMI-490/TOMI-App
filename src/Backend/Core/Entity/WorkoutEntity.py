from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class WorkoutEntity(BaseModel):
    workout_id: Optional[int] = None
    user_id: int 
    workout_type_id: int 
    start: datetime 
    end: Optional[datetime] = None
    device_id: int
    xp_awarded: Optional[int] = None 
    
    