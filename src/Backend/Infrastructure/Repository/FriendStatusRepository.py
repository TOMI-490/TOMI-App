import logging
from typing import Optional, List
from ...Core.Entity.FriendStatusEntity import FriendStatusEntity
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)

class FriendStatusRepository:
    
    def __init__(self):
        self._client = supabase
        self._table_name = "FriendStatus"
    
    def dataToEntity(self, data: dict) -> FriendStatusEntity:
        try:
            return FriendStatusEntity(**data)
        except Exception as e:
            logger.error(f"Error converting data to FriendStatusEntity: {e}")
            raise

    def entityToData(self, entity: FriendStatusEntity) -> dict:
        if hasattr(entity, "to_dict") and callable(entity.to_dict):
            return entity.to_dict()
        return entity.__dict__

    def fetchAllStatuses(self) -> List[FriendStatusEntity]:
        try:
            response = self._client.table(self._table_name).select("*").execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching all friend statuses: {e}")
            raise

    def fetchStatusById(self, status_id: int) -> Optional[FriendStatusEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("statusId", status_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching friend status {status_id}: {e}")
            raise

    def createStatus(self, status: FriendStatusEntity) -> FriendStatusEntity:
        try:
            data = self.entityToData(status)
            response = self._client.table(self._table_name).insert(data).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to create friend status")
        except Exception as e:
            logger.error(f"Error creating friend status: {e}")
            raise

    def updateStatus(self, status: FriendStatusEntity) -> FriendStatusEntity:
        try:
            data = self.entityToData(status)
            statusId = getattr(status, "statusId", None)
            
            if not statusId:
                raise ValueError("Status ID is required for update")
                
            response = self._client.table(self._table_name).update(data).eq("statusId", statusId).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update friend status")
        except Exception as e:
            logger.error(f"Error updating friend status: {e}")
            raise

    def deleteStatus(self, status_id: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("statusId", status_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting friend status {status_id}: {e}")
            raise
