from pydantic import BaseModel

class GoalTypeEntity(BaseModel):
    goalTypeId: int 
    name: str 
    description: str
    defaultUnit: str
    
    