import logging
from typing import Optional, List
from ...Core.Entity.GoalTypeEntity import GoalTypeEntity
from ...Infrastructure.Supabase.db_connection import supabase

logger = logging.getLogger(__name__)

class GoalTypeRepository:
    
    def __init__(self):
        self._client = supabase
        self._table_name = "GoalType"
    
    def dataToEntity(self, data: dict) -> GoalTypeEntity:
        try:
            return GoalTypeEntity(**data)
        except Exception as e:
            logger.error(f"Error converting data to GoalTypeEntity: {e}")
            raise

    def entityToData(self, entity: GoalTypeEntity) -> dict:
        if hasattr(entity, "to_dict") and callable(entity.to_dict):
            return entity.to_dict()
        return entity.__dict__

    def fetchAllGoalTypes(self) -> List[GoalTypeEntity]:
        try:
            response = self._client.table(self._table_name).select("*").execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching all goal types: {e}")
            raise

    def fetchGoalTypeById(self, goal_type_id: int) -> Optional[GoalTypeEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("goalTypeId", goal_type_id).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching goal type {goal_type_id}: {e}")
            raise

    def createGoalType(self, goal_type: GoalTypeEntity) -> GoalTypeEntity:
        try:
            data = self.entityToData(goal_type)
            response = self._client.table(self._table_name).insert(data).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to create goal type")
        except Exception as e:
            logger.error(f"Error creating goal type: {e}")
            raise

    def updateGoalType(self, goal_type: GoalTypeEntity) -> GoalTypeEntity:
        try:
            data = self.entityToData(goal_type)
            goalTypeId = getattr(goal_type, "goalTypeId", None)
            
            if not goalTypeId:
                raise ValueError("Goal Type ID is required for update")
                
            response = self._client.table(self._table_name).update(data).eq("goalTypeId", goalTypeId).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update goal type")
        except Exception as e:
            logger.error(f"Error updating goal type: {e}")
            raise
