import logging 
from typing import Optional, List
from ...Core.Entity.UserEntity import UserEntity
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)

class UserRepository: 
    
    def __init__(self):
        self._client = supabase
        self._table_name = "user"
        
    
    # Helpers to convert database data to UserEntity
    def dataToEntity(self, data: dict) -> UserEntity:
        
        try :
            return UserEntity(**data)
        
        except Exception as e:
            logger.error(f"Error converting data to UserEntity: {e}")
            raise

    # Helpers to convert UserEntity to database data
    def entityToData(self, user: UserEntity) -> dict:
        
        if hasattr(user, "to_dict") and callable(user.to_dict):
            return user.to_dict()
        return user.__dict__

#============================================================================================================
    # CRUD Operations 
    
    # Fetch all users and return them as User objects
    def fetchAllUsers(self) -> List[UserEntity]:
        try: 
            response = self._client.table(self._table_name).select("*").execute()
            return [self.dataToEntity(record) for record in response.data]
        
        except Exception as e:
            logger.error(f"Error fetching users: {e}")
            raise
    
    
    # Fetch a user by ID and return as User object
    def fetchUserById(self, user_id: int) -> Optional[UserEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("user_id", user_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        
        except Exception as e:
            logger.error(f"Error fetching user by ID: {e}")
            raise
    
    # Check if a user exists by email
    def emailExists(self, email: str) -> bool:
        try:
            response = self._client.table(self._table_name).select("user_id").eq("email", email).execute()
            return len(response.data) > 0
        
        except Exception as e:
            logger.error(f"Error checking if email exists: {e}")
            raise
        
    # Create a new user and return the created User object
    def createUser(self, user: UserEntity) -> UserEntity:
        try: 
            
            # Convert UserEntity to dict for insertion
            data = self.entityToData(user)
            
            # Remove keys with None values to avoid inserting them
            response = self._client.table(self._table_name).insert(data).execute()
            
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to create user")    
        
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    # Create a new user from DTO (without user_id and created_at, let database generate them)
    def createUserFromDTO(self, user_dto) -> UserEntity:
        try:
            # Convert DTO to dict - do NOT use by_alias, keep field names as snake_case for database
            data = user_dto.model_dump(by_alias=False, exclude_none=True)
            
            # Insert into database - user_id and created_at will be auto-generated
            response = self._client.table(self._table_name).insert(data).execute()
            
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to create user")
        
        except Exception as e:
            logger.error(f"Error creating user from DTO: {e}")
            raise
        
    
    # Update an existing user and return the updated User Object 
    def updateUser(self, user: UserEntity) -> UserEntity:
        try: 
            # Convert UserEntity to dict for update
            data = self.entityToData(user)
            
            # We need the user_id to identify which record to update
            user_id = getattr(user,"user_id", None)
            
            if not user_id:
                raise ValueError("User ID is required for update")
            
            response = self._client.table(self._table_name).update(data).eq("user_id", user_id).execute()
            
            if response.data: 
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update user")
        
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            raise 
        
    
    # Delete a user by ID
    def deleteUser(self, user_id: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("user_id", user_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting user {user_id}: {e}")
            raise
    
    # Fetch a user by auth_id
    def fetchUserByAuthId(self, auth_id: str) -> Optional[UserEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("auth_id", auth_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching user by auth_id: {e}")
            raise
    
    # Fetch a user by email
    def fetchUserByEmail(self, email: str) -> Optional[UserEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("email", email).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching user by email: {e}")
            raise
    
    # Update user's language
    def updateUserLanguage(self, user_id: int, language: str) -> UserEntity:
        try:
            response = self._client.table(self._table_name).update({"language": language}).eq("user_id", user_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update user language")
        except Exception as e:
            logger.error(f"Error updating user language: {e}")
            raise