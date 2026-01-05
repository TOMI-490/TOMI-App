from pydantic import BaseModel
from datetime import datetime

class GoalEntity(BaseModel):
    goal_id: int 
    user_id: int
    goal_status_id: int 
    goal_type_id: int
    target_value: int 
    period: str 
    progress_value: int
    start_date: datetime
    end_date: datetime
    last_updated: datetime