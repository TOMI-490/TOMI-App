from pydantic import BaseModel
from datetime import datetime

class GoalEntity(BaseModel):
    goalId: int 
    userId: int
    goalStatusId: int 
    goalTypeId: int
    targetValue: int 
    period: str 
    startDate: datetime
    endDate: datetime
    lastUpdated: datetime