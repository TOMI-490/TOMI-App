from pydantic import BaseModel


class GoalStatusEntity(BaseModel):
    goalStatusId: int 
    name: str 
    
    
    