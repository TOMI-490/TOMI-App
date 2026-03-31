from pydantic import BaseModel

class WorkoutTypeEntity(BaseModel):
    workout_type_id: int 
    name: str 
    description: str