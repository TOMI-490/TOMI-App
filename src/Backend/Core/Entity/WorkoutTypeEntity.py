from pydantic import BaseModel

class WorkoutTypeEntity(BaseModel):
    workoutTypeId: int 
    name: str 
    description: str