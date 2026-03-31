import logging
from typing import Optional, List
from ...Core.Entity.StreakEntity import StreakEntity
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)

class StreakRepository:
    
    def __init__(self):
        self._client = supabase
        self._table_name = "streak"
    
    def dataToEntity(self, data: dict) -> StreakEntity:
        try:
            return StreakEntity(**data)
        except Exception as e:
            logger.error(f"Error converting data to StreakEntity: {e}")
            raise

    def entityToData(self, entity: StreakEntity) -> dict:
        if hasattr(entity, "to_dict") and callable(entity.to_dict):
            return entity.to_dict()
        return entity.__dict__

    def fetchAllStreaks(self) -> List[StreakEntity]:
        try:
            response = self._client.table(self._table_name).select("*").execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching all streaks: {e}")
            raise

    def fetchStreakById(self, streak_id: int) -> Optional[StreakEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("streak_id", streak_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching streak {streak_id}: {e}")
            raise

    def fetchStreaksByUserId(self, user_id: int) -> List[StreakEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("user_id", user_id).execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching streaks for user {user_id}: {e}")
            raise

    def fetchStreakByMetric(self, user_id: int, metric: str) -> Optional[StreakEntity]:
        try:
            response = self._client.table(self._table_name)\
                .select("*")\
                .eq("user_id", user_id)\
                .eq("metric", metric)\
                .execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching streak for user {user_id} and metric {metric}: {e}")
            raise

    def createStreak(self, streak: StreakEntity) -> StreakEntity:
        try:
            data = self.entityToData(streak)
            response = self._client.table(self._table_name).insert(data).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to create streak")
        except Exception as e:
            logger.error(f"Error creating streak: {e}")
            raise

    def updateStreak(self, streak: StreakEntity) -> StreakEntity:
        try:
            data = self.entityToData(streak)
            streak_id = getattr(streak, "streak_id", None)
            
            if not streak_id:
                raise ValueError("Streak ID is required for update")
            
            response = self._client.table(self._table_name).update(data).eq("streak_id", streak_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update streak")
        except Exception as e:
            logger.error(f"Error updating streak: {e}")
            raise

    def deleteStreak(self, streak_id: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("streak_id", streak_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting streak {streak_id}: {e}")
            raise
