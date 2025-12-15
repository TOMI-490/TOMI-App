import logging 
from typing import Optional, List
from ...Core.Entity.WorkoutEntity import WorkoutEntity
from ...Infrastructure.Supabase.db_connection import SupabaseConnection

logger = logging.getLogger(__name__)

class WorkoutRepository:
    
    def __init__(self):
        self._client = SupabaseConnection
        self._table_name = "Workout"
        
    
    # Helpers to convert database data to WorkoutEntity
    def dataToEntity(self, data : dict) -> WorkoutEntity:
        try :
            return WorkoutEntity(**data)
        except Exception as e:
            logger.error(f"Error converting data to WorkoutEntity: {e}")
            raise
        
    # Helpers to convert WorkoutEntity to database data
    def entityToData(self, workout: WorkoutEntity) -> dict:
        if hasattr(workout, "to_dict") and callable(workout.to_dict):
            return workout.to_dict()
        return workout.__dict__
    
    
    #============================================================================================================
    # CRUD Operations
    
    # fetch workouts by user ID and return them as a list of Workout objects
    def fetchWorkoutsByUserId(self, userId: int) -> List[WorkoutEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("userId", userId).execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching workouts by user ID: {e}")
            raise
        
    def createWorkout (self, workout: WorkoutEntity) -> WorkoutEntity:
        try:
            data = self.entityToData(workout)
            response = self._client.table(self._table_name).insert(data).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to create workout")
        except Exception as e:
            logger.error(f"Error creating workout: {e}")
            raise
    
    
    