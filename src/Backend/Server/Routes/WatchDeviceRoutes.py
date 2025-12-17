from fastapi import APIRouter, HTTPException, status
from typing import List
import logging

from ...Core.Entity.WatchDeviceEntity import WatchDeviceEntity
from ...Core.DTO.WatchDeviceDTO import WatchDeviceCreateDTO, WatchDeviceUpdateDTO, WatchDeviceResponseDTO
from ...Infrastructure.Repository.WatchDeviceRepository import WatchDeviceRepository

logger = logging.getLogger(__name__)
router = APIRouter()
deviceRepo = WatchDeviceRepository()

# Get all devices
@router.get("/", response_model=List[WatchDeviceResponseDTO])
async def getAllDevices():
    try:
        devices = deviceRepo.fetchAllDevices()
        return [WatchDeviceResponseDTO(**device.__dict__) for device in devices]
    except Exception as e:
        logger.error(f"Error fetching all devices: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get all devices registered to a user
@router.get("/user/{user_id}", response_model=List[WatchDeviceResponseDTO])
async def getUserDevices(user_id: int):
    try:
        devices = deviceRepo.fetchDevicesByUserId(user_id)
        return [WatchDeviceResponseDTO(**device.__dict__) for device in devices]
    except Exception as e:
        logger.error(f"Error fetching devices for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get a specific watch device by ID
@router.get("/{device_id}", response_model=WatchDeviceResponseDTO)
async def getDevice(device_id: int):
    try:
        device = deviceRepo.fetchDeviceById(device_id)
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        return WatchDeviceResponseDTO(**device.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching device {device_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Register a new smartwatch or fitness tracker
@router.post("/", response_model=WatchDeviceResponseDTO, status_code=status.HTTP_201_CREATED)
async def registerDevice(device_data: WatchDeviceCreateDTO):
    try:
        device = WatchDeviceEntity(**device_data.model_dump())
        registered_device = deviceRepo.registerDevice(device)
        return WatchDeviceResponseDTO(**registered_device.__dict__)
    except Exception as e:
        logger.error(f"Error registering device: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Update a device
@router.put("/{device_id}", response_model=WatchDeviceResponseDTO)
async def updateDevice(device_id: int, device_data: WatchDeviceUpdateDTO):
    try:
        existing_device = deviceRepo.fetchDeviceById(device_id)
        if not existing_device:
            raise HTTPException(status_code=404, detail="Device not found")
        
        update_data = device_data.model_dump(exclude_unset=True)
        device_dict = existing_device.__dict__.copy()
        device_dict.update(update_data)
        
        device = WatchDeviceEntity(**device_dict)
        updated_device = deviceRepo.updateDevice(device)
        return WatchDeviceResponseDTO(**updated_device.__dict__)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating device {device_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Unregister a device from the user's account
@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteDevice(device_id: int):
    try:
        deviceRepo.deleteDevice(device_id)
    except Exception as e:
        logger.error(f"Error deleting device {device_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
