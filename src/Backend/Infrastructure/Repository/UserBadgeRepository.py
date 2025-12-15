import logging
from typing import Optional, List
from ...Core.Entity.UserBadge import UserBadgeEntity
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)

class UserBadgeRepository:
    
    def __init__(self):
        self._client = supabase
        self._table_name = "UserBadge"
    
    def dataToEntity(self, data: dict) -> UserBadgeEntity:
        try:
            return UserBadgeEntity(**data)
        except Exception as e:
            logger.error(f"Error converting data to UserBadge: {e}")
            raise

    def entityToData(self, entity: UserBadgeEntity) -> dict:
        if hasattr(entity, "to_dict") and callable(entity.to_dict):
            return entity.to_dict()
        return entity.__dict__

    def fetchBadgesByUserId(self, user_id: int) -> List[UserBadgeEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("userId", user_id).execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching badges for user {user_id}: {e}")
            raise

    def awardBadge(self, user_badge: UserBadgeEntity) -> UserBadgeEntity:
        try:
            data = self.entityToData(user_badge)
            response = self._client.table(self._table_name).insert(data).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to award badge")
        except Exception as e:
            logger.error(f"Error awarding badge: {e}")
            raise

    def deleteBadge(self, user_badge_id: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("id", user_badge_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting user badge {user_badge_id}: {e}")
            raise
