import logging
from typing import Optional, List
from ...Core.Entity.BadgeEntity import BadgeEntity
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)

class BadgeRepository:
    
    def __init__(self):
        self._client = supabase
        self._table_name = "badge"
    
    def dataToEntity(self, data: dict) -> BadgeEntity:
        try:
            return BadgeEntity(**data)
        except Exception as e:
            logger.error(f"Error converting data to BadgeEntity: {e}")
            raise

    def entityToData(self, entity: BadgeEntity) -> dict:
        if hasattr(entity, "to_dict") and callable(entity.to_dict):
            return entity.to_dict()
        return entity.__dict__

    def fetchAllBadges(self) -> List[BadgeEntity]:
        try:
            response = self._client.table(self._table_name).select("*").execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching all badges: {e}")
            raise

    def fetchBadgeById(self, badge_id: int) -> Optional[BadgeEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("badge_id", badge_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching badge {badge_id}: {e}")
            raise

    def createBadge(self, badge: BadgeEntity) -> BadgeEntity:
        try:
            data = self.entityToData(badge)
            response = self._client.table(self._table_name).insert(data).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to create badge")
        except Exception as e:
            logger.error(f"Error creating badge: {e}")
            raise

    def updateBadge(self, badge: BadgeEntity) -> BadgeEntity:
        try:
            data = self.entityToData(badge)
            badge_id = getattr(badge, "badge_id", None)
            
            if not badge_id:
                raise ValueError("Badge ID is required for update")
            
            response = self._client.table(self._table_name).update(data).eq("badge_id", badge_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update badge")
        except Exception as e:
            logger.error(f"Error updating badge: {e}")
            raise

    def deleteBadge(self, badge_id: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("badge_id", badge_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting badge {badge_id}: {e}")
            raise
