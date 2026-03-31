import logging 
from typing import Optional, List
from ...Core.Entity.UserAvatarEntity import UserAvatarEntity
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)


class UserAvatarRepository: 
    
    def __init__(self):
        self._client = supabase
        self._table_name = "user_avatar"
        
    
    # Helpers to convert database data to UserAvatarEntity
    def dataToEntity(self, data: dict) -> UserAvatarEntity:
        try:
            # Convert ISO string timestamps back to datetime objects if needed
            from datetime import datetime
            if 'created_at' in data and isinstance(data['created_at'], str):
                data['created_at'] = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
            if 'last_updated' in data and isinstance(data['last_updated'], str):
                data['last_updated'] = datetime.fromisoformat(data['last_updated'].replace('Z', '+00:00'))
            
            return UserAvatarEntity(**data)
        except Exception as e:
            logger.error(f"Error converting data to UserAvatarEntity: {e}")
            logger.error(f"Data: {data}")
            raise
        
    # Helpers to convert UserAvatarEntity to database data
    def entityToData(self, entity: UserAvatarEntity) -> dict:
        if hasattr(entity, "to_dict") and callable(entity.to_dict):
            return entity.to_dict()
        
        # Convert entity to dict and handle datetime serialization
        data = entity.__dict__.copy()
        
        # Convert datetime objects to ISO format strings for Supabase
        from datetime import datetime
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
        
        return data
    
    
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
    def fetchUserAvatarById(self, user_avatar_id: int) -> Optional[UserAvatarEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("user_avatar_id", user_avatar_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching user avatar by ID: {e}")
            raise

    # Fetch a user avatar by User ID
    def fetchAvatarByUserId(self, user_id: int) -> Optional[UserAvatarEntity]:
        try:
            # Fetch the active avatar for the user
            response = self._client.table(self._table_name).select("*").eq("user_id", user_id).eq("is_active", True).execute()
            if response.data:
                logger.info(f"[UserAvatarRepo] Found active avatar for user {user_id}: user_avatar_id={response.data[0].get('user_avatar_id')}, nickname={response.data[0].get('nickname')}")
                return self.dataToEntity(response.data[0])
            logger.warning(f"[UserAvatarRepo] No active avatar found for user {user_id}")
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
            user_avatar_id = getattr(userAvatar, "user_avatar_id", None)
            
            if user_avatar_id is None:
                raise ValueError("user_avatar_id is required for update")
            
            logger.info(f"[UserAvatarRepo] Updating user_avatar_id={user_avatar_id}")
            logger.info(f"[UserAvatarRepo]   - XP: {data.get('xp')}")
            logger.info(f"[UserAvatarRepo]   - Level: {data.get('level')}")
            
            response = self._client.table(self._table_name).update(data).eq("user_avatar_id", user_avatar_id).execute()
            
            if response.data:
                logger.info(f"[UserAvatarRepo] ✓ Update successful, returned XP: {response.data[0].get('xp')}, Level: {response.data[0].get('level')}")
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update user avatar")
        except Exception as e:
            logger.error(f"Error updating user avatar: {e}")
            raise
    
    # Update only specific fields of a user avatar (partial update)
    def updateUserAvatarFields(self, user_avatar_id: int, fields: dict) -> UserAvatarEntity:
        try:
            # Convert datetime objects to ISO strings
            from datetime import datetime
            update_data = {}
            for key, value in fields.items():
                if isinstance(value, datetime):
                    update_data[key] = value.isoformat()
                else:
                    update_data[key] = value
            
            logger.info(f"[UserAvatarRepo] Partial update for user_avatar_id={user_avatar_id}")
            logger.info(f"[UserAvatarRepo]   - Fields: {list(update_data.keys())}")
            
            response = self._client.table(self._table_name).update(update_data).eq("user_avatar_id", user_avatar_id).execute()
            
            if response.data:
                logger.info(f"[UserAvatarRepo] ✓ Partial update successful")
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update user avatar fields")
        except Exception as e:
            logger.error(f"Error updating user avatar fields: {e}")
            raise

    # Delete a user avatar by ID
    def deleteUserAvatar(self, user_avatar_id: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("user_avatar_id", user_avatar_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting user avatar: {e}")
            raise
            