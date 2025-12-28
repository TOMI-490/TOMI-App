import logging 
from typing import Optional, List
from ...Core.Entity.UserEntity import UserEntity
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)

class UserRepository: 
    
    def __init__(self):
        self._client = supabase
        self._table_name = "User"
        
    
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
            response = self._client.table(self._table_name).select("*").eq("userId", user_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        
        except Exception as e:
            logger.error(f"Error fetching user by ID: {e}")
            raise
    
    # Check if a user exists by email
    def emailExists(self, email: str) -> bool:
        try:
            response = self._client.table(self._table_name).select("userId").eq("email", email).execute()
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
    
    # Create a new user from DTO (without userId and created_at, let database generate them)
    def createUserFromDTO(self, user_dto) -> UserEntity:
        try:
            # Convert DTO to dict, using aliases to match database column names
            data = user_dto.model_dump(by_alias=True)
            
            # Insert into database - userId and created_at will be auto-generated
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
            
            # We need the userId to identify which record to update
            userId = getattr(user,"userId", None)
            
            if not userId:
                raise ValueError("User ID is required for update")
            
            response = self._client.table(self._table_name).update(data).eq("userId", userId).execute()
            
            if response.data: 
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update user")
        
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            raise 
        
    
    # Delete a user by ID
    def deleteUser(self, user_id: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("userId", user_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting user {user_id}: {e}")
            raise