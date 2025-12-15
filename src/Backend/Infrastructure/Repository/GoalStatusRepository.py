import logging
from typing import Optional, List
from ...Core.Entity.GoalStatusEntity import GoalStatusEntity
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)

class GoalStatusRepository:
    
    def __init__(self):
        self._client = supabase
        self._table_name = "GoalStatus"
    
    def dataToEntity(self, data: dict) -> GoalStatusEntity:
        try:
            return GoalStatusEntity(**data)
        except Exception as e:
            logger.error(f"Error converting data to GoalStatusEntity: {e}")
            raise

    def entityToData(self, entity: GoalStatusEntity) -> dict:
        if hasattr(entity, "to_dict") and callable(entity.to_dict):
            return entity.to_dict()
        return entity.__dict__

    def fetchAllStatuses(self) -> List[GoalStatusEntity]:
        try:
            response = self._client.table(self._table_name).select("*").execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching all goal statuses: {e}")
            raise

    def fetchStatusById(self, status_id: int) -> Optional[GoalStatusEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("goalStatusId", status_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching goal status {status_id}: {e}")
            raise

    def createStatus(self, status: GoalStatusEntity) -> GoalStatusEntity:
        try:
            data = self.entityToData(status)
            response = self._client.table(self._table_name).insert(data).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to create goal status")
        except Exception as e:
            logger.error(f"Error creating goal status: {e}")
            raise
