from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

# DTO for creating a new watch device
class WatchDeviceCreateDTO(BaseModel):
    userId: int = Field(..., gt=0)
    serialNumber: str = Field(..., min_length=1, max_length=255)
    model: str = Field(..., min_length=1, max_length=255)
    nickname: str = Field(..., min_length=1, max_length=255)

# DTO for updating a watch device
class WatchDeviceUpdateDTO(BaseModel):
    serialNumber: Optional[str] = Field(None, min_length=1, max_length=255)
    model: Optional[str] = Field(None, min_length=1, max_length=255)
    nickname: Optional[str] = Field(None, min_length=1, max_length=255)

# DTO for responding with watch device data
class WatchDeviceResponseDTO(BaseModel):
    deviceId: int
    userId: int
    serialNumber: str
    model: str
    nickname: str
    createdAt: datetime
    