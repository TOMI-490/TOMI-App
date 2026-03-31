import logging
from typing import Optional, List
from ...Core.Entity.LeaderboardEntity import LeaderboardEntity
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)

class LeaderboardRepository:
    
    def __init__(self):
        self._client = supabase
        self._table_name = "leaderboard"
    
    def dataToEntity(self, data: dict) -> LeaderboardEntity:
        try:
            return LeaderboardEntity(**data)
        except Exception as e:
            logger.error(f"Error converting data to LeaderboardEntity: {e}")
            raise

    def entityToData(self, entity: LeaderboardEntity) -> dict:
        if hasattr(entity, "to_dict") and callable(entity.to_dict):
            return entity.to_dict()
        return entity.__dict__

    def fetchLeaderboardByScope(self, scope: str) -> List[LeaderboardEntity]:
        try:
            response = self._client.table(self._table_name)\
                .select("*")\
                .eq("scope", scope)\
                .order("rank", desc=False)\
                .execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching leaderboard for scope {scope}: {e}")
            raise

    def fetchUserLeaderboardEntries(self, user_id: int) -> List[LeaderboardEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("user_id", user_id).execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching leaderboard entries for user {user_id}: {e}")
            raise

    def fetchTopRankers(self, scope: str, limit: int = 10) -> List[LeaderboardEntity]:
        try:
            response = self._client.table(self._table_name)\
                .select("*")\
                .eq("scope", scope)\
                .order("rank", desc=False)\
                .limit(limit)\
                .execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching top rankers for scope {scope}: {e}")
            raise

    def fetchLeaderboardById(self, leaderboard_id: int) -> Optional[LeaderboardEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("leaderboard_id", leaderboard_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching leaderboard entry {leaderboard_id}: {e}")
            raise

    def createLeaderboardEntry(self, entry: LeaderboardEntity) -> LeaderboardEntity:
        try:
            data = self.entityToData(entry)
            response = self._client.table(self._table_name).insert(data).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to create leaderboard entry")
        except Exception as e:
            logger.error(f"Error creating leaderboard entry: {e}")
            raise

    def updateLeaderboardEntry(self, entry: LeaderboardEntity) -> LeaderboardEntity:
        try:
            data = self.entityToData(entry)
            leaderboard_id = getattr(entry, "leaderboard_id", None)
            
            if not leaderboard_id:
                raise ValueError("Leaderboard ID is required for update")
            
            response = self._client.table(self._table_name).update(data).eq("leaderboard_id", leaderboard_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update leaderboard entry")
        except Exception as e:
            logger.error(f"Error updating leaderboard entry: {e}")
            raise

    def deleteLeaderboardEntry(self, leaderboard_id: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("leaderboard_id", leaderboard_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting leaderboard entry {leaderboard_id}: {e}")
            raise
