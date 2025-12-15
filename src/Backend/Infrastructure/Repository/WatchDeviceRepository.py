import logging
from typing import Optional, List
from ...Core.Entity.WatchDeviceEntity import WatchDeviceEntity
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)

class WatchDeviceRepository:
    
    def __init__(self):
        self._client = supabase
        self._table_name = "WatchDevice"
    
    def dataToEntity(self, data: dict) -> WatchDeviceEntity:
        try:
            return WatchDeviceEntity(**data)
        except Exception as e:
            logger.error(f"Error converting data to WatchDeviceEntity: {e}")
            raise

    def entityToData(self, entity: WatchDeviceEntity) -> dict:
        if hasattr(entity, "to_dict") and callable(entity.to_dict):
            return entity.to_dict()
        return entity.__dict__

    def fetchDevicesByUserId(self, user_id: int) -> List[WatchDeviceEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("userId", user_id).execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching devices for user {user_id}: {e}")
            raise

    def fetchDeviceById(self, device_id: int) -> Optional[WatchDeviceEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("DeviceId", device_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching device {device_id}: {e}")
            raise

    def registerDevice(self, device: WatchDeviceEntity) -> WatchDeviceEntity:
        try:
            data = self.entityToData(device)
            response = self._client.table(self._table_name).insert(data).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to register device")
        except Exception as e:
            logger.error(f"Error registering device: {e}")
            raise

    def updateDevice(self, device: WatchDeviceEntity) -> WatchDeviceEntity:
        try:
            data = self.entityToData(device)
            deviceId = getattr(device, "DeviceId", None)
            
            if not deviceId:
                raise ValueError("Device ID is required for update")
                
            response = self._client.table(self._table_name).update(data).eq("DeviceId", deviceId).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update device")
        except Exception as e:
            logger.error(f"Error updating device: {e}")
            raise

    def deleteDevice(self, device_id: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("DeviceId", device_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting device {device_id}: {e}")
            raise
