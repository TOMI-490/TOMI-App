from pydantic import BaseModel
from datetime import datetime


class WatchDeviceEntity(BaseModel):
    device_id: int 
    user_id: int 
    serial_no: str 
    model: str 
    nickname: str 
    created_at: datetime