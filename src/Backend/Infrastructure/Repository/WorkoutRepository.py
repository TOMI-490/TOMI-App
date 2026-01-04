import logging 
from typing import Optional, List
from ...Core.Entity.WorkoutEntity import WorkoutEntity
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)

class WorkoutRepository:
    
    def __init__(self):
        self._client = supabase
        self._table_name = "workout"
        
    
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
    
    # fetch all workouts
    def fetchAllWorkouts(self) -> List[WorkoutEntity]:
        try:
            response = self._client.table(self._table_name).select("*").execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching all workouts: {e}")
            raise

    # fetch workout by ID
    def fetchWorkoutById(self, workout_id: int) -> Optional[WorkoutEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("workout_id", workout_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching workout by ID: {e}")
            raise

    # fetch workouts by user ID and return them as a list of Workout objects
    def fetchWorkoutsByUserId(self, user_id: int) -> List[WorkoutEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("user_id", user_id).execute()
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
    
    def updateWorkout(self, workout: WorkoutEntity) -> WorkoutEntity:
        try:
            data = self.entityToData(workout)
            workout_id = getattr(workout, "workout_id", None)
            
            if not workout_id:
                raise ValueError("Workout ID is required for update")
            
            response = self._client.table(self._table_name).update(data).eq("workout_id", workout_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update workout")
        except Exception as e:
            logger.error(f"Error updating workout: {e}")
            raise

    def deleteWorkout(self, workout_id: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("workout_id", workout_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting workout: {e}")
            raise
    