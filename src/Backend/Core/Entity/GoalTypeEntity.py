from pydantic import BaseModel

class GoalTypeEntity(BaseModel):
    goal_type_id: int 
    name: str 
    description: str
    default_unit: str
    
    