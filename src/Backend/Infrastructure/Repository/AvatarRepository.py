import logging
from typing import Optional, List
from ...Core.Entity.AvatarEntity import AvatarEntity
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)

class AvatarRepository:
    
    def __init__(self):
        self._client = supabase
        self._table_name = "avatar"
    
    def dataToEntity(self, data: dict) -> AvatarEntity:
        try:
            return AvatarEntity(**data)
        except Exception as e:
            logger.error(f"Error converting data to AvatarEntity: {e}")
            raise

    def entityToData(self, entity: AvatarEntity) -> dict:
        if hasattr(entity, "to_dict") and callable(entity.to_dict):
            return entity.to_dict()
        return entity.__dict__

    def fetchAllAvatars(self) -> List[AvatarEntity]:
        try:
            response = self._client.table(self._table_name).select("*").execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching all avatars: {e}")
            raise

    def fetchAvatarById(self, avatar_id: int) -> Optional[AvatarEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("avatar_id", avatar_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching avatar {avatar_id}: {e}")
            raise

    def fetchDefaultAvatars(self) -> List[AvatarEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("isDefault", True).execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching default avatars: {e}")
            raise

    def createAvatar(self, avatar: AvatarEntity) -> AvatarEntity:
        try:
            data = self.entityToData(avatar)
            response = self._client.table(self._table_name).insert(data).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to create avatar")
        except Exception as e:
            logger.error(f"Error creating avatar: {e}")
            raise

    def updateAvatar(self, avatar: AvatarEntity) -> AvatarEntity:
        try:
            data = self.entityToData(avatar)
            avatar_id = getattr(avatar, "avatar_id", None)
            
            if not avatar_id:
                raise ValueError("Avatar ID is required for update")
            
            response = self._client.table(self._table_name).update(data).eq("avatar_id", avatar_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update avatar")
        except Exception as e:
            logger.error(f"Error updating avatar: {e}")
            raise

    def deleteAvatar(self, avatar_id: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("avatar_id", avatar_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting avatar {avatar_id}: {e}")
            raise
