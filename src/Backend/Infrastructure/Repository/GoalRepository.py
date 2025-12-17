import logging 
from typing import Optional, List
from ...Core.Entity.GoalEntity import GoalEntity
from ...Infrastructure.Supabase.db_connection import SupabaseConnection

logger = logging.getLogger(__name__)

class GoalRepository:
    
    def __init__(self):
        self._client = SupabaseConnection
        self._table_name = "Goal"
        
    
    # Helpers to convert database data to GoalEntity
    def dataToEntity(self, data : dict) -> GoalEntity:
        try :
            return GoalEntity(**data)
        except Exception as e:
            logger.error(f"Error converting data to GoalEntity: {e}")
            raise
        
    # Helpers to convert GoalEntity to database data
    def entityToData(self, goal: GoalEntity) -> dict:
        if hasattr(goal, "to_dict") and callable(goal.to_dict):
            return goal.to_dict()
        return goal.__dict__
    
    
    #============================================================================================================
    # CRUD Operations
    
    # fetch all goals
    def fetchAllGoals(self) -> List[GoalEntity]:
        try:
            response = self._client.table(self._table_name).select("*").execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching all goals: {e}")
            raise

    # fetch goal by ID
    def fetchGoalById(self, goalId: int) -> Optional[GoalEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("goalId", goalId).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching goal by ID: {e}")
            raise

    # fetch goals by user ID and return them as a list of Goal objects
    def fetchGoalsByUserId(self, userId: int) -> List[GoalEntity]:
        try:
            response = self._client.table(self._table_name).select("*").eq("userId", userId).execute()
            return [self.dataToEntity(record) for record in response.data]
        except Exception as e:
            logger.error(f"Error fetching goals by user ID: {e}")
            raise
        
    # Create a new goal and return the created Goal object
    def createGoal(self, goal: GoalEntity) -> GoalEntity:
        try:
            data = self.entityToData(goal)
            response = self._client.table(self._table_name).insert(data).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to create goal")
        except Exception as e:
            logger.error(f"Error creating goal: {e}")
            raise
        
    # Update an existing goal and return the updated Goal object
    def updateGoal(self, goal: GoalEntity) -> GoalEntity:
        try: 
            data = self.entityToData(goal)
            goalId  = getattr(goal, "goalId", None)
            
            if goalId is None:
                raise ValueError("Goal ID is required for update")
            
            response = self._client.table(self._table_name).update(data).eq("goalId", goalId).execute()
            if response.data:
                return self.dataToEntity(response.data[0])
            raise Exception("Failed to update goal")
        except Exception as e:
            logger.error(f"Error updating goal: {e}")
            raise
        
        
    # Delete a goal by ID
    def deleteGoal(self, goalId: int) -> bool:
        try:
            self._client.table(self._table_name).delete().eq("goalId", goalId).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting goal: {e}")
            raise