import logging 
from typing import Optional, List
from ...Core.Entity.UserAvatarEntity import UserAvatarEntity
from ...Infrastructure.Supabase.db_connection import SupabaseConnection

logger = logging.getLogger(__name__)


class UserAvatarRepository: 
    
    def __init__(self):
        self._client = SupabaseConnection
        self._table_name = "UserAvatar"
        
    
    # Helpers to convert database data to UserAvatarEntity
    def dataToEntity(self, data: dict) -> UserAvatarEntity:
        try: 
            return UserAvatarEntity(**data)
        except Exception as e:
            logger.error(f"Error converting data to UserAvatarEntity: {e}")
            raise
        
    # Helpers to convert UserAvatarEntity to database data
    def entityToData(self, entity: UserAvatarEntity) -> dict:
        if hasattr(entity, "to_dict") and callable(entity.to_dict):
            return entity.to_dict()
        return entity.__dict__
    
    
    #============================================================================================================
    # CRUD Operations
    
    # Fetch all user avatars
    def fetchAllUserAvatars(self) -> List[UserAvatarEntity]:
        try:
            response = self._client.table(self._table_name).select("*").execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching all user avatars: {e}")
            raise

    # Fetch a user avatar by ID and return as UserAvatar object
    def fetchUserAvatarById(self, userAvatarId: int) -> Optional[UserAvatarEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("userAvatarId", userAvatarId).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching user avatar by ID: {e}")
            raise

    # Fetch a user avatar by User ID
    def fetchAvatarByUserId(self, userId: int) -> Optional[UserAvatarEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("userId", userId).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching user avatar by User ID: {e}")
            raise
        
    # Create a new user avatar
    def createUserAvatar(self, userAvatar: UserAvatarEntity) -> UserAvatarEntity:
        try:
            data = self.entityToData(userAvatar)
            response = self._client.table(self._table_name).insert(data).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to create user avatar")
        except Exception as e:
            logger.error(f"Error creating user avatar: {e}")
            raise
        
    # Update an existing user avatar and return the updated UserAvatar object
    def updateUserAvatar(self, userAvatar: UserAvatarEntity) -> UserAvatarEntity:
        try: 
            data = self.entityToData(userAvatar)
            userAvatarId = getattr(userAvatar, "userAvatarId", None)
            
            if userAvatarId is None:
                raise ValueError("userAvatarId is required for update")
            
            response = self._client.table(self._table_name).update(data).eq("userAvatarId", userAvatarId).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update user avatar")
        except Exception as e:
            logger.error(f"Error updating user avatar: {e}")
            raise

    # Delete a user avatar by ID
    def deleteUserAvatar(self, userAvatarId: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("userAvatarId", userAvatarId).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting user avatar: {e}")
            raise
            