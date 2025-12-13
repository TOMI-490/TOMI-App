from pydantic import BaseModel
from datetime import datetime


class WatchDeviceEntity(BaseModel):
    deviceId: int 
    userId: int 
    serialNumber: str 
    model: str 
    nickname: str 
    createdAt: datetime