import logging
from typing import Optional, List
from ...Core.Entity.FriendEntity import FriendEntity
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)

class FriendRepository:
    
    def __init__(self):
        self._client = supabase
        self._table_name = "Friend"
    
    def dataToEntity(self, data: dict) -> FriendEntity:
        try:
            return FriendEntity(**data)
        except Exception as e:
            logger.error(f"Error converting data to FriendEntity: {e}")
            raise

    def entityToData(self, entity: FriendEntity) -> dict:
        if hasattr(entity, "to_dict") and callable(entity.to_dict):
            return entity.to_dict()
        return entity.__dict__

    def fetchFriendsByUserId(self, user_id: int) -> List[FriendEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("userId", user_id).execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching friends for user {user_id}: {e}")
            raise

    def fetchFriendsByStatus(self, user_id: int, status_id: int) -> List[FriendEntity]:
        try:
            response = self._client.table(self._table_name)\
                .select("*")\
                .eq("userId", user_id)\
                .eq("statusId", status_id)\
                .execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching friends by status for user {user_id}: {e}")
            raise

    def createFriendship(self, friendship: FriendEntity) -> FriendEntity:
        try:
            data = self.entityToData(friendship)
            response = self._client.table(self._table_name).insert(data).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to create friendship")
        except Exception as e:
            logger.error(f"Error creating friendship: {e}")
            raise

    def updateFriendship(self, friendship: FriendEntity) -> FriendEntity:
        try:
            data = self.entityToData(friendship)
            friendshipId = getattr(friendship, "id", None)
            
            if not friendshipId:
                raise ValueError("Friendship ID is required for update")
                
            response = self._client.table(self._table_name).update(data).eq("id", friendshipId).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update friendship")
        except Exception as e:
            logger.error(f"Error updating friendship: {e}")
            raise

    def deleteFriendship(self, friendship_id: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("id", friendship_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting friendship {friendship_id}: {e}")
            raise
