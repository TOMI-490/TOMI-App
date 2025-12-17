import logging 
from typing import Optional, List
from ...Core.Entity.ProfileEntity import ProfileEntity 
from ...Infrastructure.Supabase.db_connection import SupabaseConnection


logger = logging.getLogger(__name__)

class ProfileRepository: 
    
    def __init__(self):
        self._client = SupabaseConnection
        self._table_name = "Profile"
        
    
    # Helpers to convert database data to ProfileEntity
    def dataToEntity(self, data: dict) -> ProfileEntity:
        try :
            return ProfileEntity(**data)
        except Exception as e:
            logger.error(f"Error converting data to ProfileEntity: {e}")
            raise

    # Helpers to convert ProfileEntity to database data
    def entityToData(self, profile: ProfileEntity) -> dict:
        if hasattr(profile, "to_dict") and callable(profile.to_dict):
            return profile.to_dict()
        return profile.__dict__
    
    #============================================================================================================
    # CRUD Operations
    
    # Fetch all profiles
    def fetchAllProfiles(self) -> List[ProfileEntity]:
        try:
            response = self._client.table(self._table_name).select("*").execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching all profiles: {e}")
            raise

    # Fetch the profile by ID and return as Profile object    
    def fetchProfileById(self, profile_id: int) -> Optional[ProfileEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("profileId", profile_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching profile by ID: {e}")
            raise
        
   # Create a new profile and return the created Profile object
    def createProfile(self, profile: ProfileEntity) -> ProfileEntity:
        try:
            data = self.entityToData(profile)
            response = self._client.table(self._table_name).insert(data).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to create profile")
        except Exception as e:
            logger.error(f"Error creating profile: {e}")
            raise
        
    
    # Update an existing profile and return the updated Profile object
    def updateProfile(self, profile: ProfileEntity) -> ProfileEntity:
        try: 
            data = self.entityToData(profile)
            response = self._client.table(self._table_name).update(data).eq("profileId", profile.profileId).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update profile")
        except Exception as e:
            logger.error(f"Error updating profile: {e}")
            raise
        
    # Delete a profile by ID
    def deleteProfile(self, profile_id: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("profileId", profile_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting profile {profile_id}: {e}")
            raise
        
        
    
     