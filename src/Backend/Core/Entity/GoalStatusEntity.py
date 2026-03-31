from pydantic import BaseModel


class GoalStatusEntity(BaseModel):
    goal_status_id: int 
    name: str 
    
    
    