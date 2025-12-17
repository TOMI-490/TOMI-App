import logging
from typing import Optional, List
from ...Core.Entity.WorkoutTypeEntity import WorkoutTypeEntity
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)

class WorkoutTypeRepository:
    
    def __init__(self):
        self._client = supabase
        self._table_name = "WorkoutType"
    
    def dataToEntity(self, data: dict) -> WorkoutTypeEntity:
        try:
            return WorkoutTypeEntity(**data)
        except Exception as e:
            logger.error(f"Error converting data to WorkoutTypeEntity: {e}")
            raise

    def entityToData(self, entity: WorkoutTypeEntity) -> dict:
        if hasattr(entity, "to_dict") and callable(entity.to_dict):
            return entity.to_dict()
        return entity.__dict__

    def fetchAllWorkoutTypes(self) -> List[WorkoutTypeEntity]:
        try:
            response = self._client.table(self._table_name).select("*").execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching all workout types: {e}")
            raise

    def fetchWorkoutTypeById(self, workout_type_id: int) -> Optional[WorkoutTypeEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("workoutTypeId", workout_type_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching workout type {workout_type_id}: {e}")
            raise

    def createWorkoutType(self, workout_type: WorkoutTypeEntity) -> WorkoutTypeEntity:
        try:
            data = self.entityToData(workout_type)
            response = self._client.table(self._table_name).insert(data).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to create workout type")
        except Exception as e:
            logger.error(f"Error creating workout type: {e}")
            raise

    def updateWorkoutType(self, workout_type: WorkoutTypeEntity) -> WorkoutTypeEntity:
        try:
            data = self.entityToData(workout_type)
            workoutTypeId = getattr(workout_type, "workoutTypeId", None)
            
            if not workoutTypeId:
                raise ValueError("Workout Type ID is required for update")
                
            response = self._client.table(self._table_name).update(data).eq("workoutTypeId", workoutTypeId).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update workout type")
        except Exception as e:
            logger.error(f"Error updating workout type: {e}")
            raise

    def deleteWorkoutType(self, workout_type_id: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("workoutTypeId", workout_type_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting workout type {workout_type_id}: {e}")
            raise
